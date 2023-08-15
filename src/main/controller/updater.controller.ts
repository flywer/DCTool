import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";

@Controller()
export class UpdaterController {
    constructor() {
    }

    @IpcHandle(channels.updater.msg)
    public async handleGetProjectInfo(msg: string) {
        console.log(msg)
    }
}
