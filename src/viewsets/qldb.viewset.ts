import {
  PooledQldbDriver,
  Result,
  createQldbWriter,
} from 'amazon-qldb-driver-nodejs';
import { ViewSet, ViewSetQuery } from 'nest-rest-framework';
import { getFirstResult, ionToJSON, writeValueAsIon } from '../qldb.utilities';

import { IonResult } from '../models';

export abstract class QldbViewSet<DataT> extends ViewSet<string, DataT> {
  constructor(readonly driver: PooledQldbDriver, readonly tableName: string) {
    super();
  }

  async query(query: ViewSetQuery): Promise<DataT[]> {
    const fields = !!query.fields ? query.fields.join(', ') : '*';
    const filter = !!query.filter ? query.filter : '1 = 1';
    const statement = `SELECT ${fields} FROM ${this.tableName} WHERE ${filter}`;
    const session = await this.getSession();
    const response: Result = await session.executeLambda(
      async txn => await txn.executeInline(statement),
    );
    session.close();
    return response.getResultList().map(x => (x.value() as unknown) as DataT);
  }

  async create(data: DataT): Promise<DataT> {
    const statement = `INSERT INTO ${this.tableName} ?`;
    const documentsWriter = createQldbWriter();
    writeValueAsIon(data, documentsWriter);
    const session = await this.getSession();
    const response = await session.executeLambda(
      async txn =>
        await getFirstResult(txn.executeInline(statement, [documentsWriter])),
    );
    session.close();
    return response;
  }

  async retrieve(pk: string): Promise<DataT> {
    const statement = `SELECT id, t.* FROM ${this.tableName} as t BY id where id = ?`;
    const pkParameter = createQldbWriter();
    pkParameter.writeString(pk);
    const session = await this.getSession();
    const result = await session.executeLambda(
      async txn =>
        await getFirstResult(txn.executeInline(statement, [pkParameter])),
    );
    session.close();
    return ionToJSON(result) as DataT;
  }

  async replace(pk: string, data: DataT): Promise<DataT> {
    throw new Error('Method not implemented.');
  }

  async modify(pk: string, data: DataT): Promise<DataT> {
    throw new Error('Method not implemented.');
  }

  async destroy(pk: string): Promise<void> {
    const statement = `DELETE FROM ${this.tableName} as t BY id where id = ?`;
    const pkParameter = createQldbWriter();
    pkParameter.writeString(pk);
    const session = await this.getSession();
    await session.executeLambda(
      async txn => await txn.executeInline(statement, [pkParameter]),
    );
    session.close();
  }

  async history(pk): Promise<Array<IonResult<DataT>>> {
    const statement: string = `SELECT * FROM history( ${this.tableName} ) AS h
        WHERE h.metadata.id = ?`;
    const pkParameter = createQldbWriter();
    pkParameter.writeString(pk);
    const session = await this.getSession();
    const response: Result = await session.executeLambda(
      async txn => await txn.executeInline(statement, [pkParameter]),
    );
    session.close();
    return response.getResultList().map(x => {
      return ionToJSON(x);
    }) as Array<IonResult<DataT>>;
  }

  async createTable(): Promise<number> {
    const statement = `CREATE TABLE ${this.tableName}`;
    const session = await this.getSession();
    const response: Result = await session.executeLambda(
      async txn => await txn.executeInline(statement),
    );
    session.close();
    return response.getResultList().length;
  }

  private async getSession() {
    return await this.driver.getSession();
  }
}
