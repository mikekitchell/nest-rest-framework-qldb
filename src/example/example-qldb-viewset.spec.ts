import { QldbSession, TransactionExecutor } from 'amazon-qldb-driver-nodejs';
import { Test, TestingModule } from '@nestjs/testing';

import { ExampleModel } from './example.model';
import { ExampleQldbViewset } from './example-qldb-viewset';
import { QLDB_SESSION_TOKEN } from '../tokens';

describe('ExampleQldbViewset', () => {
  let subject: ExampleQldbViewset;
  let session: QldbSession;
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
          provide: QLDB_SESSION_TOKEN,
          useValue: {
            executeLambda: () => null,
          },
        },
      ],
    }).compile();
    subject = module.get<ExampleQldbViewset>(ExampleQldbViewset);
    session = module.get<QldbSession>(QLDB_SESSION_TOKEN);
    executeLambdaSpy = jest.spyOn(session, 'executeLambda');
  });

  it('should be defined', () => {
    expect(subject).toBeTruthy();
  });
  describe('retrieve()', () => {
    it('should retrieve by key', async () => {
      const mockResponse: ExampleModel = {
        name: 'Ben',
        age: 32,
        gender: 'male',
      };
      executeLambdaSpy.mockReturnValue(Promise.resolve(mockResponse));
      const response = await subject.retrieve('111');
      expect(response).toEqual(mockResponse);
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
      executeLambdaSpy.mockReturnValue(Promise.resolve(mockObject));
      const response = await subject.create(mockObject);
      expect(response).toEqual(mockObject);
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
