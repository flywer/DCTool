import {AppDataSource} from "@main/dataSource/data-source";
import {TableSql} from "@main/entity/TableSql";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {Like} from "typeorm";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";

@Controller()
export class TableSqlController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.tableSql.getTableSql)
    public async handleGetTableSql(obj: Partial<TableSql>) {
        let queryVar: FindOptionsWhere<TableSql>[] = []

        if (obj == 'undefined') {
            queryVar = []
        } else {
            if (obj?.tableName !== undefined) {
                queryVar.push({
                    tableName: Like(`%${obj?.tableName || ''}%`)
                })
            }
            if (obj?.comment !== undefined) {
                queryVar.push({
                    comment: Like(`%${obj?.comment || ''}%`)
                })
            }
            if (obj?.sql !== undefined) {
                queryVar.push({
                    sql: Like(`%${obj?.sql || ''}%`)
                })
            }
        }

        return await AppDataSource.manager.find(TableSql, {
            where: queryVar,
            order: {tableName: 'asc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.tableSql.updateTableSql)
    public async handleUpdateTableSql(obj: TableSql) {
        return await AppDataSource.getRepository(TableSql).save(obj)
    }
}
