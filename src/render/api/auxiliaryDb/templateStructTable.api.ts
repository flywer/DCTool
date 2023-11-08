import {TemplateStructTable} from "@main/entity/jobTemplate/TemplateStructTable";
import {Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const find_template_struct_table = async (params: Partial<TemplateStructTable>): Promise<TemplateStructTable[]> => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.templateStructTable.findTemplateStructTable, params))
    return data
}

export const struct_table_save = async (model: Partial<TemplateStructTable>): Promise<Result> => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.templateStructTable.save, model))
    return data
}

export const struct_table_delete = async (id: number) => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.templateStructTable.delete, id))
    return data
}

export const save_struct_table_job_rel = async (structTableId: number, jobId: string) => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.templateStructTable.saveTableJobRel, structTableId, jobId))
    return data
}
