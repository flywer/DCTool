import {find_by_project_id, get_zj_json, get_zj_json_by_id} from "@render/api/auxiliaryDb";
import {add_work_flow} from "@render/api/datacenter";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {isBasicTable} from "@render/utils/common/isBasicTable";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";

export type ZjFormModelType = {
    jobJsonId?: string,
    personId: string,
    projectId: string,
    tableName?: string
}
const buildZjJobJson = async (formModel: ZjFormModelType, templateJson: any) => {
    if (templateJson != null) {

        const project = await find_by_project_id(formModel.projectId)

        const projectAbbr = project?.projectAbbr || ''

        templateJson.name = `zj_${projectAbbr}_${formModel.tableName.toLowerCase()}`;
        templateJson.projectId = formModel.projectId
        templateJson.projectName = projectIdOptions.find(option => option.value === formModel.projectId).label
        templateJson.personId = formModel.personId
        templateJson.personName = personIdOptions.find(option => option.value === formModel.personId).label

        templateJson = JSON.parse(JSON.stringify(templateJson).replaceAll('depart', project.tableAbbr))
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

    const paramsJson = await buildZjJobJson(formModel, JSON.parse(templateJsonStr));

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

export const convertZjJson = (jsonStr: string, tableName: string): string => {
    let jobJson = JSON.parse(jsonStr)
    jobJson.name = ''
    jobJson.email = ''
    jobJson.description = ''
    jobJson.personId = ''
    jobJson.personName = ''
    jobJson.projectId = ''
    jobJson.projectName = ''
    jobJson.dependencyProjectName = null
    jobJson.dependencyWorkflowName = null
    jobJson.dependencyProjectId = null
    jobJson.dependencyWorkflowId = null
    jobJson.schedulingMode = 0
    jobJson.crontab = ''
    jobJson = JSON.parse(updateSjkUUID(removeIds(jobJson)))

    const oldTableAbbr = jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName.split('_')[1]

    jobJson.modelJson = jobJson.modelJson.replaceAll(oldTableAbbr, 'depart')

    const newSourceTableName = `di_depart_${tableName.toLowerCase()}_temp_ods`
    const newAimTableName = `di_depart_${tableName.toLowerCase()}_right_dwd`
    const newWrongTableName = `di_depart_${tableName.toLowerCase()}_error_dwd`

    jobJson.dataDevBizVo.qualityInspectionDtoList[0].incrementColumnName = `${newSourceTableName}.cd_time`
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].incrementColumnValueInit = "2023-01-01T03:33:44.132Z"

    jobJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList = jobJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.map(obj => {
            obj.field = obj.field.replace(jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName, newSourceTableName);
            return obj
        }
    )

    jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName = newSourceTableName
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].aimTableName = newAimTableName
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].wrongTableName = newWrongTableName

    //替换关联表里的表名，但关联的是基础数据的不用替换
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.forEach((field: any) => {
        field.ruleList.forEach((rule: any) => {
            if (rule.customSqlKey != undefined) {
                rule.customSqlKey = rule.customSqlKey.replaceAll(oldTableAbbr, 'depart');
            }
            if (rule.fromTableDataTable != undefined && !isBasicTable(rule.fromTableDataTable)) {
                rule.fromTableDataTable = rule.fromTableDataTable.replaceAll(oldTableAbbr, 'depart');
                rule.fromTableField = rule.fromTableField.replaceAll(oldTableAbbr, 'depart');
            }
            if (rule.customSql != undefined) {
                rule.customSql = convertCustomSqlTableName(rule.customSql, oldTableAbbr, 'depart')
            }
        });
    });

    return JSON.stringify(jobJson, null, 2)
}

const convertCustomSqlTableName = (sql: string, oldTableAbbr: string, newTableAbbr: string) => {
    // 定义正则表达式匹配规则，匹配 xzzf_ods. 后面的表名
    const pattern = /(?<=xzzf_ods\.)\w+/g;

    let newSql = sql

    // 使用正则表达式匹配字符串中的所有表名，并打印结果
    let match;
    while ((match = pattern.exec(sql)) !== null) {
        if (!isBasicTable(match[0])) {
            const tableName = match[0].replaceAll(oldTableAbbr, newTableAbbr) //转为通用表名
            newSql = newSql.replaceAll(match[0], tableName)//替换此表名
        }
    }
    return newSql
}

