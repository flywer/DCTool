// 这里存放jobTab.vue中使用的一些工具方法
import {get_cj_job_log, get_sched_job_page, get_valid_config_page, get_workflow_log} from "@render/api/datacenter";
import {formatDate} from "@render/utils/common/formatDate";
import {parseExpression} from "cron-parser";
import {isEmpty} from "lodash-es";
import {NButton, NPopconfirm} from "naive-ui";
import {h} from "vue";

// 查询此项目任务的质检任务是否已配置
export const getIsValidConfig = async (tableAbbr: string, tableName: string) => {

    const validTableName = `di_${tableAbbr}_${tableName.toLowerCase()}_temp_ods`

    const records = (await get_valid_config_page(validTableName)).data.records

    return !(isEmpty(records) || records[0].tableName != validTableName);
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

export const workflowJobGetLastExecTime = async (v) => {
    const res = await get_workflow_log(v.id, 1, 1);
    if (!isEmpty(res.data.records)) {
        return res.data.records[0].startTime;
    } else {
        return '--';
    }
};

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
        const log = (await get_cj_job_log({
            current: 1,
            size: 1,
            blurry: v.jobDesc
        })).data.records[0]
        if (log != undefined) {
            if (log.handleCode == 200) {
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
