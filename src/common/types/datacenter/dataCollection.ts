// 数据采集

// 采集任务列表页类型
export type DataXJob_Page = {
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

// 采集任务模板类型
export type DataXJobTemplate = {
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
}

// 调度任务信息类型
export type SchedJob = {
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
export type DataXJobLog = {
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

// 数据采集分页查询参数
export type DataXJobQueryParams = {
    current: number,
    size: number,
    blurry?: string,// 模糊查询
    jobDesc?: string,// 任务名称
    jobContent?: string,
    projectName?: string,
    subsystemName?: '采集'
    executeResult?:string
    incrementOrFull?:string
}
