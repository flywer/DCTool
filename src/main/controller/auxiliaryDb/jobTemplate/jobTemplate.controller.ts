import {AppDataSource} from "@main/dataSource/data-source";
import {JobTemplate} from "@main/entity/jobTemplate/JobTemplate";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {Like} from "typeorm";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";

@Controller()
export class JobTemplateController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.jobTemplate.findTemplate)
    public async handleFindTemplate(params: Partial<JobTemplate>, options: {
        templateNameLike: boolean
    }) {

        const findOption: FindOptionsWhere<JobTemplate> = new JobTemplate()

        if (params.id) {
            findOption.id = params.id
        }
        if (params.templateName) {
            if (options.templateNameLike) {
                findOption.templateName = Like(`%${params.templateName}%`)
            } else {
                findOption.templateName = params.templateName
            }
        }
        if (params.templateType) {
            findOption.templateType = params.templateType
        }
        if (params.createTime) {
            findOption.createTime = params.createTime
        }
        if (params.updateTime) {
            findOption.updateTime = params.updateTime
        }

        return await AppDataSource.getRepository(JobTemplate).find({
            where: findOption,
            order: {updateTime: 'desc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.jobTemplate.templateSave)
    public async handleTemplateSave(params: JobTemplate) {
        return await AppDataSource.getRepository(JobTemplate).save(params)
    }

    @IpcHandle(channels.auxiliaryDb.jobTemplate.templateDelete)
    public async handleTemplateDelete(id: number) {
        return await AppDataSource.getRepository(JobTemplate).delete(id)
    }
}
