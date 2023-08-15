import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const should_use_dark_theme = async () => {
    const {data} = await ipcInstance.send(channels.sys.shouldUseDarkColors)
    return data
}
