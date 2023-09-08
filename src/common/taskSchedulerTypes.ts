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
    jobType: 'dataX' | 'workflow'
    name: string;
    dependentJobs: DCJob[]; //依赖此任务的任务列表
}

interface ExecLog {
    time: string;
    type: string;
    text: string;
}

