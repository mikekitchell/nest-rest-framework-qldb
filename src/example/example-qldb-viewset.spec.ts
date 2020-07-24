import {
  QldbDriver,
  QldbSession,
  TransactionExecutor,
} from 'amazon-qldb-driver-nodejs';
import { Test, TestingModule } from '@nestjs/testing';

import { ExampleModel } from './example.model';
import { ExampleQldbViewset } from './example-qldb-viewset';
import { makeReader } from 'ion-js';

describe('ExampleQldbViewset', () => {
  let subject: ExampleQldbViewset;
  let driver: QldbDriver;
  let executeLambdaSpy: jest.SpyInstance<
    Promise<any>,
    [
      (transactionExecutor: TransactionExecutor) => any,
      ((retryAttempt: number) => void)?,
    ]
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleQldbViewset,
        {
          provide: QldbDriver,
          useValue: {
            executeLambda: () => null,
          },
        },
      ],
    }).compile();
    subject = module.get<ExampleQldbViewset>(ExampleQldbViewset);
    driver = module.get<QldbDriver>(QldbDriver);
    executeLambdaSpy = jest.spyOn(driver, 'executeLambda');
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
      executeLambdaSpy.mockReturnValue(Promise.resolve({
        getResultList() {
          return [expectedResult];
        },
      }));
      const response = await subject.retrieve('111');
      expect(response).toEqual(expectedResult);
      expect(executeLambdaSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('create()', () => {
    it('should create', async () => {
      const mockObject: ExampleModel = {
        name: 'Ben',
        age: 32,
        gender: 'male',
      };
      const expectedResult: ExampleModel = {
        id: 'myId',
        name: 'Ben',
        age: 32,
        gender: 'male',
      };
      executeLambdaSpy.mockReturnValue(Promise.resolve({
        getResultList() {
          return [{ documentId: 'myId' }];
        },
      }));
      const response = await subject.create(mockObject);
      expect(response).toEqual(expectedResult);
      expect(executeLambdaSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroy()', () => {
    it('should destroy', async () => {
      executeLambdaSpy.mockReturnValue(Promise.resolve());
      await subject.destroy('111');
      expect(executeLambdaSpy).toHaveBeenCalledTimes(1);
    });
  });
});
