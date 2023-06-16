import {channels} from "@render/api/channels";
import {Controller, IpcHandle, IpcSend} from 'einf'
import {app} from "electron";
import {AppService} from '../service/app.service'

@Controller()
export class AppController {
    constructor(
        private appService: AppService,
    ) {
    }

    @IpcSend('reply-msg')
    public replyMsg(msg: string) {
        return `${this.appService.getDelayTime()} seconds later, the main process replies to your message: ${msg}`
    }

    @IpcHandle('send-msg')
    public async handleSendMsg(msg: string): Promise<string> {
        setTimeout(() => {
            this.replyMsg(msg)
        }, this.appService.getDelayTime() * 1000)

        return `The main process received your message: ${msg}`
    }

    /**
     * 应用重启
     * @constructor
     */
    @IpcHandle(channels.app.relaunch)
    public HandleRelaunch() {
        app.relaunch()
        app.exit(0)
    }
}
