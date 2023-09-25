import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const check_update = async () => {
    const {data} = await ipcInstance.send<string>(channels.updater.checkUpdate);
    return data
}
