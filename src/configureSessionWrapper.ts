import { NextFunction, Request, Response } from 'express';
import { SessionWrapperData } from './SessionWrapperData';

export const convertSessionMethodToPromise =
  (req: Request) => (method: (cb: (err: unknown) => void) => void) =>
    new Promise<void>((resolve, reject) => {
      method.bind(req.session)((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

export const validateAbsoluteTimeout = (absoluteTimeout?: number) => {
  if (
    absoluteTimeout !== undefined &&
    (Number.isNaN(Number(absoluteTimeout)) || Number(absoluteTimeout) <= 0)
  )
    throw new Error(
      'absoluteTimeout must be a number greater than zero or undefined',
    );
};

export const shouldDestroySession = (
  createdAt?: number,
  absoluteTimeout?: number,
) =>
  createdAt &&
  absoluteTimeout &&
  Number(createdAt) + Number(absoluteTimeout) < Date.now();

interface ConfigureSessionWrapperProps {
  absoluteTimeoutInMilliseconds?: number;
}

export const configureSessionWrapper = ({
  absoluteTimeoutInMilliseconds: absoluteTimeout,
}: ConfigureSessionWrapperProps) => {
  validateAbsoluteTimeout(absoluteTimeout);

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

    if (shouldDestroySession(req.session.createdAt, absoluteTimeout)) {
      await destroySession();
    }
    next();
  };
};
