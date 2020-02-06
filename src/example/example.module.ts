import { ExampleQldbController } from './example-qldb.controller';
import { ExampleQldbViewset } from './example-qldb-viewset';
import { Module } from '@nestjs/common';
import { PooledQldbDriver } from 'amazon-qldb-driver-nodejs';
import { QLDB_SESSION_TOKEN } from '../tokens';

@Module({
  providers: [
    ExampleQldbViewset,
    {
      provide: QLDB_SESSION_TOKEN,
      useFactory: async () => {
        const qldbDriver = new PooledQldbDriver('fake-ledger');
        return await qldbDriver.getSession();
      },
    },
  ],
  controllers: [ExampleQldbController],
})
export class ExampleModule {}
