export type Nullable<T> = T | null

export type Voidable<T> = T | null | undefined

export interface IpcResponse<T> {
    data?: any
    error?: any
}

export type SetupModelType = {
    // 开机自启
    openAtLogin?: boolean
    // 关闭时隐藏到托盘
    closeAsHidden?: boolean
    // 启用系统托盘
    enableSysTray?: boolean
    // 自定义主题: followSys:跟随系统主题
    themeAccentColor?: 'followSys' | 'light' | 'dark'
    // 自动更新
    autoUpdate?: boolean
    // 更新渠道
    updateChannel?: 'Github'
    // 硬件加速
    hardwareAcceleration?: boolean
}

export type PageVo = {
    pageNo: number,
    pageSize: number,
    searchParam: string
}

export type PageResult<T> = {
    records: T[],
    total: number
}

// 数据统计质检记录类型
export type InspectionDataStatType = {
    orgName: string,
    tableComment: string,
    tableName: string,
    totalRecordSum: number,
    aimRecordSum: number,
    wrongRecordSum: number,
    inspectionTime: string
}

export type CommonJsonDataType = {
    id: number,
    tableName: string,
    json: string,
    updateTime?: string
}

// region 辅助库类型
// 项目类型
export type ProjectInfo = {
    id: number
    projectId: string
    projectName: string
    projectAbbr: string
    tableAbbr: string
}
// endregion

// region 数据中台类型
// 质量门户-->质检情况分页查询记录类型
export interface InspectionRecord {
    inspectionRecordId: string;
    sourceTableName: string;
    dbId: string;
    inspectionTime: string;
    orgName: string;
    totalRecordSum: number;
    wrongRecordSum: number;
    aimRecordSum: number;
    repairRecordSum: number;
    unRepairRecordSum: number;
    isProcessor: number;
}

// 采集任务列表页类型
export type DataXJobPageType = {
    triggerLastTime: string;
    incrementType: number;
    configuration: number;
    writerSystemName: string;
    writerSystemDeptName: string;
    num: number;
    jobContent: string;
    gatherSource_dictText: string;
    error: number;
    jobDesc: string;
    lastHandleCode: number;
    shareTarget: any;
    shareTarget_dictText: any;
    readerSystemName: string;
    createBy: string;
    readerDatasourceName: string;
    writerTable: string;
    readerTable: string;
    success: number;
    readerSystemDeptName: string;
    id: number;
    projectName: string;
    writerDatasourceName: string;
    gatherSource: string;
}

// 采集任务模板
export type JobTemplateType = {
    alarmEmail: null;
    glueUpdatetime: string;
    // 增量开始时间
    incStartTime: string;
    jobJson: {
        job: {
            content: {
                reader: {
                    parameter: {
                        password: string;
                        column: string[];
                        connection: {
                            jdbcUrl: string[];
                            table: string[];
                        }[];
                        where: string;
                        username: string;
                    };
                    name: string;
                };
                writer: {
                    parameter: {
                        path: string;
                        fileName: string;
                        tbds_securekey: string;
                        column: {
                            name: string;
                            type: string;
                        }[];
                        defaultFS: string;
                        tbds_username: string;
                        writeMode: string;
                        fieldDelimiter: string;
                        haveTBDS: boolean;
                        fileType: string;
                        tbds_secureid: string;
                    };
                    name: string;
                };
            }[];
            setting: {
                errorLimit: {
                    percentage: number;
                    record: number;
                };
                speed: {
                    byte: number;
                    channel: number;
                };
            };
        };
    };
    addTime: string;
    executorBlockStrategy: null;
    columns: null;
    autoVerifyRecord: number;
    jobContent: null;
    glueRemark: null;
    dynamicPathData: string;
    path: string;
    writerTable: string;
    readerTable: string;
    updateBy: string;
    glueType: string;
    dynamicPath: string;
    executorHandler: null;
    // 增量时间字段
    replaceParam: string;
    executorFailRetryCount: number;
    id: number;
    executorTimeout: number;
    partitionInfo: null;
    jvmParam: null;
    writerId: number;
    triggerLastTime: number;
    incStartId: null;
    executorParam: null;
    // 采集方式：0：全量采集；1：主键自增增量采集；2：时间自增增量采集；3：Hive分区增量采集
    incrementType: 0 | 1 | 2 | 3;
    executorRouteStrategy: null;
    childJobId: null;
    triggerNextTime: number;
    jobCron: null;
    updateTime: string;
    jobGroup: null;
    // 增量时间格式
    replaceParamType: string;
    readerId: number;
    userName: null;
    // 任务名称
    jobDesc: string;
    glueSource: null;
    shareTarget: null;
    createBy: string;
    mappingType: string;
    projectName: null;
    projectId: number;
    subsystemName: string;
    gatherSource: string;
    primaryKey: null;
};

// 调度任务信息
export type SchedJobType = {
    glueUpdatetime: string;
    incStartTime: string;
    jobJson: string;
    addTime: string;
    num: any;
    jobTemplateId: number;
    lastHandleCode: number;
    readerTable: string;
    glueType: string;
    datasourceId: number;
    replaceParam: string;
    handleStatus: number;
    id: number;
    executorTimeout: number;
    jvmParam: string;
    executorParam: any;
    triggerStatus: number;
    triggerNextTime: number;
    jobCron: string;
    projectId_dictText: string;
    jobGroup: number;
    jobDesc: string;
    glueSource: any;
    triggerNextTime_dictText: string;
    success: any;
    projectName: any;
    projectId: number;
    alarmEmail: any;
    executorBlockStrategy: string;
    jobContent: string;
    glueRemark: any;
    triggerTime: any;
    triggerLastTime_dictText: string;
    updateBy: string;
    executorHandler: string;
    retry: string;
    executorFailRetryCount: number;
    jobType: string;
    jobFileId: any;
    partitionInfo: string;
    triggerLastTime: number;
    incStartId: any;
    incrementType: number;
    executorRouteStrategy: string;
    childJobId: string;
    updateTime: string;
    replaceParamType: string;
    userName: any;
    userId: any;
    createBy: string;
    subsystemName: string;
    primaryKey: any;
};

// 采集任务日志
export type DataXJobLogType = {
    handleTime: string;
    triggerCode: number;
    handleCode_dictText: string;
    projectId_dictText: string;
    jobGroup: number;
    jobContent: string;
    handleMsg: string;
    triggerTime: string;
    triggerMsg: string;
    jobDesc: string;
    jobId: number;
    triggerCode_dictText: string;
    executorAddress: string;
    handleCode: number;
    id: number;
    projectName: string;
    projectId: number;
    subsystemName: string;
};

// 工作流任务信息
export type WorkflowType = {
    id: string;
    createBy: string;
    updateBy: string;
    createTime: string;
    updateTime: string;
    delFlag: number;
    status: string;
    procCode: string;
    procName: string;
    dependencyProjectId: any;
    dependencyProjectName: any;
    dependencyWorkflowId: any;
    dependencyWorkflowName: any;
    dependencyLastStartTime: any;
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
export type WorkflowLogType = {
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

export type  DataDevBizVoType = {
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

export type CommonQueryParam = {
    current: number,
    size: number,
    blurry?: string,
    jobContent?: string,
    subsystemName?: '采集'
}

export type DataXJobQueryParams = {
    current: number,
    size: number,
    blurry?: string,
    jobDesc?: string,
    jobContent?: string,
    projectName?: string,
    subsystemName?: '采集'
}
// endregion
