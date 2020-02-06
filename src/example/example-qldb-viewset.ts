import { Inject, Injectable } from '@nestjs/common';

import { ExampleModel } from './example.model';
import { QLDB_SESSION_TOKEN } from '../tokens';
import { QldbSession } from 'amazon-qldb-driver-nodejs';
import { QldbViewSet } from '../viewsets';

@Injectable()
export class ExampleQldbViewset extends QldbViewSet<ExampleModel> {
  constructor(@Inject(QLDB_SESSION_TOKEN) readonly session: QldbSession) {
    super(session, 'example-model');
  }
}
