import {ProjectInfo} from "@main/entity/ProjectInfo";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const update_project_info = async (obj: ProjectInfo) => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.projectInfo.updateProjectInfo, obj))
    return data
}

export const find_by_project_id = async (projectId: string): Promise<ProjectInfo> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.projectInfo.findByProjectId, projectId))
    return data
}

export const get_project_by_pro_abbr = async (projectAbbr: string): Promise<ProjectInfo> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.projectInfo.getProjectByProAbbr, projectAbbr))
    return data
}

export const get_project_by_table_abbr = async (tableAbbr: string): Promise<ProjectInfo> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.projectInfo.getProjectByTableAbbr, tableAbbr))
    return data
}

// 根据cjCron与项目名称查询，仅会查询到cjCron包含queryParam或cjCron不为NULL且projectName包含queryParam的数据
export const get_project_by_cj_cron_and_project_name = async (queryParam: string): Promise<ProjectInfo[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.projectInfo.getProjectCjCron, queryParam))
    return data
}

// 通过CjCron是否为null获取项目信息
export const get_project_by_cj_cron_is_null = async (nullable: boolean): Promise<ProjectInfo[]> => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.projectInfo.getProjectByCjCronIsNull, nullable))
    return data
}

export const update_cj_cron = async (obj: { projectName?: string, projectId: string, cron: string }) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.projectInfo.updateCjCron, JSON.stringify(obj)))
    return data
}

export const get_project_info = async (): Promise<ProjectInfo[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.projectInfo.getProjectInfo))
    return data
}
