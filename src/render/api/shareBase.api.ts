import {Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_data_volume = async (sql: string): Promise<Result> => {
    const {data} = (await ipcInstance.send<string>(channels.share.getDataVolume, sql))
    return data
}

export const execute_sql = async (sql: string): Promise<any> => {
    const {data} = (await ipcInstance.send<string>(channels.share.executeSql, sql))
    return data
}
