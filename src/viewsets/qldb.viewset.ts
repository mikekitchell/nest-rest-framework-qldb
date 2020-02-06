import { ViewSet, ViewSetQuery } from 'nest-rest-framework';
import { TransactionExecutor, QldbWriter, createQldbWriter, Result, QldbSession } from 'amazon-qldb-driver-nodejs';
import { writeValueAsIon } from '../qldb.utilities';


export abstract class QldbViewSet<DataT> extends ViewSet<string, DataT> {

    constructor(private readonly session: QldbSession, 
                private readonly tableName: String,
                private readonly tablePrimaryKeyField: String) {
        super();
    };

    async query(query: ViewSetQuery): Promise<DataT[]> {
        
    }    
    
    async create(data: DataT): Promise<DataT> {
        const statement = `INSERT INTO ${this.tableName} ?`;
        const documentsWriter = createQldbWriter();
        writeValueAsIon(data, documentsWriter);
        return await this.session.executeLambda( async (txn) => await this.getFirstResult(txn.executeInline(statement, [documentsWriter])));
    }
    async retrieve(pk: string): Promise<DataT> {
        const statement = `SELECT id, t.* FROM ${this.tableName} as t BY id where id = ?`
        const pkParameter = createQldbWriter();
        pkParameter.writeString(pk);
        return await this.session.executeLambda( async (txn) => await this.getFirstResult(txn.executeInline(statement, [pkParameter])));
    }
    replace(pk: string, data: DataT): DataT | Promise<DataT> {
        const statement = `Update ${this.tableName} as t by id set ${this.buildSetClause(data)} where id ?`
    }
    modify(pk: string, data: DataT): DataT | Promise<DataT> {
        throw new Error("Method not implemented.");
    }
    destroy(pk: string): void | Promise<void> {
        throw new Error("Method not implemented.");
    }

    private async getFirstResult(promise: Promise<Result>) {
        const response = (await promise).getResultList();
        if (!!response && !!response.length){
            return response[0]
        }
        return null;
    }
}