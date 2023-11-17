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
            taskType: "TDBS-HIVE2MYSQL" |'TDBS-HIVE2TDBS-HIVE'| string,
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
