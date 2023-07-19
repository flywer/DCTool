// 这里存放jobTab.vue中使用的一些工具方法
import {create_cron_job} from "@render/api/cron";
import {
    datax_job_delete,
    datax_job_run,
    datax_job_start, datax_job_stop,
    get_datax_job_log,
    get_sched_job_page,
    get_valid_config_page,
    get_workflow_log, sched_job_delete, workflow_active, workflow_delete, workflow_rerun, workflow_run
} from "@render/api/datacenter";
import {formatDate} from "@render/utils/common/formatDate";
import {parseExpression} from "cron-parser";
import {isEmpty} from "lodash-es";
import {NButton, NPopconfirm, NTag} from "naive-ui";
import {h} from "vue";
import {uuid} from "vue3-uuid";

export  type Job = {
    id: string
    type: string
    jobName: string
    // -1:未创建； 0:采集任务未配置； 1:任务停用； 2:任务启用； 3:任务运行中； 4:任务异常； 5:任务未反馈
    status: number
    // 1:依赖调度；2:定时调度
    schedMode: number
    cron: string
    lastExecTime: string
    nextExecTime: string
    createBy: string
    code?: string
    comment?: string
}

// 查询中台表的质检任务是否已配置
export const getDCTableIsValidConfig = async (tableAbbr: string, tableName: string) => {

    const validTableName = `di_${tableAbbr}_${tableName.toLowerCase()}_temp_ods`

    const records = (await get_valid_config_page(validTableName)).data.records

    return !(isEmpty(records) || records[0].tableName != validTableName);
}

// 查询自定义表的质检任务是否已配置
export const getCustomTableValidConfig = async (tableName: string) => {
    const records = (await get_valid_config_page(tableName)).data.records

    return !(isEmpty(records) || records[0].tableName != tableName);
}

/**
 * 对任务进行排序
 * 如果两个元素的开头部分都不在规定顺序中，那么它们将按照字母表顺序排列。
 * 如果一个元素的开头部分不在规定顺序中，而另一个元素是有序的，则将未排序的元素排在已排序的元素之后。
 * 最后，对于两个都在规定顺序中的元素，按照它们在 order 数组中的下标大小来排列。
 **/
export const jobNameCompare = (a, b) => {
    const order = ["cj", "zj", "bf", "qc", "rh", "rh1", "rh2", "rk", "gx"];
    const aIndex = order.indexOf(a.jobName.split("_")[0]);
    const bIndex = order.indexOf(b.jobName.split("_")[0]);

    if (aIndex === -1 && bIndex === -1) {
        return a.jobName.localeCompare(b.jobName);
    } else if (aIndex === -1) {
        return 1;
    } else if (bIndex === -1) {
        return -1;
    } else {
        return aIndex - bIndex;
    }
}

export const showButton = (text, onClick) => {
    return h(NButton, {
            size: 'small',
            onClick: async () => {
                await onClick()
            }
        },
        {default: () => text})
}

export const showConfirmation = (text, onPositiveClick) => {
    return h(NPopconfirm, {
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
            await onPositiveClick();
        },
    }, {
        trigger: () => {
            return h(NButton, {size: 'small'}, {default: () => text})
        },
        default: () => `确定要${text}吗？`
    });
}

//region 工作流

/**
 * @param id: 任务ID
 * @param type: 01：启用， 02：停用
 * @param onSuccess 任务启用成功的回调函数
 **/
export const workflowActive = async (id: string, type: '01' | '02', onSuccess) => {
    await workflow_active({
        id: id,
        type: type
    }).then((res) => {
        if (res.code == 200) {
            window.$message.success(type == '01' ? '启用成功' : '停用成功')
            onSuccess()
        } else {
            window.$message.error(res.msg, res.message)
            console.error(res)
        }
    })
}

export const workflowRun = async (v: Job, isValidConfigRef: boolean, tableName: string, onSuccess) => {
    if (v.type === '数据质检任务') {
        if (!isValidConfigRef) {
            window.$dialog.warning({
                title: '警告',
                content: `检测到未在【质量门户】对[${tableName}]进行配置，是否继续执行质检？`,
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: () => {
                    workflowStart(v, () => onSuccess())
                }
            })
        } else {
            workflowStart(v, () => onSuccess())
        }
    } else {
        workflowStart(v, () => onSuccess())
    }
}

export const workflowStart = (v: Job, onSuccess) => {
    const param = {
        businessKey: uuid.v4(),
        code: v.code,
        createBy: v.createBy,
        creator: v.createBy
    }
    workflow_run(param).then(res => {
        if (res.code == 200) {
            window.$message.success(res.message)
            onSuccess()
        } else {
            window.$message.error(res.message)
        }
    }).then(() => {
        create_cron_job(v.jobName)
    })
}

export const workflowReRun = (v: Job, onSuccess) => {
    workflow_rerun(v.id, 1).then(res => {
        if (res.code == 200) {
            window.$message.success(res.message)
            onSuccess()
        } else {
            window.$message.error(res.message)
        }
    }).then(() => {
        create_cron_job(v.jobName)
    })
}

export const workflowDelete = (id, onSuccess) => {
    workflow_delete(id).then(res => {
        if (res.code == 200) {
            window.$message.success(res.data)
            onSuccess()
        } else {
            window.$message.error("删除失败")
        }
    })
}
//endregion

//region DataX
export const dataXJobStart = async (row: Job, onSuccess) => {
    const schedJobId = (await getSchedJob(row.jobName)).id
    datax_job_start(schedJobId).then(res => {
        if (res.data == 'success') {
            window.$message.success('启用成功')
            onSuccess()
        } else {
            window.$message.error(res.msg)
        }
    })
}

export const dataXJobStop = async (row: Job, onSuccess) => {
    const schedJobId = (await getSchedJob(row.jobName)).id
    datax_job_stop(schedJobId).then(res => {
        if (res.data == 'success') {
            window.$message.success('停用成功')
            onSuccess()
        } else {
            window.$message.error(res.message)
        }
    })
}

export const dataXJobRun = async (row: Job, onSuccess) => {
    const schedJobId = (await getSchedJob(row.jobName)).id
    datax_job_run({
        jobId: schedJobId,
        subsystemName: "采集"
    }).then(res => {
        if (res.data == 'success') {
            window.$message.success('执行成功')
            onSuccess()
        } else {
            window.$message.error(res.message)
        }
    })
}

export const dataXJobDelete = async (row: Job, onSuccess) => {
    const schedJobId = (await getSchedJob(row.jobName))?.id || null
    if (schedJobId != null) {
        sched_job_delete(schedJobId).then(res => {
            if (res.code == 0) {
                window.$message.success('调度任务删除成功')
                datax_job_delete(row.id).then(res1 => {
                    if (res1.code == 0) {
                        window.$message.success('采集任务删除成功')
                        onSuccess()
                    } else {
                        window.$message.error(res1.msg)
                    }
                })
            } else {
                window.$message.error(res.msg)
            }
        })
    } else {
        datax_job_delete(row.id).then(res1 => {
            if (res1.code == 0) {
                window.$message.success('采集任务删除成功')
                onSuccess()
            } else {
                window.$message.error(res1.msg)
            }
        })
    }

}

//endregion

export const getSchedJob = async (jobName: string) => {
    return (await get_sched_job_page({
        current: 1,
        size: 10000,
        jobContent: jobName
    })).data.records[0] || null
}

export const convertToSixFields = (cron: string): string => {
    const fields = cron.split(' ');
    return `${fields[0]} ${fields[1]} ${fields[2]} ${fields[3]} ${fields[4]} ${fields[5]}`;
}

export const workflowJobGetLastExecTime = async (v) => {
    const res = await get_workflow_log(v.id, 1, 1);
    if (!isEmpty(res.data.records)) {
        return res.data.records[0].startTime;
    } else {
        return '--';
    }
};

export const workflowJobGetNextExecTime = (v) => {
    if (v.schedulingMode == 2) {
        const interval = parseExpression(convertToSixFields(v.crontab));
        return formatDate(interval.next().toDate())
    } else if (v.schedulingMode == 1) {
        return `依赖于${v.dependencyWorkflowName}`
    } else {
        return '未配置调度任务'
    }
}

export const dataXJobGetNextExecTime = (schedJob: any) => {
    const jobCron = schedJob?.jobCron || null
    if (jobCron != null) {
        const interval = parseExpression(convertToSixFields(jobCron));
        return formatDate(interval.next().toDate())
    } else {
        return '未配置调度任务'
    }
}

export const pushUnExistJobs = (newJobs: any[], projectAbbr: string, tableAbbr: string, isBasicData: boolean) => {

    if (!newJobs.some(job => job.type === '数据质检任务')) {
        newJobs.push({
            id: null,
            jobName: `zj_${projectAbbr}_${tableAbbr.toString().toLowerCase()}`,
            status: -1,
            type: '数据质检任务',
            schedMode: 0,
            cron: null,
            lastExecTime: '--',
            nextExecTime: '未配置调度任务',
            createBy: null
        })
    }

    if (!newJobs.some(job => job.type === '数据备份任务')) {
        newJobs.push({
            id: null,
            jobName: `bf_${projectAbbr}_${tableAbbr.toString().toLowerCase()}`,
            status: -1,
            type: '数据备份任务',
            schedMode: 0,
            cron: null,
            lastExecTime: '--',
            nextExecTime: '未配置调度任务',
            createBy: null
        })
    }

    if (!newJobs.some(job => job.type === '数据清除任务')) {
        newJobs.push({
            id: null,
            jobName: `qc_${projectAbbr}_${tableAbbr.toString().toLowerCase()}`,
            status: -1,
            type: '数据清除任务',
            schedMode: 0,
            cron: null,
            lastExecTime: '--',
            nextExecTime: '未配置调度任务',
            createBy: null
        })
    }

    if (isBasicData) {
        if (!newJobs.some(job => job.type === '数据融合任务')) {
            newJobs.push({
                id: null,
                jobName: `rh_${projectAbbr}_${tableAbbr.toString().toLowerCase()}`,
                status: -1,
                type: '数据融合任务',
                schedMode: 0,
                cron: null,
                lastExecTime: '--',
                nextExecTime: '未配置调度任务',
                createBy: null
            })
        }
    } else {
        if (!newJobs.some(job => job.type === '单表融合任务')) {
            newJobs.push({
                id: null,
                jobName: `rh1_${projectAbbr}_${tableAbbr.toString().toLowerCase()}`,
                status: -1,
                type: '单表融合任务',
                schedMode: 0,
                cron: null,
                lastExecTime: '--',
                nextExecTime: '未配置调度任务',
                createBy: null
            })
        }

        if (!newJobs.some(job => job.type === '多表融合任务')) {
            newJobs.push({
                id: null,
                jobName: `rh2_${projectAbbr}_${tableAbbr.toString().toLowerCase()}`,
                status: -1,
                type: '多表融合任务',
                schedMode: 0,
                cron: null,
                lastExecTime: '--',
                nextExecTime: '未配置调度任务',
                createBy: null
            })
        }
    }

    if (!newJobs.some(job => job.type === '数据入库任务')) {
        newJobs.push({
            id: null,
            jobName: `rk_${projectAbbr}_${tableAbbr.toString().toLowerCase()}`,
            status: -1,
            type: '数据入库任务',
            schedMode: 0,
            cron: null,
            lastExecTime: '--',
            nextExecTime: '未配置调度任务',
            createBy: null
        })
    }

    return newJobs

}

export const getDataXJobStatus = async (v, schedJob) => {
    if (v.configuration == 0) {
        return 0
    } else {
        const log = (await get_datax_job_log({
            current: 1,
            size: 1,
            blurry: v.jobDesc
        })).data.records[0]
        if (log != undefined) {
            if (log.handleCode == 200) { //若成功
                if (schedJob?.triggerStatus == 1) {
                    return 2
                } else {
                    return 1
                }
            } else if (log.handleCode == 500) {
                return 4
            } else if (log.handleCode == 0) {
                return 3
            }
        } else {
            if (schedJob?.triggerStatus == 1) {
                return 2
            } else {
                return 1
            }
        }
    }
}

export const getDataXJobType = (v) => {
    switch (v.jobDesc.split('_')[0]) {
        case 'cj':
            return '数据采集任务'
        case 'gx':
            return '数据共享任务'
        default :
            return '未知任务'
    }
}

export const getWorkflowJobType = (v) => {
    switch (v.procName.split('_')[0]) {
        case 'zj':
            return '数据质检任务'
        case 'bf':
            return '数据备份任务'
        case 'qc':
            return '数据清除任务'
        case 'rh':
            return '数据融合任务'
        case 'rh1':
            return '单表融合任务'
        case 'rh2':
            return '多表融合任务'
        case 'rk':
            return '数据入库任务'
        default :
            return '未知任务'
    }
}

export const getWorkflowJobStatus = (v) => {
    switch (v.status) {
        case '1':// 启用
            return 2
        case '2':// 停用
            return 1
        case '3':// 异常
            return 4
        case '4':// 运行中
            return 3
        case '5':// 未反馈
            return 5
        default :
            return v.status as number
    }
}

export const setJobStatus = (row) => {
    switch (row.status) {
        case -1:
            return h(NTag, {
                    size: 'small',
                    bordered: false,
                    color: {
                        color: '#797979',
                        textColor: 'white'
                    }
                },
                {default: () => '未创建'})
        case 0:
            return h(NTag, {
                    size: 'small',
                    bordered: false,
                    color: {
                        color: '#ffc062',
                        textColor: 'white'
                    }
                },
                {default: () => '未配置'})
        case 1:
            return h(NTag, {
                    size: 'small',
                    bordered: false,
                    type: 'default'
                },
                {default: () => '停用'})
        case 2:
            return h(NTag, {
                    size: 'small',
                    bordered: false,
                    type: 'info'
                },
                {default: () => '启用'})
        case 3:
            return h(NTag, {
                    size: 'small',
                    bordered: false,
                    type: 'success'
                },
                {default: () => '运行中'})
        case 4:
            return h(NTag, {
                    size: 'small',
                    bordered: false,
                    type: 'error'
                },
                {default: () => '异常'})
        case 5:
            return h(NTag, {
                    size: 'small',
                    bordered: false,
                    color: {
                        color: '#8eafd3',
                        textColor: 'white'
                    }
                },
                {default: () => '未反馈'})
    }
}
