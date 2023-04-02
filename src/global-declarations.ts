import { SessionWrapperData } from './SessionWrapperData';

declare module 'express-session' {
  interface SessionData {
    data: SessionWrapperData;
    createdAt: number;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    sessionWrapper: {
      createSession: (userData: SessionWrapperData) => Promise<void>;
      destroySession: () => Promise<void>;
      getSessionDataIfExists: () => SessionWrapperData | false;
    };
  }
}
