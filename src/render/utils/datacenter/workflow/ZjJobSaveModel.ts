import {find_field_insp_rule} from "@render/api/auxiliaryDb/fieldInspectionRule.api";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {find_template_struct_table, save_struct_table_job_rel} from "@render/api/auxiliaryDb/templateStructTable.api";
import {add_work_flow, get_workflow, update_workflow} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";

/**
 * 质检任务保存模型类
 **/
export class ZjJobSaveModel {
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
        sparkSqlDtoList: any[]
        mySqlDtoList: any[]
        postgreSqlDtoList: any[]
        trinoSqlDtoList: any[]
        conversionDtoList: any[]
        dataSyncDtoList: any[]
        qualityInspectionDtoList: {
            sourceDbId: string
            sourceTableName: string
            inspectionRangeType: string
            incrementColumnName: string
            incrementColumnValueInit: string
            aimDbId: string
            aimTableName: string
            wrongDbId: string
            wrongTableName: string
            principalDtoList: any[]
            qualityInspectionFieldList: {
                field: string,
                ruleList: RuleList
            }[]
            taskInfoDto: {
                taskDefKey: string
            }
        }[]
    }
    structTableId: number

    constructor(name?: string, email?: string, description?: string) {
        // 基础信息
        this.name = name || ''
        this.email = email || ''
        this.description = description || ''

        // 调度
        this.schedulingMode = 0
        this.dependencyProjectId = null
        this.dependencyProjectName = null
        this.dependencyWorkflowId = null
        this.dependencyWorkflowName = null
        this.crontab = ''
        this.type = "流程"

        // dataDevBizVo
        this.dataDevBizVo = {
            sparkSqlDtoList: [],
            mySqlDtoList: [],
            postgreSqlDtoList: [],
            trinoSqlDtoList: [],
            conversionDtoList: [],
            dataSyncDtoList: [],
            qualityInspectionDtoList: [{
                sourceDbId: '6',
                sourceTableName: `di_{PROJECT}_{TABLE_NAME}_temp_ods`,
                inspectionRangeType: '0',
                incrementColumnName: null,
                incrementColumnValueInit: null,
                aimDbId: '6',
                aimTableName: `di_{PROJECT}_{TABLE_NAME}_right_dwd`,
                wrongDbId: '6',
                wrongTableName: 'di_{PROJECT}_{TABLE_NAME}_error_dwd',
                principalDtoList: [],
                qualityInspectionFieldList: [],
                taskInfoDto: {
                    taskDefKey: ''
                }
            }]
        }

        // sjk
        this.updateSjk()
    }

    public updateSjk() {
        const sjkTemplate = JSON.parse(updateSjkUUID({
            code: "sjk8e20a50e61e54b2c804d049c04f69028",
            modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjk8e20a50e61e54b2c804d049c04f69028\" name=\"sjk8e20a50e61e54b2c804d049c04f69028\" isExecutable=\"true\">\n        <startEvent id=\"sjkd5a871b435bb48c4a0ee041d033cbfef\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjkaa2a4c71ea61443282a0ee228ae92659\" name=\"数据质检\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataQuInTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjkd0eecad201414233bfad63dfb8e19ffc\" name=\"结束\"/>\n        <sequenceFlow id=\"sjkb7d88964ac63447bb1778a95dd395bf3\" name=\"TDBS-Hive\" sourceRef=\"sjkd5a871b435bb48c4a0ee041d033cbfef\" targetRef=\"sjkaa2a4c71ea61443282a0ee228ae92659\"/>\n        <sequenceFlow id=\"sjk5d3a9d4ea6a84f34b97493d381eb4019\" name=\"TDBS-Hive\" sourceRef=\"sjkaa2a4c71ea61443282a0ee228ae92659\" targetRef=\"sjkd0eecad201414233bfad63dfb8e19ffc\"/>\n    </process>\n</definitions>",
            modelJson: "{\"nodeList\":[{\"id\":\"sjkd5a871b435bb48c4a0ee041d033cbfef\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjk5bb36ef44fc24116b73b2f11220774dc\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"di_{PROJECT}_{TABLE_NAME}_temp_ods\"},{\"id\":\"sjkaa2a4c71ea61443282a0ee228ae92659\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/10b677b7f9ea1e0d12abb1cc1d0a508a.svg\",\"size\":\"20\",\"delegateExpression\":\"dataQuInTaskListener\",\"type\":\"component\",\"name\":\"数据质检\"},{\"id\":\"sjkf15efcf3fa484e38a1198fd86476ff47\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"di_{PROJECT}_{TABLE_NAME}_right_dwd\"},{\"id\":\"sjk53f0c64776bd4ae3b1315e168dbdc15c\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"di_{PROJECT}_{TABLE_NAME}_error_dwd\"},{\"id\":\"sjkd0eecad201414233bfad63dfb8e19ffc\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/fc24a27468b1b125d7cf415739058b41.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjkd5a871b435bb48c4a0ee041d033cbfef\",\"to\":\"sjk5bb36ef44fc24116b73b2f11220774dc\",\"id\":\"sjk2f507bde4ad3406d99feaed7bb70c423\"},{\"from\":\"sjk5bb36ef44fc24116b73b2f11220774dc\",\"to\":\"sjkaa2a4c71ea61443282a0ee228ae92659\",\"id\":\"sjkb7d88964ac63447bb1778a95dd395bf3\"},{\"from\":\"sjkaa2a4c71ea61443282a0ee228ae92659\",\"to\":\"sjkf15efcf3fa484e38a1198fd86476ff47\",\"id\":\"sjk955ef6e614fb468887df93c984c6a4c5\"},{\"from\":\"sjkaa2a4c71ea61443282a0ee228ae92659\",\"to\":\"sjk53f0c64776bd4ae3b1315e168dbdc15c\",\"id\":\"sjke0429660901746c9a5dc163f1d4b0254\"},{\"from\":\"sjk53f0c64776bd4ae3b1315e168dbdc15c\",\"to\":\"sjkd0eecad201414233bfad63dfb8e19ffc\",\"id\":\"sjk21ced6465033432cb34498e9aaf8eded\"},{\"from\":\"sjkf15efcf3fa484e38a1198fd86476ff47\",\"to\":\"sjkd0eecad201414233bfad63dfb8e19ffc\",\"id\":\"sjk5d3a9d4ea6a84f34b97493d381eb4019\"}]}"
        }))
        this.code = sjkTemplate.code
        this.modelXml = sjkTemplate.modelXml
        this.modelJson = sjkTemplate.modelJson
        this.dataDevBizVo.qualityInspectionDtoList[0].taskInfoDto.taskDefKey = this.getTaskDefKeyByModelXml(this.modelXml)
    }

    public getTaskDefKeyByModelXml(modelXml: string) {
        const userTaskIdMatch = modelXml.match(/<userTask id="([^"]+)"/);
        if (userTaskIdMatch && userTaskIdMatch.length > 1) {
            return userTaskIdMatch[1];
        }
        return undefined;
    }

    // 通过质检模板结构表ID设置字段质检规则
    public async setTableFieldRules(structTableId: number) {
        const inspRules = await find_field_insp_rule({tableId: structTableId})

        this.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList = []

        for (const inspRule of inspRules) {
            if (inspRule.ruleType == 2) {
                const relInspRule = (await find_field_insp_rule({id: inspRule.referenceRuleId}))[0]
                this.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.push({
                    field: inspRule.fieldName.toLowerCase(),
                    ruleList: JSON.parse(relInspRule.ruleList)
                })
            } else {
                this.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.push({
                    field: inspRule.fieldName.toLowerCase(),
                    ruleList: JSON.parse(inspRule.ruleList)
                })
            }
        }

        this.structTableId = structTableId
    }

    public setProject(projectId: string) {
        this.projectId = projectId
        this.projectName = projectIdOptions.find(option => option.value === projectId).label as string
    }

    public setPerson(personId: string) {
        this.personId = personId
        this.personName = personIdOptions.find(option => option.value === personId).label as string
    }

    // 设置模型内所有全局变量
    public setGlobalVariable(variable: {
        project?: string,
        tableName?: string
    }) {
        this.name = this.name
            .replaceAll('{PROJECT}', variable.project ? variable.project : 'ssft')
            .replaceAll('{TABLE_NAME}', variable.tableName ? variable.tableName : 'c1010')

        this.email = this.email
            .replaceAll('{PROJECT}', variable.project ? variable.project : 'ssft')
            .replaceAll('{TABLE_NAME}', variable.tableName ? variable.tableName : 'c1010')

        this.description = this.description
            .replaceAll('{PROJECT}', variable.project ? variable.project : 'ssft')
            .replaceAll('{TABLE_NAME}', variable.tableName ? variable.tableName : 'c1010')

        this.modelXml = this.modelXml
            .replaceAll('{PROJECT}', variable.project ? variable.project : 'ssft')
            .replaceAll('{TABLE_NAME}', variable.tableName ? variable.tableName : 'c1010')

        this.modelJson = this.modelJson
            .replaceAll('{PROJECT}', variable.project ? variable.project : 'ssft')
            .replaceAll('{TABLE_NAME}', variable.tableName ? variable.tableName : 'c1010')

        this.dataDevBizVo = JSON.parse(
            JSON.stringify(this.dataDevBizVo)
                .replaceAll('{PROJECT}', variable.project ? variable.project : 'ssft')
                .replaceAll('{TABLE_NAME}', variable.tableName ? variable.tableName : 'c1010')
        )
    }

    /**
     * 创建质检任务
     **/
    public async createZjJob() {

        if (!this.projectId) {
            this.setProject('21')
        }
        if (!this.personId) {
            this.setPerson('1649250175324086274')
        }

        // 替换所有变量
        const templateJson = JSON.parse(JSON.stringify(this)
            .replaceAll('{PROJECT}', 'ssft')
            .replaceAll('{TABLE_NAME}', 'c1010'))

        await add_work_flow(templateJson).then((res) => {
            if (res.code == 200) {
                window.$message.success(`质检任务[${this.name}]创建成功`)
                save_struct_table_job_rel(this.structTableId, res.data.id)
            } else {
                window.$message.error(res.message)
            }
        })
    }

    /**
     * 快速创建任务
     **/
    public async quickCreate(projectId: string, personId: string, structTableId: number) {
        const {
            projectAbbr,
            tableAbbr
        } = await find_by_project_id(projectId)
        const table = (await find_template_struct_table({id: structTableId}))[0]

        this.name = `zj_${projectAbbr}_${table.tableName.toLowerCase()}`

        await this.setTableFieldRules(structTableId)
        this.setPerson(personId)
        this.setProject(projectId)
        this.setGlobalVariable({
            project: tableAbbr,
            tableName: table.tableName.toLowerCase()
        })

        await this.createZjJob()
    }

    public async setByWorkflowInfo(workflowId: string) {
        const workflow = (await get_workflow(workflowId)).data

        this.name = workflow.procName
        this.email = workflow.email
        this.description = workflow.description
        this.personId = workflow.personId
        this.personName = workflow.personName
        this.projectId = workflow.projectId
        this.projectName = workflow.projectName
        this.dependencyProjectId = workflow.dependencyProjectId.toString()
        this.dependencyProjectName = workflow.dependencyProjectName
        this.dependencyWorkflowId = workflow.dependencyWorkflowId.toString()
        this.dependencyWorkflowName = workflow.dependencyWorkflowName
        this.schedulingMode = parseInt(workflow.schedulingMode)
        this.crontab = workflow.crontab
        this.code = workflow.procCode
        this.modelXml = workflow.modelXml
        this.modelJson = workflow.modelJson
        this.dataDevBizVo = JSON.parse(workflow.businessParamsJson)

    }

    public async updateJobFieldInspRules(workflowId: string, structTableId: number) {
        await this.setByWorkflowInfo(workflowId)
        await this.setTableFieldRules(structTableId)

        this.updateSjk()

        const {tableAbbr} = (await find_by_project_id(this.projectId))
        const table = (await find_template_struct_table({id: structTableId}))[0]
        this.setGlobalVariable({
            project: tableAbbr,
            tableName: table.tableName.toLowerCase()
        })

        await update_workflow(workflowId, this).then((res) => {
            if (res.success) {
                window.$message.success(res.message)
                save_struct_table_job_rel(this.structTableId, workflowId)
            } else {
                window.$message.error(res.message)
            }
        })

    }

}

type RuleList = {
    dimension: string
    inspectionRuleId: string
    impactLevel: string

    // 及时性质检
    ruleOperatorRightValue?: string,
    ruleOperator?: string

    // 主外键一致性质检
    fromTableDataSourceId?: string
    fromTableDataTable?: string
    fromTableField?: string

    // 值域校验
    standardSpecificationId?: string
    standardCodeSetId?: string

    // 前缀/后缀质检
    prefix?: any[]
    suffix?: any[]

    // 最大/最小长度质检
    maxSize?: string
    minSize?: string

    // 数字字段质检
    numType?: '1' | '2'

    // 枚举质检
    enumsValue?: string[]

    // 正则质检
    regularValue?: string

    // 自定义质检
    customSqlKey?: string
    customSql?: string
    customDescribe?: string
}

