import {ProjectInfo} from "@common/types";
import {VNode} from "@vue/runtime-core";

export  type Job = {
    id: string
    type: JobType,
    jobName: string,
    jobNameVNode?: VNode,
    status: JobStatus
    // 1:依赖调度；2:定时调度
    schedMode: 1 | 2
    cron: string
    lastExecTime: string
    nextExecTime: string
    createBy: string
    code?: string
    comment?: string
    createTime: string
    updateTime: string
    // 任务重跑策略
    jobRerunType: 1 | 2
    project: ProjectInfo
}

export enum JobType {
    /**
     * 数据采集任务
     **/
        'cj' = 'cj',
    /**
     * 数据质检任务
     **/
        'zj' = 'zj',
    /**
     * 初步质检任务
     **/
        'zj1' = 'zj1',
    /**
     * 完整质检任务
     **/
        'zj2' = 'zj2',
    /**
     * 数据备份任务
     **/
        'bf' = 'bf',
    /**
     * 数据清除任务
     **/
        'qc' = 'qc',
    /**
     * 数据融合任务
     **/
        'rh' = 'rh',
    /**
     * 单表融合任务
     **/
        'rh1' = 'rh1',
    /**
     * 行为数据-入湖融合任务
     **/
        'rh2' = 'rh2',
    /**
     * 行为数据-入库融合任务
     **/
        'rh3' = 'rh3',
    /**
     * 数据入库任务
     **/
        'rk' = 'rk',
    /**
     * 数据共享任务
     **/
        'gx' = 'gx',
    /**
     * ODS表数据量统计任务
     **/
        'odstj' = 'odstj',
    /**
     * ODS数据融合任务
     **/
        'odsrh' = 'odsrh',
    /**
     * ODS表数据量统计备份任务
     **/
        'odstjbf' = 'odstjbf',
    /**
     * 未知任务
     **/
        'unknown' = 'unknown'
}

export const getJobTypeComment = (type: JobType) => {
    switch (type) {
        case JobType.cj:
            return '数据采集任务'
        case JobType.zj:
            return '数据质检任务'
        case JobType.zj1:
            return '初步质检任务'
        case JobType.zj2:
            return '完整质检任务'
        case JobType.bf:
            return '数据备份任务'
        case JobType.qc:
            return '数据清除任务'
        case JobType.rh:
            return '数据融合任务'
        case JobType.rh1:
            return '单表融合任务'
        case JobType.rh2:
            return '入湖融合任务'
        case JobType.rh3:
            return '入库融合任务'
        case JobType.rk:
            return '数据入库任务'
        case JobType.gx:
            return '数据共享任务'
        case JobType.odstj:
            return 'ODS数据量统计任务'
        case JobType.odsrh:
            return 'ODS数据融合任务'
        case JobType.odstjbf:
            return 'ODS数据量统计备份任务'
    }
}

export enum JobStatus {
    // 未创建
    noCreate = -1,
    // 采集任务未配置
    noConfig = 0,
    // 任务停用
    deactivate = 1,
    // 任务启用
    enable = 2,
    //任务运行中
    running = 3,
    // 任务异常
    exception,
    // 任务未反馈
    noFeedback,
}

export type ActionJobNodeSuffix = {
    cjJob: JobStatus
    zj1Job: JobStatus
    bfJob: JobStatus
    qcJob: JobStatus
    rh1Job: JobStatus
    rh2Job: JobStatus
    zj2Job: JobStatus
    rh3Job: JobStatus
}
