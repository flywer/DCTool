import {AppDataSource} from "@main/dataSource/data-source";
import {FieldInspectionRule} from "@main/entity/jobTemplate/FieldInspectionRule";
import {TemplateStructTable} from "@main/entity/jobTemplate/TemplateStructTable";
import {TemplateTableJobRel} from "@main/entity/jobTemplate/TemplateTableJobRel";
import {failure, Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import log from "electron-log";
import {Like} from "typeorm";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";

@Controller()
export class TemplateStructTableController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.templateStructTable.findTemplateStructTable)
    public async handleFindTemplateStructTable(params: Partial<TemplateStructTable>, options: {
        tableNameLike: boolean
    }) {
        const findOption: FindOptionsWhere<TemplateStructTable> = new TemplateStructTable()

        if (params.id) {
            findOption.id = params.id
        }

        if (params.tableName) {
            if (options.tableNameLike) {
                findOption.tableName = Like(`%${params.tableName}%`)
            } else {
                findOption.tableName = params.tableName
            }
        }

        if (params.templateId) {
            findOption.templateId = params.templateId
        }

        if (params.createTime) {
            findOption.createTime = params.createTime
        }
        if (params.updateTime) {
            findOption.updateTime = params.updateTime
        }

        return await AppDataSource.getRepository(TemplateStructTable).find({
            where: findOption,
            order: {updateTime: 'desc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.templateStructTable.save)
    public async handleSave(model: Partial<TemplateStructTable>) {
        try {
            let result = new Result();
            result.data = await AppDataSource.getRepository(TemplateStructTable).save(model)
            result.success = true
            return result
        } catch (error) {
            log.error(error)
            return failure('保存失败')
        }
    }

    @IpcHandle(channels.auxiliaryDb.templateStructTable.delete)
    public async handleDelete(id: number) {
        try {
            let result = new Result();

            const inspFields = await AppDataSource.getRepository(FieldInspectionRule).find({
                where: {
                    tableId: id
                }
            })

            await AppDataSource.getRepository(FieldInspectionRule).remove(inspFields)

            const tableJobRel = await AppDataSource.getRepository(TemplateTableJobRel).find({
                where: {
                    structTableId: id
                }
            })

            await AppDataSource.getRepository(TemplateTableJobRel).remove(tableJobRel)

            result.data = await AppDataSource.getRepository(TemplateStructTable).delete(id)
            result.success = true
            return result
        } catch (error) {
            log.error(error)
            return failure('删除失败')
        }
    }

    // 保存模板结构表与任务之间的关联关系
    @IpcHandle(channels.auxiliaryDb.templateStructTable.saveTableJobRel)
    public async handleSaveTableJobRel(structTableId: number, jobId: string) {
        try {
            let result = new Result();

            // 此任务所关联的结构表
            const tableJobRels = await AppDataSource.getRepository(TemplateTableJobRel).find({
                where: {
                    jobId: jobId
                }
            })

            // 删除
            await AppDataSource.getRepository(TemplateTableJobRel).remove(tableJobRels)

            // 保存新的关系
            const tableJobRel = new TemplateTableJobRel()
            tableJobRel.structTableId = structTableId
            tableJobRel.jobId = jobId

            result.data = await AppDataSource.getRepository(TemplateTableJobRel).save(tableJobRel)

            result.success = true
            return result
        } catch (error) {
            log.error(error)
            return failure('失败')
        }
    }

    @IpcHandle(channels.auxiliaryDb.templateStructTable.findJobRelById)
    public handleFindJobRelById(id: number) {
        return AppDataSource.getRepository(TemplateTableJobRel).findBy({structTableId: id});
    }

    @IpcHandle(channels.auxiliaryDb.templateStructTable.findJobRelByJobId)
    public handleFindJobRelByJobId(id: string) {
        return AppDataSource.getRepository(TemplateTableJobRel).findBy({jobId: id});
    }

}
