import {AppDataSource} from "@main/dataSource/data-source";
import {Dict} from "@main/entity/Dict";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";

@Controller()
export class DictController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.dict.getMaxRunningWorkFlowJobNum)
    public async handleGetMaxRunningWorkFlowJobNum() {
        return await AppDataSource.getRepository(Dict).findOneBy({
            name: 'maxRunningWorkFlowJobNum'
        })
    }

}
