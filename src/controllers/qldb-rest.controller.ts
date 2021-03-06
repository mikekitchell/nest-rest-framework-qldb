import { Get, Param, Req } from '@nestjs/common';

import { QldbRestControllerOptions } from './qldb-rest-controller-options';
import { RestController } from 'nest-rest-framework';

export abstract class QldbRestController<
  DataT,
  RequestDataT,
  ResponseDataT
> extends RestController<string, DataT, RequestDataT, ResponseDataT> {
  constructor(
    readonly qldbRestControllerOptions: QldbRestControllerOptions<
      DataT,
      RequestDataT,
      ResponseDataT
    >,
  ) {
    super(qldbRestControllerOptions);
  }

  get viewset() {
    return this.qldbRestControllerOptions.viewset;
  }

  @Get('history/:id')
  async getHistory(@Param('id') id: string, @Req() request) {
    await this.runAuthHooks(request);
    const transformedId = await this.transformPrimaryKey(id);
    const data = await this.viewset.history(transformedId);
    return await Promise.all(data);
  }

  @Get('create-table')
  async createTable(@Req() request) {
    await this.runAuthHooks(request);
    return await this.viewset.createTable();
  }
}
