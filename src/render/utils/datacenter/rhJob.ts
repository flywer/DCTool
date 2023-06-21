import {
    find_by_project_id,
    get_rh_json,
    get_rh_json_by_id
} from "@render/api/auxiliaryDb";
import {add_work_flow} from "@render/api/datacenter";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";

export type RhFormModelType = {
    jobJsonId?: string,
    personId: string,
    projectId: string,
    tableName?: string
}

/**
 * @param formModel
 * @param templateJson
 * @param isBasicData 是否为基础数据
 * @param isMultiTableJson 是否为多表融合JSON
 **/
export const buildRhJson = async (formModel: RhFormModelType, templateJson: any, isBasicData: boolean, isMultiTableJson: boolean) => {

    if (templateJson != null) {
        const project = await find_by_project_id(formModel.projectId)

        const projectAbbr = project?.projectAbbr || ''

        if (isBasicData) {
            templateJson.name = `rh_${projectAbbr}_${formModel.tableName.toLowerCase()}`
        } else if (isMultiTableJson) {
            templateJson.name = `rh2_${projectAbbr}_${formModel.tableName.toLowerCase()}`
        } else {
            templateJson.name = `rh1_${projectAbbr}_${formModel.tableName.toLowerCase()}`
        }

        templateJson.projectId = formModel.projectId
        templateJson.projectName = projectIdOptions.find(option => option.value === formModel.projectId).label as string
        templateJson.personId = formModel.personId
        templateJson.personName = personIdOptions.find(option => option.value === formModel.personId).label as string

        templateJson = JSON.parse(JSON.stringify(templateJson).replaceAll('depart', project.tableAbbr))
        templateJson = JSON.parse(updateSjkUUID(removeIds(templateJson)))
    }

    return templateJson
}

export const createRhJob = async (formModel: RhFormModelType, isBasicData: boolean, isMultiTableJson: boolean) => {
    let templateJsonStr
    if (formModel.jobJsonId != undefined) {
        const jobJson = await get_rh_json_by_id(Number(formModel.jobJsonId));
        if (isMultiTableJson) {
            templateJsonStr = jobJson?.rh2Json || null;
        } else {
            templateJsonStr = jobJson?.rh1Json || null;
        }

        formModel.tableName = jobJson?.tableName.toLowerCase() || null;
    } else if (formModel.jobJsonId == undefined && formModel.tableName != null) {

        const jobJson = await get_rh_json(formModel.tableName)
        if (jobJson.length > 0) {
            // 若不知道jsonId则使用tableName获取json
            if (isMultiTableJson) {
                templateJsonStr = jobJson[0]?.rh2Json || null;
            } else {
                templateJsonStr = jobJson[0]?.rh1Json || null;
            }
        } else {
            templateJsonStr = null;
        }
    }

    const paramsJson = await buildRhJson(formModel, JSON.parse(templateJsonStr), isBasicData, isMultiTableJson);

    if (paramsJson != null) {
        add_work_flow(paramsJson).then((res) => {
            if (res.code == 200) {
                if (isBasicData) {
                    window.$message.success('融合任务创建成功')
                } else {
                    if (isMultiTableJson) {
                        window.$message.success('多表融合任务创建成功')
                    } else {
                        window.$message.success('单表融合任务创建成功')
                    }
                }
            } else {
                window.$message.error(res.message)
            }
        })
    } else {
        window.$message.error('融合模板JSON不存在')
    }
}


