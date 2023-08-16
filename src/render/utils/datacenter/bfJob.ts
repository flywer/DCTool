import {find_by_project_id} from "@render/api/auxiliaryDb.api";
import {add_work_flow} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {cloneDeep} from "lodash-es";

export type BfFormModelType = {
    personId: string,
    projectId: string,
    tableName: string
}

const templateJson = {
    name: '',
    email: '',
    description: '',
    personId: '',
    personName: '',
    projectId: '',
    projectName: "",
    crontab: "",
    type: "流程",
    code: 'sjkeab27401755a4bc0b227dbe5a8d99f50',
    modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjkeab27401755a4bc0b227dbe5a8d99f50\" name=\"sjkeab27401755a4bc0b227dbe5a8d99f50\" isExecutable=\"true\">\n        <startEvent id=\"sjk0eb5bf28574d441097fc8cc2c17cdc3b\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjkf682c3b9355843e29a95df2246cca414\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjkf8ec68ef554b44b7b914b9663025eebf\" name=\"结束\"/>\n        <sequenceFlow id=\"sjka6d142d47f7b47b1a351d0672637bd4e\" name=\"TDBS-Hive\" sourceRef=\"sjk0eb5bf28574d441097fc8cc2c17cdc3b\" targetRef=\"sjkf682c3b9355843e29a95df2246cca414\"/>\n        <sequenceFlow id=\"sjke121d07d98f24c06a819f8e5d5e573f1\" name=\"TDBS-Hive\" sourceRef=\"sjkf682c3b9355843e29a95df2246cca414\" targetRef=\"sjkf8ec68ef554b44b7b914b9663025eebf\"/>\n    </process>\n</definitions>",
    modelJson: "{\"nodeList\":[{\"id\":\"sjk0eb5bf28574d441097fc8cc2c17cdc3b\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjk586b80b8921f42be8309e0ca5ef83a02\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"sourceTable\"},{\"id\":\"sjkf682c3b9355843e29a95df2246cca414\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/71f2f583f082a8d659c9336cab5dc360.svg\",\"size\":\"20\",\"delegateExpression\":\"dataDevSpTaskListener\",\"type\":\"component\",\"name\":\"数据开发(Spark SQL)\",\"taskType\":\"TDBS-Hive\"},{\"id\":\"sjk584dc87d1c4446709892adda78e9ce8f\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"targetTable\"},{\"id\":\"sjkf8ec68ef554b44b7b914b9663025eebf\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/fc24a27468b1b125d7cf415739058b41.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjk0eb5bf28574d441097fc8cc2c17cdc3b\",\"to\":\"sjk586b80b8921f42be8309e0ca5ef83a02\",\"id\":\"sjk14d15968054d4258b979bc3ae8924423\"},{\"from\":\"sjk586b80b8921f42be8309e0ca5ef83a02\",\"to\":\"sjkf682c3b9355843e29a95df2246cca414\",\"id\":\"sjka6d142d47f7b47b1a351d0672637bd4e\"},{\"from\":\"sjkf682c3b9355843e29a95df2246cca414\",\"to\":\"sjk584dc87d1c4446709892adda78e9ce8f\",\"id\":\"sjk5c93a040881a4f81a8d58f328d56ea61\"},{\"from\":\"sjk584dc87d1c4446709892adda78e9ce8f\",\"to\":\"sjkf8ec68ef554b44b7b914b9663025eebf\",\"id\":\"sjke121d07d98f24c06a819f8e5d5e573f1\"}]}",
    dataDevBizVo: {
        dataSyncDtoList: [],
        qualityInspectionDtoList: [],
        sparkSqlDtoList: [
            {
                taskInfoDto: {
                    taskDefKey: "sjkf682c3b9355843e29a95df2246cca414"
                },
                sparkConfig: {
                    saveMode: "append"
                },
                sql: "",
                id: "sjkf682c3b9355843e29a95df2246cca414",
                sourceDBId: [
                    6
                ],
                sourceTable: [
                    ""
                ],
                targetDBId: 6,
                targetTable: "",
                taskType: "TDBS-HIVE2TDBS-HIVE"
            }
        ],
        mySqlDtoList: [],
        postgreSqlDtoList: [],
        trinoSqlDtoList: [],
        conversionDtoList: []
    }
}

export const buildBfJson = async (formModel: BfFormModelType) => {

    formModel.tableName = formModel.tableName.toLowerCase()

    const project = (await find_by_project_id(formModel.projectId))

    const sourceTable = `di_${project?.tableAbbr}_${formModel.tableName}_temp_ods`
    const targetTable = `di_${project?.tableAbbr}_${formModel.tableName}_ods`

    let paramsJson = cloneDeep(templateJson)

    paramsJson.modelJson = paramsJson.modelJson.replace(/sourceTable/g, `${sourceTable}`).replace(/targetTable/g, `${targetTable}`)

    paramsJson = JSON.parse(updateSjkUUID(removeIds(paramsJson)))

    paramsJson.name = `bf_${project.projectAbbr}_${formModel.tableName}`
    paramsJson.projectId = formModel.projectId
    paramsJson.projectName = projectIdOptions.find(option => option.value === formModel.projectId).label as string
    paramsJson.personId = formModel.personId
    paramsJson.personName = personIdOptions.find(option => option.value === formModel.personId).label as string

    // language=SQL format=false
    paramsJson.dataDevBizVo.sparkSqlDtoList[0].sql = `INSERT INTO ` + `${targetTable}` + ' SELECT * FROM ' + `${sourceTable}`
    paramsJson.dataDevBizVo.sparkSqlDtoList[0].sourceTable = [`${sourceTable}`]
    paramsJson.dataDevBizVo.sparkSqlDtoList[0].targetTable = targetTable

    return paramsJson
}

export const createBfJob = async (formModel: BfFormModelType) => {
    add_work_flow(await buildBfJson(formModel)).then((res) => {
        if (res.code == 200) {
            window.$message.success('备份任务创建成功')
        } else {
            window.$message.error(res.message)
        }
    })
}
