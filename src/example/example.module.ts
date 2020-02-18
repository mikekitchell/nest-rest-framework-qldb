import { ExampleQldbController } from './example-qldb.controller';
import { ExampleQldbViewset } from './example-qldb-viewset';
import { Module } from '@nestjs/common';
import { PooledQldbDriver } from 'amazon-qldb-driver-nodejs';

@Module({
  providers: [
    ExampleQldbViewset,
    {
      provide: PooledQldbDriver,
      useValue: new PooledQldbDriver('fake-ledger'),
    },
  ],
  controllers: [ExampleQldbController],
})
export class ExampleModule {}
