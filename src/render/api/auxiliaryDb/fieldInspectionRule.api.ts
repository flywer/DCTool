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

export const field_insp_rule_sort_num_save = async (ids: number[]): Promise<Result> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.fieldInspectionRule.sortNumSave, ids))
    return data
}

export const update_insp_rule_enabled = async (id: number, enabled: 0 | 1): Promise<Result> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.fieldInspectionRule.updateInspRuleEnabled, id, enabled))
    return data
}
