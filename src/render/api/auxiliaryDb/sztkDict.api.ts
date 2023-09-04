import {GdsztkDict} from "@main/entity/GdsztkDict";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_sztk_dict = async (obj: Partial<GdsztkDict>): Promise<GdsztkDict[]> => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.sztkDict.getSztkDict,obj))
    return data
}

export const save_sztk_dict = async (obj: GdsztkDict[]) => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.sztkDict.saveSztkDict, obj))
    return data
}

export const get_parent_dict = async (dictName?: string): Promise<GdsztkDict[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.sztkDict.getParentDict, dictName))
    return data
}

export const get_dict_by_parent_id = async (parentId: string): Promise<GdsztkDict[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.sztkDict.getDictByParentId, parentId))
    return data
}

export const get_dict_by_bz_id = async (bzId: string): Promise<GdsztkDict> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.sztkDict.getDictByBzId, bzId))
    return data
}
