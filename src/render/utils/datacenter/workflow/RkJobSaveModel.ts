import {add_work_flow, get_columns} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {findCommonElements} from "@render/utils/datacenter/findCommonElements";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {isEmpty, isNull} from "lodash-es";
import {format} from "sql-formatter";

/**
 * 入湖、入库任务保存模型类
 **/
export class RkJobSaveModel {
    name: string
    email: string
    description: string
    personId: string
    personName: string
    projectId: string
    projectName: string
    dependencyProjectId: string
    dependencyProjectName: string
    dependencyWorkflowId: string
    dependencyWorkflowName: string
    schedulingMode: 0 | 1 | 2 | number
    crontab: string
    type: string
    code: string
    modelXml: string
    modelJson: string
    dataDevBizVo: {
        dataSyncDtoList: any[]
        qualityInspectionDtoList: any[]
        mySqlDtoList: any[]
        postgreSqlDtoList: any[]
        trinoSqlDtoList: any[]
        conversionDtoList: any[]
        sparkSqlDtoList: {
            taskType: "TDBS-HIVE2MYSQL" | string,
            sourceDBId: any[],
            targetDBId: string,
            sql: string,
            sourceTable: string[],
            targetTable: string,
            sparkConfig: {
                saveMode: 'overwrite' | 'append'
            },
            taskInfoDto: {
                taskDefKey: string
            }
        }[]
    }

    /**
     * @param model 入库任务参数
     **/
    constructor(model: RkJobFormModel) {
        // 基础信息
        this.name = model.name
        this.projectId = model.projectId
        this.projectName = projectIdOptions.find(option => option.value === model.projectId).label as string
        this.personId = model.personId
        this.personName = personIdOptions.find(option => option.value === model.personId).label as string
        this.email = model.email || ''
        this.description = model.description || ''

        // 调度
        this.schedulingMode = 0
        this.dependencyProjectId = null
        this.dependencyProjectName = null
        this.dependencyWorkflowId = null
        this.dependencyWorkflowName = null
        this.crontab = ''
        this.type = "流程"

        this.dataDevBizVo = {
            mySqlDtoList: [],
            postgreSqlDtoList: [],
            trinoSqlDtoList: [],
            conversionDtoList: [],
            dataSyncDtoList: [],
            qualityInspectionDtoList: [],
            sparkSqlDtoList: [{
                taskType: 'TDBS-HIVE2MYSQL',
                sourceDBId: [`${model.sourceDataSourceId}`],
                targetDBId: model.targetDataSourceId,
                sql: null,
                sourceTable: [`${model.sourceTableName}`],
                targetTable: model.targetTableName,
                sparkConfig: {
                    saveMode: 'overwrite'
                },
                taskInfoDto: {
                    taskDefKey: null
                }
            }]
        }

        this.updateSjk()
    }

    public updateSjk() {
        const sjkTemplate = JSON.parse(updateSjkUUID({
            code: "sjk07f499ef4b934d79ae56629a061b699e",
            modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjk07f499ef4b934d79ae56629a061b699e\" name=\"sjk07f499ef4b934d79ae56629a061b699e\" isExecutable=\"true\">\n        <startEvent id=\"sjkc233d8c7359c461d89a6f4f83ceb77f7\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjkf3fc13bd07f545f0a386877d5302f525\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjk9c827209d3dc4818a253b7aad07389e8\" name=\"结束\"/>\n        <sequenceFlow id=\"sjk27cb39ec79244ef9a1027ce58c9fed06\" name=\"TDBS-Hive\" sourceRef=\"sjkc233d8c7359c461d89a6f4f83ceb77f7\" targetRef=\"sjkf3fc13bd07f545f0a386877d5302f525\"/>\n        <sequenceFlow id=\"sjk190be68c0ab2414da5c1d58baf493f07\" name=\"MySQL\" sourceRef=\"sjkf3fc13bd07f545f0a386877d5302f525\" targetRef=\"sjk9c827209d3dc4818a253b7aad07389e8\"/>\n    </process>\n</definitions>",
            modelJson: "{\"nodeList\":[{\"id\":\"sjkc233d8c7359c461d89a6f4f83ceb77f7\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjk84954b619bad4ebaac32323abefea6eb\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":{SOURCE_DB_ID},\"tableName\":\"{SOURCE_TABLE}\"},{\"id\":\"sjk5db9e53230de434dae1f70247d425daa\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/3d8232390940992d1515b8af2150bbc4.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"MySQL\",\"name\":\"MySQL\",\"databaseName\":{TARGET_DB_ID},\"tableName\":\"{TARGET_TABLE}\"},{\"id\":\"sjkf3fc13bd07f545f0a386877d5302f525\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/71f2f583f082a8d659c9336cab5dc360.svg\",\"size\":\"20\",\"delegateExpression\":\"dataDevSpTaskListener\",\"type\":\"component\",\"name\":\"数据开发(Spark SQL)\",\"taskType\":\"TDBS-Hive\"},{\"id\":\"sjk9c827209d3dc4818a253b7aad07389e8\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/fc24a27468b1b125d7cf415739058b41.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjkc233d8c7359c461d89a6f4f83ceb77f7\",\"to\":\"sjk84954b619bad4ebaac32323abefea6eb\",\"id\":\"sjkdb1de0a2d7a44c5d8077488e9aeb9a74\"},{\"from\":\"sjk84954b619bad4ebaac32323abefea6eb\",\"to\":\"sjkf3fc13bd07f545f0a386877d5302f525\",\"id\":\"sjk27cb39ec79244ef9a1027ce58c9fed06\"},{\"from\":\"sjkf3fc13bd07f545f0a386877d5302f525\",\"to\":\"sjk5db9e53230de434dae1f70247d425daa\",\"id\":\"sjkaea574ab40654d148a0e402b926904aa\"},{\"from\":\"sjk5db9e53230de434dae1f70247d425daa\",\"to\":\"sjk9c827209d3dc4818a253b7aad07389e8\",\"id\":\"sjk190be68c0ab2414da5c1d58baf493f07\"}]}",
        }))
        this.code = sjkTemplate.code
        this.modelXml = sjkTemplate.modelXml
        this.modelJson = sjkTemplate.modelJson
        this.dataDevBizVo.sparkSqlDtoList[0].taskInfoDto.taskDefKey = this.getTaskDefKeyByModelXml(this.modelXml)
    }

    public getTaskDefKeyByModelXml(modelXml: string) {
        const userTaskIdMatch = modelXml.match(/<userTask id="([^"]+)"/);
        if (userTaskIdMatch && userTaskIdMatch.length > 1) {
            return userTaskIdMatch[1];
        }
        return undefined;
    }

    /**
     * @param isRemoveId 是否去除ID字段
     * @param isRemoveDiff 是否去除不同名字段
     **/
    public async buildSql(isRemoveId: boolean, isRemoveDiff: boolean) {
        let sourceTableColumns = (await get_columns(this.dataDevBizVo.sparkSqlDtoList[0].sourceDBId[0], this.dataDevBizVo.sparkSqlDtoList[0].sourceTable[0], true))

        if (isEmpty(sourceTableColumns)) {
            window.$message.warning('来源表不存在')
            return null
        }

        let targetTableColumns = (await get_columns(this.dataDevBizVo.sparkSqlDtoList[0].targetDBId, this.dataDevBizVo.sparkSqlDtoList[0].targetTable, true))

        if (isEmpty(targetTableColumns)) {
            window.$message.warning('目标表不存在')
            return null
        }

        if (isRemoveId) {
            sourceTableColumns = sourceTableColumns.filter((c: string) => c !== 'id')
            targetTableColumns = targetTableColumns.filter((c: string) => c !== 'id')
        }
        if (isRemoveDiff) {
            const elements = findCommonElements(sourceTableColumns, targetTableColumns);
            sourceTableColumns = elements.commonArr1
        }

        // 现将cd_time替换成当前时间
        sourceTableColumns = sourceTableColumns.map(item => item.includes('cd_time') ? 'current_timestamp() as cd_time' : item);

        this.dataDevBizVo.sparkSqlDtoList[0].sql = format(`INSERT INTO ${this.dataDevBizVo.sparkSqlDtoList[0].targetTable}
                   SELECT ${sourceTableColumns.join(',')}
                  FROM ${this.dataDevBizVo.sparkSqlDtoList[0].sourceTable[0]}`, {language: 'mysql'})
    }

    /**
     * @param isRemoveId 是否去除ID字段
     * @param isRemoveDiff 是否去除不同名字段
     **/
    public async createJob(isRemoveId: boolean, isRemoveDiff: boolean) {
        await this.buildSql(isRemoveId, isRemoveDiff)
        this.setGlobalVariable()
        if (!isNull(this.dataDevBizVo.sparkSqlDtoList[0].sql)) {
            await add_work_flow(this).then((res) => {
                if (res.code == 200) {
                    window.$message.success('入库任务创建成功')
                } else {
                    window.$message.error(res.message)
                }
            })
        }
    }

    public setGlobalVariable() {
        this.modelJson = this.modelJson
            .replaceAll('{SOURCE_TABLE}', this.dataDevBizVo.sparkSqlDtoList[0].sourceTable[0])
            .replaceAll('{SOURCE_DB_ID}', this.dataDevBizVo.sparkSqlDtoList[0].sourceDBId[0])
            .replaceAll('{TARGET_TABLE}', this.dataDevBizVo.sparkSqlDtoList[0].targetTable)
            .replaceAll('{TARGET_DB_ID}', this.dataDevBizVo.sparkSqlDtoList[0].targetDBId)
    }

}

type RkJobFormModel = {
    name: string,
    projectId: string,
    personId: string,
    email?: string,
    description?: string,
    sourceDataSourceId: string,
    sourceTableName: string,
    targetDataSourceId: string,
    targetTableName: string,
}
