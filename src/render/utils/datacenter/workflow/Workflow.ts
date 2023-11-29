import {add_work_flow} from "@render/api/datacenter.api";
import {workflowJobNameExist} from "@render/utils/datacenter/jobNameExist";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {uuid} from "vue3-uuid";

export class Workflow {
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
        mySqlDtoList: any[]
        postgreSqlDtoList: any[]
        trinoSqlDtoList: any[]
        conversionDtoList: any[]
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
        sparkSqlDtoList: {
            taskType: "TDBS-HIVE2MYSQL" | 'TDBS-HIVE2TDBS-HIVE' | string,
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

    public static getCodeByModelXml(modelXml: string) {
        const userTaskIdMatch = modelXml.match(/<process id="([^"]+)"/);
        if (userTaskIdMatch && userTaskIdMatch.length > 1) {
            return userTaskIdMatch[1];
        }
        return undefined;
    }

    public static getTaskDefKeyByModelXml(modelXml: string) {
        const userTaskIdMatch = modelXml.match(/<userTask id="([^"]+)"/);
        if (userTaskIdMatch && userTaskIdMatch.length > 1) {
            return userTaskIdMatch[1];
        }
        return undefined;
    }

    public static async createJob(json: any, successMsg: string) {
        if (!await workflowJobNameExist(json.name)) {
            add_work_flow(json).then((res) => {
                if (res.code == 200) {
                    window.$message.success(successMsg)
                } else {
                    window.$message.error(res.message)
                }
            })
        } else {
            window.$message.warning(`任务名[${json.name}]已存在`)
        }
    }

    /**
     * 通过来源表与目标表创建modelXml与modelJson
     **/
    protected static createModalByTables(
        sourceTable: {
            tableName: string[],
            dBId: number
        },
        targetTable: {
            tableName: string,
            dBId: number
        }) {
        let modelJson: ModelJson = {
            nodeList: [
                {
                    id: "sjkccd4823a46b64b6ab8e27ca2d7d790ab",
                    shape: "image",
                    image: "/szrzyt/data_center/tdbs-dev/65accb422a8d3f181bbbc1c537006cc0.svg",
                    size: "20",
                    type: "startProcess",
                    name: "开始"
                },
                {
                    id: "sjk4885a18eddad4215a7c8d05645dc09a9",
                    shape: "image",
                    image: "/szrzyt/data_center/tdbs-dev/fea7e3bc7f3297c8652a8aa51c964606.svg",
                    size: "20",
                    delegateExpression: "dataDevSpTaskListener",
                    type: "component",
                    name: "数据开发(Spark SQL)"
                },
                {
                    id: "sjk100325c69a3c4af9981f99cb8ac16dc2",
                    shape: "image",
                    image: "/szrzyt/data_center/tdbs-dev/198b2349289796a4476408838a50f944.svg",
                    size: "20",
                    type: "endProcess",
                    name: "结束"
                }
            ],
            edgesList: []
        }
        const startProcessId = "sjkccd4823a46b64b6ab8e27ca2d7d790ab"
        const sparkSqlId = "sjk4885a18eddad4215a7c8d05645dc09a9"
        const endProcessId = "sjk100325c69a3c4af9981f99cb8ac16dc2"

        sourceTable.tableName.forEach((tableName) => {

            const nodeId = 'sjk' + uuid.v4().replace(/-/g, '')

            modelJson.nodeList.push({
                id: nodeId,
                shape: "image",
                image: "/szrzyt/data_center/tdbs-dev/32a601d50ea448553386f286a6911239.svg",
                size: "20",
                type: "database",
                database: sourceTable.dBId == 6 ? "TDBS-Hive" : 'MySQL',
                name: sourceTable.dBId == 6 ? "TDBS-Hive" : 'MySQL',
                databaseName: sourceTable.dBId,
                tableName: tableName
            })

            // 开始节点与来源表节点相连
            modelJson.edgesList.push({
                from: startProcessId,
                to: nodeId,
                id: 'sjk' + uuid.v4().replace(/-/g, '')
            })

            // 来源表节点相连与SparkSql节点相连
            modelJson.edgesList.push({
                from: nodeId,
                to: sparkSqlId,
                id: 'sjk' + uuid.v4().replace(/-/g, '')
            })

        })

        const targetNodeId = 'sjk' + uuid.v4().replace(/-/g, '')

        modelJson.nodeList.push({
            id: targetNodeId,
            shape: "image",
            image: targetTable.dBId == 6 ? "/szrzyt/data_center/tdbs-dev/32a601d50ea448553386f286a6911239.svg" : "/szrzyt/data_center/tdbs-dev/3d8232390940992d1515b8af2150bbc4.svg",
            size: "20",
            type: "database",
            database: targetTable.dBId == 6 ? "TDBS-Hive" : 'MySQL',
            name: targetTable.dBId == 6 ? "TDBS-Hive" : 'MySQL',
            databaseName: targetTable.dBId,
            tableName: targetTable.tableName
        })

        // SparkSql节点与目标表相连
        modelJson.edgesList.push({
            from: sparkSqlId,
            to: targetNodeId,
            id: 'sjk' + uuid.v4().replace(/-/g, '')
        })

        // 目标表与结束节点相连
        modelJson.edgesList.push({
            from: targetNodeId,
            to: endProcessId,
            id: 'sjk' + uuid.v4().replace(/-/g, '')
        })

        const modelXml: string = `<?xml version="1.0" encoding="UTF-8"?>
        <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://www.flowable.org/processdef" exporter="Flowable Open Source Modeler" exporterVersion="6.7.2">
            <process id="sjk78ae83918154400aae62f5351dbd5194" name="sjk78ae83918154400aae62f5351dbd5194" isExecutable="true">
                <startEvent id="sjkccd4823a46b64b6ab8e27ca2d7d790ab" name="开始" flowable:formFieldValidation="true"/>
                <userTask id="sjk4885a18eddad4215a7c8d05645dc09a9" name="数据开发(Spark SQL)" flowable:formFieldValidation="true">
                    <extensionElements>
                        <flowable:taskListener event="create" delegateExpression="\${dataDevSpTaskListener}"/>
                    </extensionElements>
                </userTask>
                <endEvent id="sjk100325c69a3c4af9981f99cb8ac16dc2" name="结束"/>
                <sequenceFlow id="sjkad297d3d39bd4d0d85d6f0ae08b6e335" name="TDBS-Hive" sourceRef="sjkccd4823a46b64b6ab8e27ca2d7d790ab" targetRef="sjk4885a18eddad4215a7c8d05645dc09a9"/>
                <sequenceFlow id="sjkb350245b133a4f2eb4baa8edd9c1d252" name="TDBS-Hive" sourceRef="sjk4885a18eddad4215a7c8d05645dc09a9" targetRef="sjk100325c69a3c4af9981f99cb8ac16dc2"/>
                  </process>
        </definitions>`

        const json = JSON.parse(updateSjkUUID({modelXml: modelXml, modelJson: JSON.stringify(modelJson)}))

        return {
            modelXml: json.modelXml,
            modelJson: json.modelJson
        }
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

type ModelJson = {
    nodeList: {
        id: string,
        shape: string,
        image: string,
        size: string,
        type: string,
        name: string,
        delegateExpression?: string
        taskType?: string
        database?: string
        databaseName?: number
        tableName?: string
    }[],
    edgesList: {
        from: string,
        to: string,
        id: string
    }[]
}
