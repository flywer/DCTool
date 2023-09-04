import {PreDatabase} from "@main/entity/PreDatabase";
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
