// 工作流任务信息
export type Workflow = {
    id: string;
    createBy: string;
    updateBy: string;
    createTime: string;
    updateTime: string;
    delFlag: number;
    status: string;
    procCode: string;
    procName: string;
    dependencyProjectId: string | number;
    dependencyProjectName: string;
    dependencyWorkflowId: string | number;
    dependencyWorkflowName: string;
    dependencyLastStartTime: string;
    projectId: string;
    projectName: string;
    description: string;
    modelXml: string;
    modelJson: string;
    editModel: number;
    rev: number;
    deploymentId: string;
    personId: string;
    personName: string;
    email: string;
    disabled: number;
    schedulingMode: string;
    crontab: string;
    businessParamsJson: string;
    result: number;
    runTime: number;
    handleNum: number;
    nextExecTime: any;
};

// 工作流任务日志
export type WorkflowLog = {
    id: string;
    workflowId: string;
    deploymentId: string;
    procInstId: string;
    componentId: string;
    taskId: string;
    taskDefKey: string;
    result: number;
    startTime: string;
    runTime: number;
    data: string;
    delFlag: number;
    ioNum: string;
    componentName: string;
};

// 工作流画布参数
export type  DataDevBizVo = {
    dataSyncDtoList: any[],
    qualityInspectionDtoList: [
        {
            sourceDbId: string;
            sourceTableName: string;
            inspectionRangeType: string;
            incrementColumnName: string;
            incrementColumnValueInit: string;
            wrongDbId: string;
            wrongTableName: string;
            aimDbId: string;
            aimTableName: string;
            principalDtoList: [];
            qualityInspectionFieldList: any[];
            taskInfoDto: {
                taskDefKey: string
            }
        }
    ],
    sparkSqlDtoList: [
        {
            taskInfoDto: {
                taskDefKey: string
            },
            sparkConfig: {
                saveMode: string
            },
            sql: string,
            id: string,
            sourceDBId: number[],
            sourceTable: string[],
            targetDBId: number,
            targetTable: string,
            taskType: string
        }
    ]
}

