import {add_work_flow, get_columns} from "@render/api/datacenter";
import {datasourceOptions, personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {findCommonElements} from "@render/utils/datacenter/findCommonElements";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {cloneDeep, isEmpty} from "lodash-es";
import {format} from "sql-formatter";

export type RkFormModelType = {
    name: string,
    sourceDataSourceId: string,
    sourceTableName: string,
    targetDataSourceId: string,
    targetTableName: string,
    projectId: string,
    personId: string,
    tableName?: string,
    email?: string,
    description?: string,
}

export const buildSql = async (formModel: RkFormModelType, isRemoveId: boolean, isRemoveDiff: boolean) => {
    let sourceTableColumns = (await get_columns(formModel.sourceDataSourceId, formModel.sourceTableName, true))

    if (isEmpty(sourceTableColumns)) {
        window.$message.warning('来源表不存在')
        return ''
    }

    let targetTableColumns = (await get_columns(formModel.targetDataSourceId, formModel.targetTableName, true))

    if (isEmpty(targetTableColumns)) {
        window.$message.warning('目标表不存在')
        return ''
    }

    if (isRemoveId) {
        sourceTableColumns = sourceTableColumns.filter(c => c !== 'id')
        targetTableColumns = targetTableColumns.filter(c => c !== 'id')
    }
    if (isRemoveDiff) {
        const elements = findCommonElements(sourceTableColumns, targetTableColumns);
        sourceTableColumns = elements.commonArr1
        targetTableColumns = elements.commonArr2
    }

    // 因中台问题，需要为hive表的字段取一个与目标表相同的别名
    /*     const columnMappings = targetTableColumns.map((targetColumn, index) => {
            const sourceColumn = sourceTableColumns[index];
            return `${sourceColumn} as ${targetColumn}`;
        }) */

    return format(`INSERT INTO ${formModel.targetTableName}
                   SELECT ${sourceTableColumns.join(',')}
                   FROM ${formModel.sourceTableName}`, {language: 'mysql'})
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
    code: 'sjk07f499ef4b934d79ae56629a061b699e',
    modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjk07f499ef4b934d79ae56629a061b699e\" name=\"sjk07f499ef4b934d79ae56629a061b699e\" isExecutable=\"true\">\n        <startEvent id=\"sjkc233d8c7359c461d89a6f4f83ceb77f7\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjkf3fc13bd07f545f0a386877d5302f525\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjk9c827209d3dc4818a253b7aad07389e8\" name=\"结束\"/>\n        <sequenceFlow id=\"sjk27cb39ec79244ef9a1027ce58c9fed06\" name=\"TDBS-Hive\" sourceRef=\"sjkc233d8c7359c461d89a6f4f83ceb77f7\" targetRef=\"sjkf3fc13bd07f545f0a386877d5302f525\"/>\n        <sequenceFlow id=\"sjk190be68c0ab2414da5c1d58baf493f07\" name=\"MySQL\" sourceRef=\"sjkf3fc13bd07f545f0a386877d5302f525\" targetRef=\"sjk9c827209d3dc4818a253b7aad07389e8\"/>\n    </process>\n</definitions>",
    modelJson: "{\"nodeList\":[{\"id\":\"sjkc233d8c7359c461d89a6f4f83ceb77f7\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjk84954b619bad4ebaac32323abefea6eb\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":sourceDBId,\"tableName\":\"sourceTable\"},{\"id\":\"sjk5db9e53230de434dae1f70247d425daa\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/3d8232390940992d1515b8af2150bbc4.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"MySQL\",\"name\":\"MySQL\",\"databaseName\":targetDBId,\"tableName\":\"targetTable\"},{\"id\":\"sjkf3fc13bd07f545f0a386877d5302f525\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/71f2f583f082a8d659c9336cab5dc360.svg\",\"size\":\"20\",\"delegateExpression\":\"dataDevSpTaskListener\",\"type\":\"component\",\"name\":\"数据开发(Spark SQL)\",\"taskType\":\"TDBS-Hive\"},{\"id\":\"sjk9c827209d3dc4818a253b7aad07389e8\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/fc24a27468b1b125d7cf415739058b41.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjkc233d8c7359c461d89a6f4f83ceb77f7\",\"to\":\"sjk84954b619bad4ebaac32323abefea6eb\",\"id\":\"sjkdb1de0a2d7a44c5d8077488e9aeb9a74\"},{\"from\":\"sjk84954b619bad4ebaac32323abefea6eb\",\"to\":\"sjkf3fc13bd07f545f0a386877d5302f525\",\"id\":\"sjk27cb39ec79244ef9a1027ce58c9fed06\"},{\"from\":\"sjkf3fc13bd07f545f0a386877d5302f525\",\"to\":\"sjk5db9e53230de434dae1f70247d425daa\",\"id\":\"sjkaea574ab40654d148a0e402b926904aa\"},{\"from\":\"sjk5db9e53230de434dae1f70247d425daa\",\"to\":\"sjk9c827209d3dc4818a253b7aad07389e8\",\"id\":\"sjk190be68c0ab2414da5c1d58baf493f07\"}]}",
    dataDevBizVo: {
        dataSyncDtoList: [],
        qualityInspectionDtoList: [],
        sparkSqlDtoList: [
            {
                taskType: "TDBS-HIVE2MYSQL",
                sourceDBId: [],
                targetDBId: '',
                sql: "",
                sourceTable: [
                    ""
                ],
                targetTable: "",
                sparkConfig: {
                    saveMode: "overwrite"
                },
                taskInfoDto: {
                    taskDefKey: "sjkf3fc13bd07f545f0a386877d5302f525"
                },
                id: "sjkf3fc13bd07f545f0a386877d5302f525"
            }
        ],
        mySqlDtoList: [],
        postgreSqlDtoList: [],
        trinoSqlDtoList: [],
        conversionDtoList: []
    }
}

export const buildRkJson = async (formModel: RkFormModelType, isRemoveId: boolean, isRemoveDiff: boolean) => {

    let paramsJson = cloneDeep(templateJson)

    paramsJson.modelJson = paramsJson.modelJson
        .replace(/sourceTable/g, `${formModel.sourceTableName}`)
        .replace(/targetTable/g, `${formModel.targetTableName}`)
        .replace(/sourceDBId/g, formModel.sourceDataSourceId)
        .replace(/targetDBId/g, formModel.targetDataSourceId)

    paramsJson = JSON.parse(updateSjkUUID(removeIds(paramsJson)))

    paramsJson.name = formModel.name
    paramsJson.projectId = formModel.projectId
    paramsJson.projectName = projectIdOptions.find(option => option.value === formModel.projectId).label as string
    paramsJson.personId = formModel.personId
    paramsJson.personName = personIdOptions.find(option => option.value === formModel.personId).label as string
    paramsJson.email = formModel.email
    paramsJson.description = formModel.description

    // const sourceDatasource = datasourceOptions.find(option => option.value === formModel.sourceDataSourceId).datasource as string;
    // const targetDataSource = datasourceOptions.find(option => option.value === formModel.targetDataSourceId).datasource as string;
    // paramsJson.dataDevBizVo.sparkSqlDtoList[0].taskType = `${sourceDatasource.toUpperCase()}2${targetDataSource.toUpperCase()}`
    paramsJson.dataDevBizVo.sparkSqlDtoList[0].taskType = 'TDBS-HIVE2MYSQL'

    paramsJson.dataDevBizVo.sparkSqlDtoList[0].sourceDBId = [`${formModel.sourceDataSourceId}`]
    paramsJson.dataDevBizVo.sparkSqlDtoList[0].targetDBId = formModel.targetDataSourceId
    paramsJson.dataDevBizVo.sparkSqlDtoList[0].sql = await buildSql(formModel, isRemoveId, isRemoveDiff)
    paramsJson.dataDevBizVo.sparkSqlDtoList[0].sourceTable = [`${formModel.sourceTableName}`]
    paramsJson.dataDevBizVo.sparkSqlDtoList[0].targetTable = formModel.targetTableName

    return paramsJson
}

/**
 * @param formModel
 * @param isRemoveId 是否去除ID字段
 * @param isRemoveDiff 是否去除不同名字段
 **/
export const createRkJob = async (formModel: RkFormModelType, isRemoveId: boolean, isRemoveDiff: boolean) => {
    add_work_flow(await buildRkJson(formModel, isRemoveId, isRemoveDiff)).then((res) => {
        if (res.code == 200) {
            window.$message.success('入库任务创建成功')
        } else {
            window.$message.error(res.message)
        }
    })
}
