import {FrontController} from "@main/controller/front.controller";
import {ShareSource} from "@main/dataSource/share-source";
import {failure, success} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import log from "electron-log";

@Controller()
export class ShareController {
    constructor() {
    }

    @IpcHandle(channels.share.getDataVolume)
    public async handleGetDataVolume(sql: string) {
        return new Promise<any>(resolve => {
            ShareSource.manager.query(sql).then(res => {
                const frontController = new FrontController()
                frontController.handleInsertToThemeBaseDataVolume(res).then(() => {
                    resolve(success('同步成功'))
                }).catch((reason) => {
                    log.error(reason)
                    resolve(failure(reason))
                })
            }).catch((reason) => {
                log.error(reason)
                resolve(failure(reason))
            })
        })

    }
}
