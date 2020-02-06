import {
  QldbSession,
  Result,
  createQldbWriter,
} from 'amazon-qldb-driver-nodejs';
import { ViewSet, ViewSetQuery } from 'nest-rest-framework';
import { getFirstResult, writeValueAsIon } from '../qldb.utilities';

export abstract class QldbViewSet<DataT> extends ViewSet<string, DataT> {
  constructor(readonly session: QldbSession, readonly tableName: string) {
    super();
  }

  async query(query: ViewSetQuery): Promise<DataT[]> {
    const fields = !!query.fields ? query.fields.join(', ') : '*';
    const filter = !!query.filter ? query.filter : '1 = 1';
    const statement = `SELECT ${fields} FROM ${this.tableName} WHERE ${filter}`;
    const response: Result = await this.session.executeLambda(
      async txn => await txn.executeInline(statement),
    );
    return response.getResultList().map(x => (x.value() as unknown) as DataT);
  }

  async create(data: DataT): Promise<DataT> {
    const statement = `INSERT INTO ${this.tableName} ?`;
    const documentsWriter = createQldbWriter();
    writeValueAsIon(data, documentsWriter);
    return await this.session.executeLambda(
      async txn =>
        await getFirstResult(txn.executeInline(statement, [documentsWriter])),
    );
  }

  async retrieve(pk: string): Promise<DataT> {
    const statement = `SELECT id, t.* FROM ${this.tableName} as t BY id where id = ?`;
    const pkParameter = createQldbWriter();
    pkParameter.writeString(pk);
    return await this.session.executeLambda(
      async txn =>
        await getFirstResult(txn.executeInline(statement, [pkParameter])),
    );
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
    await this.session.executeLambda(
      async txn => await txn.executeInline(statement, [pkParameter]),
    );
  }

  async history(pk): Promise<DataT[]> {
    const statement: string = `SELECT * FROM history( ${this.tableName} ) AS h
        WHERE h.metadata.id = ?`;
    const pkParameter = createQldbWriter();
    pkParameter.writeString(pk);
    const response: Result = await this.session.executeLambda(
      async txn => await txn.executeInline(statement, [pkParameter]),
    );
    return response.getResultList().map(x => (x.value() as unknown) as DataT);
  }

  async createTable(): Promise<number> {
    const statement = `CREATE TABLE ${this.tableName}`;
    const response: Result = await this.session.executeInline(statement);
    return response.getResultList().length;
  }
}
