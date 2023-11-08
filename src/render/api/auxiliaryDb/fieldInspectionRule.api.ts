import {FieldInspectionRule} from "@main/entity/jobTemplate/FieldInspectionRule";
import {Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const find_field_insp_rule = async (params: Partial<FieldInspectionRule>, options?: {}): Promise<FieldInspectionRule[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.fieldInspectionRule.findFieldInspectionRule, params, options))
    return data
}

export const field_insp_rule_save = async (model: Partial<FieldInspectionRule>): Promise<Result> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.fieldInspectionRule.save, model))
    return data
}

export const field_insp_rule_delete = async (id: number): Promise<Result> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.fieldInspectionRule.delete, id))
    return data
}

