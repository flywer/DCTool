import {AppDataSource} from "@main/data-source";
import {Dict} from "@main/entity/Dict";
import {JobJson} from "@main/entity/JobJson";
import {ProjectInfo} from "@main/entity/ProjectInfo";
import {TableSql} from "@main/entity/TableSql";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {Like} from "typeorm";

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

    @IpcHandle(channels.auxiliaryDb.getProjectByProAbbr)
    public async handleGetProjectByProAbbr(projectAbbr: string) {
        return await AppDataSource.getRepository(ProjectInfo).findOneBy({
            projectAbbr: projectAbbr
        })
    }

    @IpcHandle(channels.auxiliaryDb.getAuthToken)
    public async handleGetAuthToken() {
        return await AppDataSource.getRepository(Dict).findOneBy({
            name: 'authToken'
        })
    }

    @IpcHandle(channels.auxiliaryDb.updateAuthToken)
    public async handleUpdateAuthToken(token: string) {
        const dict = await AppDataSource.getRepository(Dict).findOneBy({
            name: 'authToken'
        });
        dict.value = token
        return await AppDataSource.manager.save(dict)
    }

    @IpcHandle(channels.auxiliaryDb.getTableSql)
    public async handleGetTableSql(obj: any) {
        if (typeof obj !== 'undefined') {
            obj = JSON.parse(obj)
        }
        let queryVar = []

        if (obj?.tableName !== undefined) {
            queryVar.push({
                tableName: Like(`%${obj?.tableName || ''}%`)
            })
        }
        if (obj?.comment !== undefined) {
            queryVar.push({
                comment: Like(`%${obj?.comment || ''}%`)
            })
        }
        if (obj?.sql !== undefined) {
            queryVar.push({
                sql: Like(`%${obj?.sql || ''}%`)
            })
        }

        return await AppDataSource.manager.find(TableSql, {
            where: queryVar,
            order: {tableName: 'asc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.updateTableSql)
    public async handleUpdateTableSql(obj: any) {
        return await AppDataSource.getRepository(TableSql).save(obj)
    }

    @IpcHandle(channels.auxiliaryDb.getRhJson)
    public async handleGetRh1JobJson(tableName?: string) {
        return await AppDataSource.getRepository(JobJson).find({
            select: ['id', 'tableName', 'rh1Json', 'rh2Json'],
            where: {
                tableName: Like(`%${tableName || ''}%`)
            },
            order: {orderNum: 'asc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.getRhJsonById)
    public async handleGetRh1JobJsonById(id: number) {
        return await AppDataSource.getRepository(JobJson).find({
            select: ['id', 'tableName', 'rh1Json', 'rh2Json'],
            where: {
                id: id
            }
        })
    }

    @IpcHandle(channels.auxiliaryDb.getZjJson)
    public async handleGetZjJobJson(tableName?: string) {
        return await AppDataSource.getRepository(JobJson).find({
            select: ['id', 'tableName', 'zjJson'],
            where: {
                tableName: Like(`%${tableName || ''}%`)
            },
            order: {orderNum: 'asc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.getZjJsonById)
    public async handleGetZjJobJsonById(id: number) {
        return await AppDataSource.getRepository(JobJson).find({
            select: ['id', 'tableName', 'zjJson'],
            where: {
                id: id
            }
        })
    }

    @IpcHandle(channels.auxiliaryDb.updateRh1Json)
    public async handleUpdateRh1Json(obj: any) {
        obj = JSON.parse(obj)
        if (obj.id === null) {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .insert()
                .into(JobJson)
                .values([{
                    rh1Json: obj.json,
                    tableName: obj.tableName
                }])
                .execute()
        } else {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .update(JobJson)
                .set({
                    rh1Json: obj.json,
                    tableName: obj.tableName
                })
                .where("id = :id", {id: obj.id})
                .execute()
        }
    }

    @IpcHandle(channels.auxiliaryDb.updateRh2Json)
    public async handleUpdateRh2Json(obj: any) {
        obj = JSON.parse(obj)
        if (obj.id === null) {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .insert()
                .into(JobJson)
                .values([{
                    rh2Json: obj.json,
                    tableName: obj.tableName
                }])
                .execute()
        } else {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .update(JobJson)
                .set({
                    rh2Json: obj.json,
                    tableName: obj.tableName
                })
                .where("id = :id", {id: obj.id})
                .execute()
        }
    }

    @IpcHandle(channels.auxiliaryDb.updateZjJson)
    public async handleUpdateZjJson(obj: any) {
        obj = JSON.parse(obj)
        if (obj.id === null) {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .insert()
                .into(JobJson)
                .values([{
                    zjJson: obj.json,
                    tableName: obj.tableName
                }])
                .execute()
        } else {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .update(JobJson)
                .set({
                    zjJson: obj.json,
                    tableName: obj.tableName
                })
                .where("id = :id", {id: obj.id})
                .execute()
        }
    }
}
