import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

type signInModelType = {
    account: string
    password: string
    rememberMe?: boolean
}

export const sign_in = async (model: signInModelType) => {
    const {data} = (await ipcInstance.send<string>(channels.login.signIn, JSON.stringify(model)))
    return data
}

export const sign_up = async (model: signInModelType) => {
    const {data} = (await ipcInstance.send<string>(channels.login.signUp, JSON.stringify(model)))
    return data
}

export const remember_me = async (model: signInModelType) => {
    const {data} = (await ipcInstance.send<string>(channels.login.rememberMe, JSON.stringify(model)))
    return data
}

export const read_user_config = async () => {
    const {data} = (await ipcInstance.send<string>(channels.login.readUserConfig))
    return data
}
