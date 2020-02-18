import {
  PooledQldbDriver,
  QldbSession,
  TransactionExecutor,
} from 'amazon-qldb-driver-nodejs';
import { Test, TestingModule } from '@nestjs/testing';

import { ExampleModel } from './example.model';
import { ExampleQldbViewset } from './example-qldb-viewset';
import { makeReader } from 'ion-js';

describe('ExampleQldbViewset', () => {
  let subject: ExampleQldbViewset;
  let driver: PooledQldbDriver;
  let session: QldbSession;
  let getSessionSpy: jest.SpyInstance<Promise<QldbSession>, []>;
  let executeLambdaSpy: jest.SpyInstance<
    Promise<any>,
    [
      (transactionExecutor: TransactionExecutor) => any,
      ((retryAttempt: number) => void)?,
    ]
  >;
  let closeSessionSpy: jest.SpyInstance<void, []>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleQldbViewset,
        {
          provide: PooledQldbDriver,
          useValue: {
            getSession: () => null,
          },
        },
      ],
    }).compile();
    subject = module.get<ExampleQldbViewset>(ExampleQldbViewset);
    driver = module.get<PooledQldbDriver>(PooledQldbDriver);
    getSessionSpy = jest.spyOn(driver, 'getSession');
    session = {
      executeLambda: () => null,
      close: () => null,
      executeStatement: () => null,
      getLedgerName: () => null,
      getSessionToken: () => null,
      getTableNames: () => null,
      startTransaction: () => null,
    };
    executeLambdaSpy = jest.spyOn(session, 'executeLambda');
    closeSessionSpy = jest.spyOn(session, 'close');
    getSessionSpy.mockReturnValue(Promise.resolve(session));
  });

  it('should be defined', () => {
    expect(subject).toBeTruthy();
  });
  describe('retrieve()', () => {
    it('should retrieve by key', async () => {
      const expectedResult: ExampleModel = {
        name: 'Ben',
        age: 32,
        gender: 'male',
      };
      const mockResponse = makeReader(JSON.stringify(expectedResult));
      executeLambdaSpy.mockReturnValue(Promise.resolve(mockResponse));
      const response = await subject.retrieve('111');
      expect(response).toEqual(expectedResult);
      expect(getSessionSpy).toHaveBeenCalledTimes(1);
      expect(executeLambdaSpy).toHaveBeenCalledTimes(1);
      expect(closeSessionSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('create()', () => {
    it('should create', async () => {
      const mockObject: ExampleModel = {
        name: 'Ben',
        age: 32,
        gender: 'male',
      };
      executeLambdaSpy.mockReturnValue(Promise.resolve(mockObject));
      const response = await subject.create(mockObject);
      expect(response).toEqual(mockObject);
      expect(getSessionSpy).toHaveBeenCalledTimes(1);
      expect(executeLambdaSpy).toHaveBeenCalledTimes(1);
      expect(closeSessionSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroy()', () => {
    it('should destroy', async () => {
      executeLambdaSpy.mockReturnValue(Promise.resolve());
      await subject.destroy('111');
      expect(getSessionSpy).toHaveBeenCalledTimes(1);
      expect(executeLambdaSpy).toHaveBeenCalledTimes(1);
      expect(closeSessionSpy).toHaveBeenCalledTimes(1);
    });
  });
});
