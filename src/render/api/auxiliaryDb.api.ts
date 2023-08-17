import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_project_info = async () => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getProjectInfo))
    return data
}

export const get_project_info_by_project_name = async (projectName: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getProjectInfoByProjectName, projectName))
    return data
}

export const update_project_info = async (obj: object) => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.updateProjectInfo, obj))
    return data
}

type ProjectInfo = {
    id: number
    projectId: string
    projectName: string
    projectAbbr: string
    tableAbbr: string
}

export const find_by_project_id = async (projectId: string): Promise<ProjectInfo> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.findByProjectId, projectId))
    return data
}

// 通过项目简称查找项目
export const get_project_by_pro_abbr = async (projectAbbr: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getProjectByProAbbr, projectAbbr))
    return data
}

export const get_project_by_table_abbr = async (tableAbbr: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getProjectByTableAbbr, tableAbbr))
    return data
}

export const get_project_by_project_name = async (projectName: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getProjectByProjectName, projectName))
    return data
}

export const get_project_cj_cron = async (projectName: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getProjectCjCron, projectName))
    return data
}

export const get_project_by_cj_cron_is_null = async (nullable: boolean) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getProjectByCjCronIsNull, nullable))
    return data
}

export const get_cj_cron_by_project_id = async (projectId: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getCjCronByProjectId, projectId))
    return data
}

export const update_cj_cron = async (obj: { projectName?: string, projectId: string, cron: string }) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateCjCron, JSON.stringify(obj)))
    return data
}

export const get_auth_token = async (account: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getAuthTokenByAccount, account))
    return data
}

export const get_max_running_workflow_num = async () => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getMaxRunningWorkFlowJobNum))
    return data
}

export const update_auth_token = async (token: string, account: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateAuthTokenByAccount, token, account))
    return data
}

export type GetTableSqlParams = {
    tableName?: string
    comment?: string
    sql?: string
}

export const get_table_sql = async (obj?: GetTableSqlParams) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getTableSql, JSON.stringify(obj)))
    return data
}

export const update_table_sql = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateTableSql, obj))
    return data
}

export const get_rh_json = async (tableName?: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getRhJson, tableName))
    return data
}

export const get_rh_json_by_id = async (id: number) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getRhJsonById, id))
    return data
}

export const update_rh1_json = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateRh1Json, JSON.stringify(obj)))
    return data
}

export const update_rh2_json = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateRh2Json, JSON.stringify(obj)))
    return data
}

export const get_zj_json = async (tableName?: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getZjJson, tableName))
    return data
}

export const get_simp_zj_json = async (tableName?: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getSimpZjJson, tableName))
    return data
}

export const get_zj_json_by_id = async (id: number) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getZjJsonById, id))
    return data
}

export const get_simp_zj_json_by_id = async (id: number) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getSimpZjJsonById, id))
    return data
}

export const update_zj_json = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateZjJson, JSON.stringify(obj)))
    return data
}

export const update_simp_zj_json = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateSimpZjJson, JSON.stringify(obj)))
    return data
}

export const get_pre_database_depart = async () => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getPreDatabaseDepart))
    return data
}

export const get_pre_database_table_info_json = async (id: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getPreDatabaseTableInfoJson, id))
    return data
}

export const update_table_info_json = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateTableInfoJson, JSON.stringify(obj)))
    return data
}

type GetDictType = {
    dictName: string,
    dictCode: string
}

export const get_sztk_dict = async (obj: GetDictType) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getSztkDict, JSON.stringify(obj)))
    return data
}

type SztkDictType = {
    bzId: string
    dictName: string
    dictCode: string
    parentId: string | null
    orderNum: number
    addTime: string
    cdTime: string
    cdOperation: string
    cdBatch: string
}

export const save_sztk_dict = async (obj: SztkDictType[]) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.saveSztkDict, JSON.stringify(obj)))
    return data
}

export const get_parent_dict = async (dictName?: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getParentDict, dictName))
    return data
}

export const get_dict_by_parent_id = async (parentId: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getDictByParentId, parentId))
    return data
}

export const get_dict_by_bz_id = async (bzId: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getDictByBzId, bzId))
    return data
}