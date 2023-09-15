import {PageResult, PageVo} from "@common/types";
import {FEDepartTableName} from "@main/entity/FEDepartTableName";
import {PreDatabase} from "@main/entity/PreDatabase";
import {Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_pre_database_depart = async (): Promise<PreDatabase[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.preDatabase.getPreDatabaseDepart))
    return data
}

export const get_pre_database_table_info_json = async (id: string): Promise<PreDatabase> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.preDatabase.getPreDatabaseTableInfoJson, id))
    return data
}

export const update_table_info_json = async (obj: PreDatabase) => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.preDatabase.updateTableInfoJson, obj))
    return data
}

export const update_fe_table_name_by_excel = async (): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.preDatabase.updateFETableNameByExcel)
    return data
}

export const get_fe_table_name_by_page = async (page: PageVo): Promise<PageResult<FEDepartTableName>> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.preDatabase.getFEDepartTableNameByPage, page)
    return data
}

export const download_template = async (): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.preDatabase.downloadTemplate)
    return data
}

export const get_fe_table_name_by_depart_and_table_type = async (departName: string, tableType: string): Promise<FEDepartTableName> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.preDatabase.getInfoByDepartNameAndTableType, departName, tableType)
    return data
}

export const update_FE_TableName = async (model: FEDepartTableName): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.preDatabase.updateFETableName, model)
    return data
}

export const delete_FE_TableName = async (id: number): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.preDatabase.deleteFETableName, id)
    return data
}


