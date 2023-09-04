import {User} from "@main/entity/User";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_token_by_account = async (account: string): Promise<User> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.user.getAuthTokenByAccount, account))
    return data
}

export const update_token_by_account = async (token: string, account: string) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.user.updateAuthTokenByAccount, token, account))
    return data
}
