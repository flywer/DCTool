import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {handleAutoUpdate} from "../../app/app.updater";

@Controller()
export class UpdaterController {
    constructor() {
    }

    @IpcHandle(channels.updater.checkUpdate)
    public handleCheckUpdate() {
        handleAutoUpdate()
    }
}
