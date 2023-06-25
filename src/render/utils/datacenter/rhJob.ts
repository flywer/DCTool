import {
    find_by_project_id,
    get_rh_json,
    get_rh_json_by_id, get_table_sql
} from "@render/api/auxiliaryDb";
import {add_work_flow} from "@render/api/datacenter";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {cloneDeep} from "lodash-es";

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
 **/
export const buildRhJson = async (formModel: RhFormModelType, templateJson: any, isBasicData: boolean) => {

    if (templateJson != null) {
        const project = await find_by_project_id(formModel.projectId)

        const projectAbbr = project?.projectAbbr || ''

        if (isBasicData) {
            templateJson.name = `rh_${projectAbbr}_${formModel.tableName.toLowerCase()}`
        } /* /!* else if (isMultiTableJson) {
            templateJson.name = `rh2_${projectAbbr}_${formModel.tableName.toLowerCase()}` *!/
        }  */ else {
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

const templateJson = {
    name: '',
    email: '',
    description: '',
    personId: '',
    personName: '',
    projectId: '',
    projectName: '',
    crontab: '',
    type: "流程",
    code: 'sjk45196358bf9149f289f431a3ed48d37b',
    modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjk45196358bf9149f289f431a3ed48d37b\" name=\"sjk45196358bf9149f289f431a3ed48d37b\" isExecutable=\"true\">\n        <startEvent id=\"sjkd564ce3ac49449feafe224a3ec7ce9de\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjk584f23e6fbcb42528847a59c962bca83\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjk515d0bf22e19430aa1ed28e5c5a8a096\" name=\"结束\"/>\n        <sequenceFlow id=\"sjk2e1a3b714a8840d4ad8aa77d9d258c62\" name=\"TDBS-Hive\" sourceRef=\"sjkd564ce3ac49449feafe224a3ec7ce9de\" targetRef=\"sjk584f23e6fbcb42528847a59c962bca83\"/>\n        <sequenceFlow id=\"sjk0e72c1985a1b44b98000fbe695b87ffb\" name=\"TDBS-Hive\" sourceRef=\"sjk584f23e6fbcb42528847a59c962bca83\" targetRef=\"sjk515d0bf22e19430aa1ed28e5c5a8a096\"/>\n    </process>\n</definitions>",
    modelJson: "{\"nodeList\":[{\"id\":\"sjkd564ce3ac49449feafe224a3ec7ce9de\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjkc650b8c022eb470cb5e4ecd7dadcf07b\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"df_depart_tableName_dwb\"},{\"id\":\"sjka1d8460e0fe5417e846cfbe764ff510b\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"sztk_tableName_dm\"},{\"id\":\"sjk584f23e6fbcb42528847a59c962bca83\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/71f2f583f082a8d659c9336cab5dc360.svg\",\"size\":\"20\",\"delegateExpression\":\"dataDevSpTaskListener\",\"type\":\"component\",\"name\":\"数据开发(Spark SQL)\"},{\"id\":\"sjkf13a977ed6394695a14e22ab257ba4a0\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"sztk_tableName_dm\"},{\"id\":\"sjk515d0bf22e19430aa1ed28e5c5a8a096\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/fc24a27468b1b125d7cf415739058b41.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjkd564ce3ac49449feafe224a3ec7ce9de\",\"to\":\"sjkc650b8c022eb470cb5e4ecd7dadcf07b\",\"id\":\"sjkc257e38a8b59419fb7574dc427590c9c\"},{\"from\":\"sjkd564ce3ac49449feafe224a3ec7ce9de\",\"to\":\"sjka1d8460e0fe5417e846cfbe764ff510b\",\"id\":\"sjkdeeab9335c0f471795dbfda467823292\"},{\"from\":\"sjka1d8460e0fe5417e846cfbe764ff510b\",\"to\":\"sjk584f23e6fbcb42528847a59c962bca83\",\"id\":\"sjkcde188685a9641a09516de0cee22039b\"},{\"from\":\"sjkc650b8c022eb470cb5e4ecd7dadcf07b\",\"to\":\"sjk584f23e6fbcb42528847a59c962bca83\",\"id\":\"sjk2e1a3b714a8840d4ad8aa77d9d258c62\"},{\"from\":\"sjk584f23e6fbcb42528847a59c962bca83\",\"to\":\"sjkf13a977ed6394695a14e22ab257ba4a0\",\"id\":\"sjk291a008d3eca47f487bfa2c1d748e022\"},{\"from\":\"sjkf13a977ed6394695a14e22ab257ba4a0\",\"to\":\"sjk515d0bf22e19430aa1ed28e5c5a8a096\",\"id\":\"sjk0e72c1985a1b44b98000fbe695b87ffb\"}]}",
    dataDevBizVo: {
        dataSyncDtoList: [],
        qualityInspectionDtoList: [],
        sparkSqlDtoList: [
            {
                taskInfoDto: {
                    taskDefKey: "sjk584f23e6fbcb42528847a59c962bca83"
                },
                sparkConfig: {
                    saveMode: "overwrite"
                },
                sql: "INSERT INTO sztk_tableName_dm SELECT * FROM df_depart_tableName_dwb UNION ALL SELECT t1.* FROM sztk_tableName_dm t1 LEFT JOIN ( SELECT CONCAT(primId, OPT_AREA_CODE) AS uniqId FROM df_depart_tableName_dwb ) t2 ON CONCAT(t1.primId, t1.OPT_AREA_CODE) = t2.uniqId WHERE t2.uniqId IS NULL",
                id: "sjk584f23e6fbcb42528847a59c962bca83",
                sourceDBId: [
                    6,
                    6
                ],
                sourceTable: [
                    "df_depart_tableName_dwb",
                    "sztk_tableName_dm"
                ],
                targetDBId: 6,
                targetTable: "sztk_tableName_dm",
                taskType: "TDBS-HIVE2TDBS-HIVE"
            }
        ],
        mySqlDtoList: [],
        postgreSqlDtoList: [],
        trinoSqlDtoList: [],
        conversionDtoList: []
    }
}

export const buildRh2Json = async (formModel: RhFormModelType) => {

    let paramsJson = cloneDeep(templateJson)

    const project = await find_by_project_id(formModel.projectId)
    const projectAbbr = project?.projectAbbr || ''
    const tableAbbr = project?.tableAbbr || ''

    const primId = (await get_table_sql({tableName: formModel.tableName}))[0].pColName as string

    paramsJson.name = `rh2_${projectAbbr}_${formModel.tableName.toLowerCase()}`
    paramsJson.personId = formModel.personId
    paramsJson.personName = personIdOptions.find(option => option.value === formModel.personId).label as string
    paramsJson.projectId = formModel.projectId
    paramsJson.projectName = projectIdOptions.find(option => option.value === formModel.projectId).label as string

    paramsJson = JSON.parse(JSON.stringify(paramsJson)
        .replaceAll('tableName', formModel.tableName.toLowerCase())
        .replaceAll('depart', tableAbbr.toLowerCase())
        .replaceAll('primId', primId.toLowerCase())
    )

    return JSON.parse(updateSjkUUID(removeIds(paramsJson)))
}

export const createRhJob = async (formModel: RhFormModelType, isBasicData: boolean, isMultiTableJson: boolean) => {
    let templateJsonStr
    let rh2Json
    if (formModel.jobJsonId != undefined) {
        const jobJson = await get_rh_json_by_id(Number(formModel.jobJsonId));
        if (isMultiTableJson) {
            // templateJsonStr = jobJson?.rh2Json || null;
        } else {
            templateJsonStr = jobJson?.rh1Json || null;
        }

        formModel.tableName = jobJson?.tableName.toLowerCase() || null;
    } else if (formModel.jobJsonId == undefined && formModel.tableName != null) {
        if (isMultiTableJson) {
            //templateJsonStr = jobJson[0]?.rh2Json || null;
            rh2Json = await buildRh2Json(formModel)
        } else {
            const jobJson = await get_rh_json(formModel.tableName)
            if (jobJson.length > 0) {
                // 若不知道jsonId则使用tableName获取json
                templateJsonStr = jobJson[0]?.rh1Json || null;
            } else {
                templateJsonStr = null;
            }
        }
    }

    let paramsJson
    if (isMultiTableJson) {
        paramsJson = rh2Json
    } else {
        paramsJson = await buildRhJson(formModel, JSON.parse(templateJsonStr), isBasicData);
    }

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


