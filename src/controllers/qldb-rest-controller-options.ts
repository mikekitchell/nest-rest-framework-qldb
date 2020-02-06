import { QldbViewSet } from '../viewsets';
import { RestControllerOptions } from 'nest-rest-framework';

export interface QldbRestControllerOptions<DataT, RequestDataT, ResponseDataT>
  extends RestControllerOptions<string, DataT, RequestDataT, ResponseDataT> {
  viewset: QldbViewSet<DataT>;
}
