import {
  convertSessionMethodToPromise,
  shouldDestroySession,
  validateAbsoluteTimeout,
} from '../src/configureSessionWrapper';
import { Request } from 'express';

describe('configureSessionWrapper', () => {
  describe('convertSessionMethodToPromise', () => {
    test('Should bind req.session to given method', async () => {
      function methodMock(cb: any) {
        const a = (this as any).test;
        cb();
      }

      const reqMock = {
        session: {
          test: 'string',
        },
      } as unknown as Request;

      await expect(
        convertSessionMethodToPromise(reqMock)(methodMock),
      ).resolves.toBe(undefined);
    });
    test('Should reject with error When callback is called with error', async () => {
      const methodMock = (cb: any) => {
        cb(new Error());
      };

      await expect(
        convertSessionMethodToPromise({} as Request)(methodMock),
      ).rejects.toThrowError();
    });
    test('Should resolve with undefined When callback is called with nothing', async () => {
      const methodMock = (cb: any) => {
        cb();
      };

      await expect(
        convertSessionMethodToPromise({} as Request)(methodMock),
      ).resolves.toBe(undefined);
    });
  });
  describe('validateAbsoluteTimeout', () => {
    test('Should not throw error When absolute timeout is not passed', () => {
      expect(validateAbsoluteTimeout).not.toThrowError();
    });
    test('Should throw error When absolute timeout is not a number nor undefined', () => {
      expect(() =>
        validateAbsoluteTimeout('test' as unknown as number),
      ).toThrowError();
    });
    test('Should throw error When absolute timeout is 0', () => {
      expect(() => validateAbsoluteTimeout(0)).toThrowError();
    });
    test('Should throw error When absolute timeout is number lower than 0', () => {
      expect(() => validateAbsoluteTimeout(-1)).toThrowError();
    });
    test('Should not throw error When absolute timeout is number greater than 0', () => {
      expect(() => validateAbsoluteTimeout(1)).not.toThrowError();
    });
  });
  describe('shouldDestroySession', () => {
    test('Should return falsy value When creation time is undefined', () => {
      expect(shouldDestroySession(undefined, 1)).toBeFalsy();
    });
    test('Should return falsy value When absolute timeout is undefined', () => {
      expect(shouldDestroySession(1, undefined)).toBeFalsy();
    });
    test('Should return truthy value When session absolute timeout expires', () => {
      const mockTimeInMillis = 20;
      jest.useFakeTimers().setSystemTime(mockTimeInMillis);
      expect(shouldDestroySession(mockTimeInMillis - 2, 1)).toBeTruthy();
    });
    test("Should return falsy value When session absolute timeout hasn't expired yet", () => {
      const mockTimeInMillis = 20;
      jest.useFakeTimers().setSystemTime(mockTimeInMillis);
      expect(shouldDestroySession(mockTimeInMillis, 20)).toBeFalsy();
    });
  });
});
