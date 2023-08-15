import {SetupModelType} from "@common/types";
import {Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const app_relaunch = () => {
    return ipcInstance.send(channels.app.relaunch)
}

export const open_default_browser = (link: string) => {
    return ipcInstance.send(channels.app.openDefaultBrowser, link)
}

/**
 * 写入应用设置
 * @param setupModel
 */
export const set_app_settings = async (setupModel: SetupModelType) => {
    const {data} = await ipcInstance.send(channels.app.updateSettings, setupModel)
    return data as Result
}

export const get_app_settings = async () => {
    const {data} = await ipcInstance.send(channels.app.getSettings)
    return data as Result
}

export const get_app_version = async () => {
    const {data} = await ipcInstance.send(channels.app.getAppVersion)
    return data as Result
}
