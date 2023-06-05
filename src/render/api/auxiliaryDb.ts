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

export const get_auth_token = async () => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getAuthToken))
    return data
}

export const update_auth_token = async (token: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateAuthToken, token))
    return data
}

export const get_table_sql = async (obj?: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.getTableSql, JSON.stringify(obj)))
    return data
}

export const update_table_sql = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.updateTableSql, obj))
    return data
}
