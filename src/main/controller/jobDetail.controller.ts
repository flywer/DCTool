import {AppDataSource} from "@main/dataSource/data-source";
import {JobDetail} from "@main/entity/JobDetail";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";

@Controller()
export class JobDetailController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.jobDetail.findAll)
    public async handleGetProjectInfo() {
        return await AppDataSource.manager.find(JobDetail)
    }
}
