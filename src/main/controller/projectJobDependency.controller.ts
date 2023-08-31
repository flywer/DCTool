import {AppDataSource} from "@main/dataSource/data-source";
import {ProjectJobDependency} from "@main/entity/ProjectJobDependency";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";

@Controller()
export class ProjectJobDependencyController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.projectJobDependency.findAll)
    public async handleGetProjectInfo() {
        return await AppDataSource.manager.find(ProjectJobDependency)
    }
}
