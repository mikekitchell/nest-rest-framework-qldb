import { ExampleModel } from './example.model';
import { Injectable } from '@nestjs/common';
import { PooledQldbDriver } from 'amazon-qldb-driver-nodejs';
import { QldbViewSet } from '../viewsets';

@Injectable()
export class ExampleQldbViewset extends QldbViewSet<ExampleModel> {
  constructor(readonly driver: PooledQldbDriver) {
    super(driver, 'example-model');
  }
}
