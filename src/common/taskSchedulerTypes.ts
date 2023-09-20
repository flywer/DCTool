export interface Scheduler {
    tasks: Task[];
    monitoringFrequency: number
}

export interface Task {
    id: string;
    taskName: string;
    cron: string;
    isEnable: boolean;
    isRunning: boolean;
    // 上次执行开始时间
    lastStartTime: string;
    // 上次执行结束时间
    lastEndTime: string;
    // 上次执行结果
    lastExecResult: string;
    execLog: ExecLog[];
    jobList: DCJob[];
    // 画布数据
    graphSave: string;
}

export interface DCJob {
    id: string,
    jobType: 'dataX' | 'workflow' | 'sparkSql' | 'mysql'
    name: string;
    dependentJobs: DCJob[]; //依赖此任务的任务列表
    sqlConfig?: SqlConfig
}

export interface SqlConfig {
    dbType: 'tbds-hive' | 'mysql',
    dbId: string,
    sql: string,
    timeout:number,
    isRunning: boolean
}

export interface ExecLog {
    startTime: string;
    endTime?: string;
    // 0:运行中  1：执行成功 2：执行失败
    status: number;
    msg?: string;
    jobName?: string;
    jobLog?: ExecLog[];
}

