import {AppDataSource} from "@main/data-source";
import {ProjectInfo} from "@main/entity/ProjectInfo";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";

@Controller()
export class AdbController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.getProjectInfo)
    public async handleGetProjectInfo() {
        return await AppDataSource.manager.find(ProjectInfo)
    }

    @IpcHandle(channels.auxiliaryDb.updateProjectInfo)
    public async handleUpdateProjectInfo(arr: any) {
        arr = JSON.parse(arr)
        const projectInfoList: ProjectInfo[] = arr.map((
            v => ({
                id: v.id || null,
                projectId: v.projectId,
                projectName: v.projectName,
                projectAbbr: v.projectAbbr,
                tableAbbr: v.tableAbbr
            })
        ));

        return await AppDataSource.getRepository(ProjectInfo).save(projectInfoList as ProjectInfo[])
    }

    @IpcHandle(channels.auxiliaryDb.findByProjectId)
    public async handleFindByProjectId(projectId: string) {
        return await AppDataSource.getRepository(ProjectInfo).findOneBy({
            projectId: projectId
        })
    }
}
