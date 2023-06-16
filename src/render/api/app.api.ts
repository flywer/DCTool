import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";
export function app_relaunch() {
    return ipcInstance.send(channels.app.relaunch)
}
