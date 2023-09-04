import {AppDataSource} from "@main/dataSource/data-source";
import {User} from "@main/entity/User";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";

@Controller()
export class UserController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.user.getAuthTokenByAccount)
    public async handleGetAuthToken(account: string){
        return await AppDataSource.getRepository(User).findOneBy({
            account: account
        })
    }

    @IpcHandle(channels.auxiliaryDb.user.updateAuthTokenByAccount)
    public async handleUpdateAuthToken(token: string, account: string) {
        const user = await AppDataSource.getRepository(User).findOneBy({
            account: account
        })
        user.dcToken = token
        return await AppDataSource.manager.save(user)
    }
}
