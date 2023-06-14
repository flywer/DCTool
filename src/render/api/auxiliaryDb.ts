import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_project_info = async () => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getProjectInfo))
    return data
}

export const update_project_info = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateProjectInfo, obj))
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

export const get_auth_token = async () => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getAuthToken))
    return data
}

export const update_auth_token = async (token: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateAuthToken, token))
    return data
}

export const get_table_sql = async (obj?: any) => {
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

export const update_rh_json = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateRhJson, JSON.stringify(obj)))
    return data
}

export const get_zj_json = async (tableName?: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getZjJson, tableName))
    return data
}

export const update_zj_json = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateZjJson, JSON.stringify(obj)))
    return data
}
