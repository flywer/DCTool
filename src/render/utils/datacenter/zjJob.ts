import {find_by_project_id, get_zj_json, get_zj_json_by_id} from "@render/api/auxiliaryDb";
import {add_work_flow} from "@render/api/datacenter";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {getAbbrByProId} from "@render/utils/datacenter/getAbbrByProId";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";

export type ZjFormModelType = {
    jobJsonId?: string,
    personId: string,
    projectId: string,
    tableName?: string
}
const buildZjJobJson = async (formModel: ZjFormModelType, templateJson: any, tableName: string) => {
    if (templateJson != null) {
        const projectAbbr = (await find_by_project_id(formModel.projectId))?.projectAbbr || ''

        templateJson.name = `zj_${projectAbbr}_${tableName.toLowerCase()}`;
        templateJson.projectId = formModel.projectId
        templateJson.projectName = projectIdOptions.find(option => option.value === formModel.projectId).label
        templateJson.personId = formModel.personId
        templateJson.personName = personIdOptions.find(option => option.value === formModel.personId).label

        const {tableAbbr} = await getAbbrByProId(templateJson.projectId);

        templateJson = JSON.parse(JSON.stringify(templateJson).replaceAll('depart', tableAbbr))
        templateJson = JSON.parse(updateSjkUUID(removeIds(templateJson)))
    }
    return templateJson

}

export const createZjJob = async (formModel: ZjFormModelType) => {
    let templateJsonStr
    if (formModel.jobJsonId != undefined) {
        const cjJson = await get_zj_json_by_id(Number(formModel.jobJsonId));

        templateJsonStr = cjJson?.zjJson || null;
        formModel.tableName = cjJson?.tableName.toLowerCase() || null;
    } else if (formModel.jobJsonId == undefined && formModel.tableName != null) {

        const cjJsonArr = await get_zj_json(formModel.tableName)
        if (cjJsonArr.length > 0) {
            // 若不知道jsonId则使用tableName获取json
            templateJsonStr = cjJsonArr[0]?.zjJson || null;
        } else {
            templateJsonStr = null;
        }
    }

    const paramsJson = await buildZjJobJson(formModel, JSON.parse(templateJsonStr), formModel.tableName);

    if (paramsJson != null) {
        add_work_flow(paramsJson).then((res) => {
            if (res.code == 200) {
                window.$message.success('质检任务创建成功')
            } else {
                window.$message.error(res.message)
            }
        })
    } else {
        window.$message.error('质检模板JSON不存在')
    }
}
