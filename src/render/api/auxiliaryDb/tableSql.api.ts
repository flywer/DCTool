import {TableSql} from "@main/entity/TableSql";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_table_sql = async (obj?: Partial<TableSql>): Promise<TableSql[]> => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.tableSql.getTableSql, obj))
    return data
}

export const update_table_sql = async (obj: Partial<TableSql>) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.tableSql.updateTableSql, obj))
    return data
}
