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

    const oldSourceTableName = jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName
    const oldTableAbbr = jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName.split('_')[1]

    jobJson.modelJson = jobJson.modelJson.replaceAll(oldTableAbbr, 'depart')

    const newSourceTableName = `di_depart_${tableName.toLowerCase()}_temp_ods`
    const newAimTableName = `di_depart_${tableName.toLowerCase()}_right_dwd`
    const newWrongTableName = `di_depart_${tableName.toLowerCase()}_error_dwd`

    jobJson.dataDevBizVo.qualityInspectionDtoList[0].incrementColumnName = `cd_time`
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].incrementColumnValueInit = "2023-01-01T03:33:44.132Z"

    jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName = newSourceTableName
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].aimTableName = newAimTableName
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].wrongTableName = newWrongTableName

    //替换关联表里的表名，但关联的是基础数据的不用替换
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.forEach((inspField: any) => {

        inspField.field = inspField.field.replace(`${oldSourceTableName}.`, '')

        inspField.ruleList.forEach((rule: any) => {
            if (rule.customSqlKey != undefined) {
                rule.customSqlKey = rule.customSqlKey.replaceAll(`${oldSourceTableName}.`, '');
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

export const convertCustomSqlTableName = (sql: string, oldTableAbbr: string, newTableAbbr: string) => {
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

const dataLakeZjJsonTemplate = {
    code: 'sjkf9799847f2754603bb0a021dadaf56ee',
    modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjkf9799847f2754603bb0a021dadaf56ee\" name=\"sjkf9799847f2754603bb0a021dadaf56ee\" isExecutable=\"true\">\n        <userTask id=\"sjkab701d7ddcc14bee843af2257c94b4f8\" name=\"数据质检\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataQuInTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <startEvent id=\"sjk01f6b82b3ca54b229be390f243608b20\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <endEvent id=\"sjk46eb79fe11f54659b43cb186e1c28d34\" name=\"结束\"/>\n        <sequenceFlow id=\"sjk19049623d99e41648e64d9af1d220c48\" name=\"MySQL\" sourceRef=\"sjkab701d7ddcc14bee843af2257c94b4f8\" targetRef=\"sjk46eb79fe11f54659b43cb186e1c28d34\"/>\n        <sequenceFlow id=\"sjk2fb3fcb6759e48c69ea49f8c912c8852\" name=\"MySQL\" sourceRef=\"sjk01f6b82b3ca54b229be390f243608b20\" targetRef=\"sjkab701d7ddcc14bee843af2257c94b4f8\"/>\n    </process>\n</definitions>",
    modelJson: "{\"nodeList\":[{\"id\":\"sjkfc60ee0f505540c1ac10cc0a9a52a11c\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/48fd225e7111088563b7805c805a7e57.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"MySQL\",\"name\":\"MySQL\",\"databaseName\":12,\"tableName\":\"sourceTableName\"},{\"id\":\"sjkab701d7ddcc14bee843af2257c94b4f8\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/38522f61e19372817833d4ee81775de7.svg\",\"size\":\"20\",\"delegateExpression\":\"dataQuInTaskListener\",\"type\":\"component\",\"name\":\"数据质检\"},{\"id\":\"sjk9f8e62d347c9495c982f7122500b6539\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/48fd225e7111088563b7805c805a7e57.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"MySQL\",\"name\":\"MySQL\",\"databaseName\":8,\"tableName\":\"aimTableName\"},{\"id\":\"sjk37950af2f66e46d8addfad6a0dbec92f\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/32a601d50ea448553386f286a6911239.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"wrongTableName\"},{\"id\":\"sjk01f6b82b3ca54b229be390f243608b20\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/65accb422a8d3f181bbbc1c537006cc0.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjk46eb79fe11f54659b43cb186e1c28d34\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/198b2349289796a4476408838a50f944.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjkfc60ee0f505540c1ac10cc0a9a52a11c\",\"to\":\"sjkab701d7ddcc14bee843af2257c94b4f8\",\"id\":\"sjk2fb3fcb6759e48c69ea49f8c912c8852\"},{\"from\":\"sjkab701d7ddcc14bee843af2257c94b4f8\",\"to\":\"sjk9f8e62d347c9495c982f7122500b6539\",\"id\":\"sjka9843e8d518f4b5bb8aac3bafbaf29bc\"},{\"from\":\"sjkab701d7ddcc14bee843af2257c94b4f8\",\"to\":\"sjk37950af2f66e46d8addfad6a0dbec92f\",\"id\":\"sjkd3fb1715ed6e412ea686cca01ec39eeb\"},{\"from\":\"sjk01f6b82b3ca54b229be390f243608b20\",\"to\":\"sjkfc60ee0f505540c1ac10cc0a9a52a11c\",\"id\":\"sjk3837e0a1d6c649f3a4ca7a5cb76ebfef\"},{\"from\":\"sjk37950af2f66e46d8addfad6a0dbec92f\",\"to\":\"sjk46eb79fe11f54659b43cb186e1c28d34\",\"id\":\"sjk5732749975764615a84075496774c269\"},{\"from\":\"sjk9f8e62d347c9495c982f7122500b6539\",\"to\":\"sjk46eb79fe11f54659b43cb186e1c28d34\",\"id\":\"sjk19049623d99e41648e64d9af1d220c48\"}]}",
    taskDefKey: "sjkab701d7ddcc14bee843af2257c94b4f8"
}

export const dataLakeZjJobJsonConvert = (formModel: ZjFormModelType, paramJson: any, tableName: string) => {
    paramJson.name = `zj_lake_${tableName}`

    paramJson.projectId = formModel.projectId
    paramJson.projectName = projectIdOptions.find(option => option.value === formModel.projectId).label
    paramJson.personId = formModel.personId
    paramJson.personName = personIdOptions.find(option => option.value === formModel.personId).label

    paramJson.code = dataLakeZjJsonTemplate.code
    paramJson.modelXml = dataLakeZjJsonTemplate.modelXml
    paramJson.modelJson = dataLakeZjJsonTemplate.modelJson
    paramJson.dataDevBizVo.qualityInspectionDtoList[0].taskInfoDto.taskDefKey = dataLakeZjJsonTemplate.taskDefKey

    paramJson.dataDevBizVo.qualityInspectionDtoList[0].sourceDbId = '12'
    paramJson.dataDevBizVo.qualityInspectionDtoList[0].aimDbId = '8'
    paramJson.dataDevBizVo.qualityInspectionDtoList[0].wrongDbId = '6'

    paramJson.dataDevBizVo.qualityInspectionDtoList[0].incrementColumnName = `cd_time`

    const oldSourceTableName = paramJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName
    // const oldAimTableName = paramJson.dataDevBizVo.qualityInspectionDtoList[0].aimTableName
    // const oldWrongTableName = paramJson.dataDevBizVo.qualityInspectionDtoList[0].wrongTableName

    const newSourceTableName = `sztk_${tableName}`
    const newAimTableName = `sztk_${tableName}`
    const newWrongTableName = `df_lake_${tableName}_error_dm`

    paramJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName = newSourceTableName
    paramJson.dataDevBizVo.qualityInspectionDtoList[0].aimTableName = newAimTableName
    paramJson.dataDevBizVo.qualityInspectionDtoList[0].wrongTableName = newWrongTableName

    paramJson.modelJson = paramJson.modelJson
        .replaceAll('sourceTableName', newSourceTableName)
        .replaceAll('aimTableName', newAimTableName)
        .replaceAll('wrongTableName', newWrongTableName)

    // 去除id,add_time,cd_time,cd_batch 字段的质检
    paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList = removeRulesByField(
        paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList,
        ['id', 'add_time', 'cd_time', 'cd_batch']
    )

    // 去除值域质检、外键、身份证、手机号、邮箱、正则质检
    paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList = removeRulesByIds(
        paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList,
        ['2', '5', '7', '8', '9', '16']
    )

    // 去除自定义sql中包含其他表的质检规则
    paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList = removeRulesByCustomSql(
        paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList,
        'xzzf_ods.'
    )

    paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.forEach((inspField: any) => {
        inspField.ruleList.forEach((rule: any) => {
            if (rule.fromTableDataSourceId != undefined) {
                rule.fromTableDataSourceId = 12
            }

            if (rule.fromTableSourceList != undefined) {
                rule.fromTableSourceList = [
                    {
                        id: 12,
                        label: "数据湖（TDSQL）"
                    }
                ]
            }

            if (rule.customSqlKey != undefined) {
                rule.customSqlKey = rule.customSqlKey.replaceAll(`${oldSourceTableName}.`, '');
            }
        })
    })

    return JSON.parse(updateSjkUUID(removeIds(paramJson)))
}

const removeRulesByField = (list: any, fields: string[]) => {
    return list.filter(item => !fields.includes(item.field))
}

const removeRulesByIds = (list: any, ids: string[]) => {
    return list.filter(item => !ids.includes(item.ruleList[0].inspectionRuleId))
}

const removeRulesByCustomSql = (list: any, str: string) => {
    return list.filter(item => {
        if (item.ruleList[0].customSql != undefined) {
            return !item.ruleList[0].customSql.includes(str)
        } else {
            return true
        }
    })
}

