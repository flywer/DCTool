import {AppDataSource} from "@main/dataSource/data-source";
import {ProjectInfo} from "@main/entity/ProjectInfo";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {IsNull, Like, Not} from "typeorm";

@Controller()
export class ProjectInfoController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.getProjectInfo)
    public async handleGetProjectInfo(): Promise<ProjectInfo[]> {
        return await AppDataSource.manager.find(ProjectInfo)
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.getProjectInfoByProjectName)
    public async handleGetProjectInfoByProjectName(param: string): Promise<ProjectInfo[]> {
        return await AppDataSource.getRepository(ProjectInfo).findBy({
            projectName: Like(`%${param || ''}%`),
        })
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.updateProjectInfo)
    public async handleUpdateProjectInfo(project: ProjectInfo): Promise<ProjectInfo> {
        return await AppDataSource.getRepository(ProjectInfo).save(project)
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.findByProjectId)
    public async handleFindByProjectId(projectId: string): Promise<ProjectInfo> {
        return await AppDataSource.getRepository(ProjectInfo).findOneBy({
            projectId: projectId
        })
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.getProjectByProAbbr)
    public async handleGetProjectByProAbbr(projectAbbr: string): Promise<ProjectInfo> {
        return await AppDataSource.getRepository(ProjectInfo).findOneBy({
            projectAbbr: projectAbbr
        })
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.getProjectByTableAbbr)
    public async handleGetProjectByTableAbbr(tableAbbr: string): Promise<ProjectInfo> {
        return await AppDataSource.getRepository(ProjectInfo).findOneBy({
            tableAbbr: tableAbbr
        })
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.getProjectByProjectName)
    public async handleGetProjectByProjectName(projectName: string): Promise<ProjectInfo[]> {
        return await AppDataSource.getRepository(ProjectInfo).findBy({
            projectName: Like(`%${projectName || ''}%`)
        })
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.updateCjCron)
    public async handleUpdateCjCron(obj: any) {
        obj = JSON.parse(obj)

        const project = await AppDataSource.getRepository(ProjectInfo).findOneBy({
            projectId: obj.projectId
        })

        if (project == null) {
            return await AppDataSource.getRepository(ProjectInfo).createQueryBuilder()
                .insert()
                .into(ProjectInfo)
                .values([{
                    projectName: obj.projectName,
                    projectId: obj.projectId,
                    cjCron: obj.cron,
                }])
                .execute()
        } else {
            return await AppDataSource.getRepository(ProjectInfo).createQueryBuilder()
                .update()
                .set({
                    cjCron: obj.cron,
                })
                .where("projectId = :projectId", {projectId: obj.projectId})
                .execute()
        }

    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.getProjectCjCron)
    public async handleGetProjectCjCron(param: string): Promise<ProjectInfo[]> {
        return await AppDataSource.getRepository(ProjectInfo).find({
            select: ['id', 'projectId', 'projectName', 'cjCron'],
            where: [
                {
                    projectName: Like(`%${param || ''}%`),
                    cjCron: Not(IsNull())
                },
                {
                    cjCron: Like(`%${param || ''}%`)
                }
            ]

        })
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.getProjectByCjCronIsNull)
    public async handleGetProjectByCjCronIsNull(nullable: boolean): Promise<ProjectInfo[]> {
        return await AppDataSource.getRepository(ProjectInfo).find({
            select: ['id', 'projectId', 'projectName', 'cjCron'],
            where: {
                cjCron: nullable ? IsNull() : Not(IsNull())
            }
        })
    }

    @IpcHandle(channels.auxiliaryDb.projectInfo.getAllCollectionProject)
    public async handleGetAllCollectionProject(isCollection: 0 | 1): Promise<ProjectInfo[]> {
        return await AppDataSource.getRepository(ProjectInfo).find({
            where: {
                isCollectionProject: isCollection
            },
            order: {projectId: 'asc'}
        })
    }
}
