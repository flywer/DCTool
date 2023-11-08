import {AppDataSource} from "@main/dataSource/data-source";
import {FieldInspectionRule} from "@main/entity/jobTemplate/FieldInspectionRule";
import {failure, Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import log from "electron-log";
import {isEmpty} from "lodash";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";

@Controller()
export class FieldInspectionRuleController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.fieldInspectionRule.findFieldInspectionRule)
    public async handleFindFieldInspectionRule(params: Partial<FieldInspectionRule>, options?: {}) {
        const findOption: FindOptionsWhere<FieldInspectionRule> = new FieldInspectionRule()

        if (params.id) {
            findOption.id = params.id
        }

        if (params.fieldName) {
            findOption.fieldName = params.fieldName
        }

        if (params.ruleType) {
            findOption.ruleType = params.ruleType
        }

        if (params.referenceRuleId) {
            findOption.referenceRuleId = params.referenceRuleId
        }

        if (params.tableId) {
            findOption.tableId = params.tableId
        }

        if (params.tableId) {
            findOption.tableId = params.tableId
        }

        if (params.createTime) {
            findOption.createTime = params.createTime
        }
        if (params.updateTime) {
            findOption.updateTime = params.updateTime
        }

        return await AppDataSource.getRepository(FieldInspectionRule).find({
            where: findOption,
            order: {createTime: 'asc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.fieldInspectionRule.save)
    public async handleSave(model: Partial<FieldInspectionRule>) {
        try {
            let result = new Result();
            result.data = await AppDataSource.getRepository(FieldInspectionRule).save(model)
            result.success = true
            return result
        } catch (error) {
            log.error(error)
            return failure('保存失败')
        }
    }

    @IpcHandle(channels.auxiliaryDb.fieldInspectionRule.delete)
    public async handleDelete(id: number) {
        try {
            let result = new Result()

            const relRule = await AppDataSource.getRepository(FieldInspectionRule).findBy({referenceRuleId: id})

            if (isEmpty(relRule)) {
                result.data = await AppDataSource.getRepository(FieldInspectionRule).delete(id)
                result.success = true
                return result
            } else {
                return failure('规则被其他字段依赖，无法删除')
            }

        } catch (error) {
            log.error(error)
            return failure('删除失败')
        }
    }

}
