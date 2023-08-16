import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_table_data = async (tableName: string, limitNum: number, cdTimeOrder: boolean) => {
    const {data} = (await ipcInstance.send<string>(channels.front.getTableData, tableName,limitNum,cdTimeOrder))
    return data
}
