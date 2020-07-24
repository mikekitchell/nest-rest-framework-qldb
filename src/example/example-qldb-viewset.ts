import { ExampleModel } from './example.model';
import { Injectable } from '@nestjs/common';
import { QldbDriver } from 'amazon-qldb-driver-nodejs';
import { QldbViewSet } from '../viewsets';

@Injectable()
export class ExampleQldbViewset extends QldbViewSet<ExampleModel> {
  constructor(readonly driver: QldbDriver) {
    super(driver, 'example-model');
  }
}
