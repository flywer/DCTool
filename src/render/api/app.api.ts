import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const app_relaunch = () => {
    return ipcInstance.send(channels.app.relaunch)
}

export const open_default_browser = (link: string) => {
    return ipcInstance.send(channels.app.openDefaultBrowser,link)
}
