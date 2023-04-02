import { NextFunction, Request, Response } from 'express';
import { SessionWrapperData } from './SessionWrapperData';

const convertSessionMethodToPromise =
  (req: Request) => (method: (cb: (err: unknown) => void) => void) =>
    new Promise<void>((resolve, reject) => {
      method.bind(req.session)((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

interface ConfigureSessionWrapperProps {
  absoluteTimeoutInMilliseconds?: number | false;
  clearCookieOnDestroy?: boolean;
}

export const configureSessionWrapper = ({
  absoluteTimeoutInMilliseconds: absoluteTimeout,
}: ConfigureSessionWrapperProps) => {
  if (
    absoluteTimeout &&
    (Number.isNaN(absoluteTimeout) || absoluteTimeout <= 0)
  )
    throw new Error(
      'absoluteTimeout must be a number greater than zero or undefined',
    );

  return async (req: Request, res: Response, next: NextFunction) => {
    const convert = convertSessionMethodToPromise(req);
    const destroySession = () => convert(req.session.destroy);
    const saveAsync = () => convert(req.session.save);
    const regenerateAsync = async () => convert(req.session.regenerate);
    const setData = (data: SessionWrapperData) => {
      req.session.data = data;
      req.session.createdAt = Date.now();
    };
    const createSession = async (sessionData: SessionWrapperData) => {
      await regenerateAsync();
      setData(sessionData);
      await saveAsync();
    };

    const getSessionDataIfExists = (): SessionWrapperData | false =>
      req.session?.data || false;

    req.sessionWrapper = {
      createSession,
      destroySession,
      getSessionDataIfExists,
    };

    if (
      req.session.createdAt &&
      absoluteTimeout &&
      req.session.createdAt + absoluteTimeout < Date.now()
    ) {
      await destroySession();
    }
    next();
  };
};
