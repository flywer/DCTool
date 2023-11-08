import {JobTemplate} from "@main/entity/jobTemplate/JobTemplate";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const find_job_template = async (params: Partial<JobTemplate>, options?: {
    templateNameLike?: boolean
}): Promise<JobTemplate[]> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobTemplate.findTemplate, params, options))
    return data
}

export const job_template_save = async (params: JobTemplate) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobTemplate.templateSave, params))
    return data
}

export const job_template_delete = async (id: number) => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobTemplate.templateDelete, id))
    return data
}
