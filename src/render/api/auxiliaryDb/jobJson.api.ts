import {JobJson} from "@main/entity/JobJson";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

// region 单表融合JSON
export const get_rh_json = async (tableName?: string): Promise<JobJson[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobJson.getRhJson, tableName))
    return data
}

export const get_rh_json_by_id = async (id: number): Promise<JobJson> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobJson.getRhJsonById, id))
    return data
}

export const update_rh1_json = async (obj: Partial<JobJson>) => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.jobJson.updateRh1Json, obj))
    return data
}

// endregion

// region 完整质检JSON
export const get_zj_json = async (tableName?: string): Promise<JobJson[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobJson.getZjJson, tableName))
    return data
}

export const get_zj_json_by_id = async (id: number): Promise<JobJson> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobJson.getZjJsonById, id))
    return data
}

export const update_zj_json = async (obj: Partial<JobJson>) => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.jobJson.updateZjJson, obj))
    return data
}

// endregion

// region 简化质检JSON
export const get_simp_zj_json = async (tableName?: string): Promise<JobJson[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobJson.getSimpZjJson, tableName))
    return data
}

export const get_simp_zj_json_by_id = async (id: number): Promise<JobJson> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobJson.getSimpZjJsonById, id))
    return data
}

export const update_simp_zj_json = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobJson.updateSimpZjJson, JSON.stringify(obj)))
    return data
}

// endregion
