import { Controller } from '@nestjs/common';
import { ExampleModel } from './example.model';
import { ExampleQldbViewset } from './example-qldb-viewset';
import { QldbRestController } from '../controllers';

@Controller('example-qldb')
export class ExampleQldbController extends QldbRestController<
  ExampleModel,
  ExampleModel,
  ExampleModel
> {
  constructor(readonly exampleViewSet: ExampleQldbViewset) {
    super({
      viewset: exampleViewSet,
    });
  }
}
