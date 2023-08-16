import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const send_msg = async (msg: string) => {
    const {data} = await ipcInstance.send<string>(channels.updater.msg, msg);
    return data
}
