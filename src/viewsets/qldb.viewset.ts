import {
  QldbDriver,
  Result,
} from 'amazon-qldb-driver-nodejs';
import { ViewSet, ViewSetQuery } from 'nest-rest-framework';
import { ionToJSON } from '../qldb.utilities';

export abstract class QldbViewSet<DataT> extends ViewSet<string, DataT> {
  constructor(readonly driver: QldbDriver, readonly tableName: string) {
    super();
  }

  async query(query: ViewSetQuery): Promise<DataT[]> {
    const fields = !!query.fields ? query.fields.join(', ') : '*';
    const filter = !!query.filter ? query.filter : '1 = 1';

    const result = await this.execute([
      `SELECT ${fields}`,
      `FROM ${this.tableName}`,
      `WHERE ${filter}`,
    ].join(' '));

    return this.mapResultsToObjects(result);
  }

  async create(data: DataT): Promise<DataT> {
    const result = await this.execute([
      `INSERT INTO ${this.tableName} ?`,
    ].join(' '), [data]);

    const createResult = this.mapResultsToObjects<{ documentId: string }>(result)?.[0];

    return {
      ...data,
      id: createResult.documentId,
    };
  }

  async retrieve(pk: string): Promise<DataT> {
    const result = await this.execute([
      `SELECT id, t.*`,
      `FROM ${this.tableName} AS t`,
      `BY id WHERE id = ?`,
    ].join(' '), pk);

    return this.mapResultsToObjects<DataT>(result)?.[0];
  }

  async replace(pk: string, data: DataT): Promise<DataT> {
    throw new Error('Method not implemented.');
  }

  async modify(pk: string, data: DataT): Promise<DataT> {
    throw new Error('Method not implemented.');
  }

  async destroy(pk: string): Promise<void> {
    await this.execute([
      `DELETE FROM ${this.tableName}`,
      `BY id WHERE id = ?`,
    ].join(' '), pk);
  }

  async history(pk: string): Promise<DataT[]> {
    const result = await this.execute([
      `SELECT *`,
      `FROM history(${this.tableName}) AS h`,
      `WHERE h.metadata.id = ?`,
    ].join(' '), pk);

    return this.mapResultsToObjects<DataT>(result, 'data');
  }

  async createTable(): Promise<number> {
    const result = await this.execute(`CREATE TABLE ${this.tableName}`);

    return result.getResultList().length;
  }

  private async execute(statement: string, ...parameters: any[]) {
    const result: Result = await this.driver.executeLambda(
      async txn => await txn.execute(statement, ...parameters),
    );

    return result;
  }

  private mapResultsToObjects<T>(result: Result, subproperty?: string): T[] {
    const resultList = result.getResultList();

    return resultList.map(value => {
      const parsedJson = JSON.parse(JSON.stringify(value));

      return subproperty
        ? parsedJson[subproperty]
        : parsedJson;
    });
  }
}
