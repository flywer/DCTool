import {AppDataSource} from "@main/dataSource/data-source";
import {JobJson} from "@main/entity/JobJson";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {Like} from "typeorm";

@Controller()
export class JobJsonController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.jobJson.getRhJson)
    public async handleGetRhJobJson(tableName?: string) {
        return await AppDataSource.getRepository(JobJson).find({
            select: ['id', 'tableName', 'rh1Json', 'rh2Json', 'rh1UpdateTime'],
            where: {
                tableName: Like(`%${tableName || ''}%`)
            },
            order: {orderNum: 'asc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.jobJson.getRhJsonById)
    public async handleGetRhJobJsonById(id: number) {
        return await AppDataSource.getRepository(JobJson).findOne({
            select: ['id', 'tableName', 'rh1Json', 'rh2Json', 'rh1UpdateTime'],
            where: {
                id: id
            }
        })
    }

    @IpcHandle(channels.auxiliaryDb.jobJson.getZjJson)
    public async handleGetZjJobJson(tableName?: string) {
        return await AppDataSource.getRepository(JobJson).find({
            select: ['id', 'tableName', 'zjJson', 'zjUpdateTime'],
            where: {
                tableName: Like(`%${tableName || ''}%`)
            },
            order: {orderNum: 'asc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.jobJson.getSimpZjJson)
    public async handleGetSimpZjJobJson(tableName?: string) {
        return await AppDataSource.getRepository(JobJson).find({
            select: ['id', 'tableName', 'simpZjJson', 'simpZjUpdateTime'],
            where: {
                tableName: Like(`%${tableName || ''}%`)
            },
            order: {orderNum: 'asc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.jobJson.getZjJsonById)
    public async handleGetZjJobJsonById(id: number): Promise<JobJson> {
        return await AppDataSource.getRepository(JobJson).findOne({
            select: ['id', 'tableName', 'zjJson', 'zjUpdateTime'],
            where: {
                id: id
            }
        })
    }

    @IpcHandle(channels.auxiliaryDb.jobJson.getSimpZjJsonById)
    public async handleGetSimpZjJobJsonById(id: number): Promise<JobJson> {
        return await AppDataSource.getRepository(JobJson).findOne({
            select: ['id', 'tableName', 'simpZjJson', 'simpZjUpdateTime'],
            where: {
                id: id
            }
        })
    }

    @IpcHandle(channels.auxiliaryDb.jobJson.updateRh1Json)
    public async handleUpdateRh1Json(obj: Partial<JobJson>) {
        if (obj.id === null) {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .insert()
                .into(JobJson)
                .values([{
                    rh1Json: obj.rh1Json,
                    tableName: obj.tableName,
                    rh1UpdateTime: new Date()
                }])
                .execute()
        } else {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .update(JobJson)
                .set({
                    rh1Json: obj.rh1Json,
                    tableName: obj.tableName,
                    rh1UpdateTime: new Date()
                })
                .where("id = :id", {id: obj.id})
                .execute()
        }
    }

    @IpcHandle(channels.auxiliaryDb.jobJson.updateRh2Json)
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

    @IpcHandle(channels.auxiliaryDb.jobJson.updateZjJson)
    public async handleUpdateZjJson(obj: Partial<JobJson>) {
        if (obj.id === null) {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .insert()
                .into(JobJson)
                .values([{
                    zjJson: obj.zjJson,
                    tableName: obj.tableName,
                    zjUpdateTime: new Date()
                }])
                .execute()
        } else {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .update(JobJson)
                .set({
                    zjJson: obj.zjJson,
                    tableName: obj.tableName,
                    zjUpdateTime: new Date()
                })
                .where("id = :id", {id: obj.id})
                .execute()
        }
    }

    @IpcHandle(channels.auxiliaryDb.jobJson.updateSimpZjJson)
    public async handleUpdateSimpZjJson(obj: Partial<JobJson>) {
        if (obj.id === null) {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .insert()
                .into(JobJson)
                .values([{
                    simpZjJson: obj.simpZjJson,
                    tableName: obj.tableName,
                    simpZjUpdateTime: obj.simpZjUpdateTime
                }])
                .execute()
        } else {
            return await AppDataSource.getRepository(JobJson).createQueryBuilder()
                .update(JobJson)
                .set({
                    simpZjJson: obj.simpZjJson,
                    tableName: obj.tableName,
                    simpZjUpdateTime: obj.simpZjUpdateTime
                })
                .where("id = :id", {id: obj.id})
                .execute()
        }
    }
}
