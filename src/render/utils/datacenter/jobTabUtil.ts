// 这里存放jobTab.vue中使用的一些工具方法
import {DataXJobLogType, DataXJobPageType, ProjectInfo, SchedJobType} from "@common/types";
import {get_max_running_workflow_num} from "@render/api/auxiliaryDb/dict.api";
import {get_rh_json, get_simp_zj_json, get_zj_json} from "@render/api/auxiliaryDb/jobJson.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {create_cron_job} from "@render/api/cron.api";
import {
    datax_job_delete,
    datax_job_run,
    datax_job_start,
    datax_job_stop, get_cj_job_page,
    get_datax_job_log,
    get_sched_job_page,
    get_valid_config_page,
    get_workflow_log,
    get_workflow_page,
    sched_job_delete,
    workflow_active,
    workflow_delete,
    workflow_rerun,
    workflow_run
} from "@render/api/datacenter.api";
import {compareTimeStrings, formatDate} from "@render/utils/common/dateUtils";
import {actionTableNames} from "@render/utils/datacenter/constants";
import {VNode} from "@vue/runtime-core";
import {parseExpression} from "cron-parser";
import {isEmpty} from "lodash-es";
import {NButton, NPopconfirm, NPopover, NTag, NList, NListItem} from "naive-ui";
import {h} from "vue";
import {uuid} from "vue3-uuid";

export  type Job = {
    id: string
    type: '数据采集任务' | '数据质检任务' | '数据备份任务' | '数据清除任务' | '数据融合任务' | '单表融合任务' | '多表融合任务' | '数据入库任务' | '数据共享任务' | '未知任务'
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
    createTime: string
    updateTime: string
    project: ProjectInfo
}

// 查询中台表的质检任务是否已配置
/**
 * @param tableAbbr 项目表名简称
 * @param tableName 业务表名缩写
 **/
export const getDCTableIsValidConfig = async (tableAbbr: string, tableName: string) => {

    const validTableName = `di_${tableAbbr}_${tableName.toLowerCase()}_temp_ods`

    const records = (await get_valid_config_page(validTableName)).data?.records || []

    return !(isEmpty(records) || records[0].tableName != validTableName);
}

// 查询自定义表的质检任务是否已配置
export const getCustomTableValidConfig = async (tableName: string) => {
    const records = (await get_valid_config_page(tableName)).data?.records || []

    return !(isEmpty(records) || records[0].tableName != tableName);
}

/**
 * 对任务进行排序
 * 如果两个元素的开头部分都不在规定顺序中，那么它们将按照字母表顺序排列。
 * 如果一个元素的开头部分不在规定顺序中，而另一个元素是有序的，则将未排序的元素排在已排序的元素之后。
 * 最后，对于两个都在规定顺序中的元素，按照它们在 order 数组中的下标大小来排列。
 **/
export const jobNameCompare = (a: {
    jobName: string;
}, b: {
    jobName: string;
}) => {
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

export const showButton = (text: string, onClick: () => any) => {
    return h(NButton, {
            size: 'small',
            onClick: async () => {
                await onClick()
            }
        },
        {default: () => text})
}

export const showConfirmation = (text: string, onPositiveClick: () => any) => {
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

export const showTextConfirmation = (text: string, onPositiveClick: () => any) => {
    return h(NPopconfirm, {
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
            await onPositiveClick();
        },
    }, {
        trigger: () => {
            return h(NButton, {
                size: 'small',
                text: true,
                style: {
                    padding: '8px 16px',
                    width: '100%'
                },
            }, {default: () => text})
        },
        default: () => `确定要${text}吗？`
    });
}

export const showTextButton = (text: string, onClick: () => any) => {
    return h(NButton, {
            size: 'small',
            text: true,
            style: {
                padding: '8px 16px',
                width: '100%'
            },
            onClick: async () => {
                await onClick()
            }
        },
        {default: () => text})
}

export const showButtonPopover = (text: string, vNodes: VNode[]) => {

    let listItems = []
    vNodes.forEach(vNode => {
        const listItem = h(NListItem,
            {
                style: {
                    textAlign: 'center',
                    padding: '0',
                }
            }, {default: () => vNode})
        listItems.push(listItem)
    })

    return h(NPopover, {
        trigger: 'click',
        placement: 'bottom',
        style: {padding: '0'},
    }, {
        trigger: () => {
            return h(NButton, {size: 'small'}, {default: () => text})
        },
        default: () => h(NList, {
            hoverable: true,
            clickable: true,
        }, listItems)
    });
}

//region 工作流

/**
 * 工作流任务操作按钮 ，不包括状态为未创建的项
 * @param job 任务实例
 * @param tableDataInit 表格刷新
 **/
export const renderWorkflowActionButton = (job: Job, tableDataInit: () => any): VNode[] => {
    let children: VNode[] = []

    switch (job.status) {
        case  1: // 任务停用
            children = [
                showButton('启用', () => workflowActive(job.id, '01', () => tableDataInit())),
                showConfirmation('执行', async () => {
                    await workflowActive(job.id, '01', async () => {
                        await workflowRun(job, () => tableDataInit())
                    })
                }),
                showConfirmation('删除', async () => workflowDelete(job.id, () => tableDataInit())),
            ]
            break
        case 2:// 任务启用
            children = [
                showButton('停用', () => workflowActive(job.id, '02', () => tableDataInit())),
                showConfirmation('执行', async () => {
                    await workflowRun(job, () => tableDataInit())
                }),
                showConfirmation('删除', async () => {
                    await workflowActive(job.id, '02', () => {
                        workflowDelete(job.id, () => tableDataInit())
                    })
                }),
            ]
            break
        case 3:// 任务运行中
            break
        case 4:// 任务异常
            children = [
                showConfirmation('重跑', async () => workflowReRun(job, () => tableDataInit())),
                showConfirmation('删除', async () => workflowDelete(job.id, () => tableDataInit())),
            ]
            break
        case 5:// 任务未反馈
            children = [
                showConfirmation('重跑', async () => workflowReRun(job, () => tableDataInit())),
                showConfirmation('删除', async () => workflowDelete(job.id, () => tableDataInit())),
            ]
            break
    }

    return children
}

/**
 * @param job 任务实例
 * @param showCreateSchedJobModal 采集任务配置弹窗
 * @param tableDataInit 表格刷新
 **/
export const renderDataXJobActionButton = (job: Job, showCreateSchedJobModal: () => any, tableDataInit: () => any): VNode[] => {
    let children: VNode[] = []

    switch (job.status) {
        case 0:// 未配置调度任务的采集任务
            children = [
                showButton('配置', async () => await showCreateSchedJobModal()),
                showConfirmation('删除', async () => await dataXJobDelete(job, () => tableDataInit())),
            ]
            break
        case  1: // 任务停用
            children = [
                showButton('启用', () => dataXJobStart(job, () => tableDataInit())),
                showConfirmation('执行', () => dataXJobRun(job, () => tableDataInit())),
                showConfirmation('删除', async () => await dataXJobDelete(job, () => tableDataInit())),
            ]
            break
        case 2:// 任务启用
            children = [
                showButton('停用', () => dataXJobStop(job, () => tableDataInit())),
                showConfirmation('执行', () => dataXJobRun(job, () => tableDataInit())),
                showConfirmation('删除', () => dataXJobStop(job, () => dataXJobDelete(job, () => tableDataInit()))
                ),
            ]
            break
        case 3:// 任务运行中
            break
        case 4:// 任务异常
            children = [
                showConfirmation('重跑', async () => {
                    await dataXJobRun(job, () => tableDataInit())
                }),
                showConfirmation('删除', async () => await dataXJobDelete(job, () => tableDataInit())),
            ]
            break
    }

    return children
}

/**
 * @param id
 * @param type
 * @param onSuccess 任务启用成功的回调函数
 **/
export const workflowActive = async (id: string, type: '01' | '02', onSuccess: () => any) => {
    await workflow_active({
        id: id,
        type: type
    }).then(async (res) => {
        if (res.code == 200) {
            window.$message.success(type == '01' ? '启用成功' : '停用成功')
            await onSuccess()
        } else {
            window.$message.error(res.msg, res.message)
            console.error(res)
        }
    })
}

/**
 * @param job
 * @param onSuccess 成功时的触发函数
 **/
export const workflowRun = async (job: Job, onSuccess: () => any) => {
    // 正在运行工作流数量检查
    checkRunningNum().then(isPass1 => {
        if (isPass1) {
            // 依赖任务执行时间检查
            checkWorkflowDependency(job).then(isPass2 => {
                if (isPass2) {
                    // 质检任务特殊检查:机构配置
                    checkZjJobInpsConfig(job).then(isPass3 => {
                        if (isPass3) {
                            // 检查任务模板是否存在新版本
                            checkJobRulesUpdateTime(job).then(isPass4 => {
                                if (isPass4) {
                                    // 多表融合任务是否有多个正在运行
                                    checkRh2Job(job).then(isPass5 => {
                                        if (isPass5) {
                                            workflowStart(job, () => onSuccess())
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

/**
 * 正在运行工作流数量检查
 **/
const checkRunningNum = async (): Promise<boolean> => {
    let isPass = false

    const maxRunningNum = (await get_max_running_workflow_num()).value

    // 正在运行的工作流任务
    const runningJobs = (await get_workflow_page({
        page: 1,
        size: parseInt(maxRunningNum),
        status: '4',
        procName: ``
    })).data.records

    if (runningJobs.length >= parseInt(maxRunningNum)) {
        return new Promise<boolean>((resolve) => {
            window.$dialog.warning({
                title: '警告',
                content: `目前正在运行的工作流有${runningJobs.length}个，是否继续执行此任务？`,
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: () => {
                    resolve(true);
                },
                onNegativeClick: () => {
                    resolve(false);
                }
            });
        });
    } else {
        isPass = true
    }
    return isPass
}

/**
 * 依赖任务执行时间检查
 **/
const checkWorkflowDependency = async (job: Job): Promise<boolean> => {
    let isPass = false

    // 行为数据入湖、数据湖质检无依赖检查
    if (!['xzxw', 'lake'].includes(job.jobName.split('_')[1])) {
        if (job.type === '数据质检任务' || job.type === '数据备份任务') {
            const cjJob: DataXJobPageType = (await get_cj_job_page({
                current: 1,
                size: 1,
                jobDesc: `cj${job.jobName.substring(job.jobName.indexOf('_'))}`,
                subsystemName: "采集"
            })).data?.records[0] || null

            if (cjJob != null && compareTimeStrings(cjJob.triggerLastTime, job.lastExecTime) > 0) {
                isPass = true
            } else {
                return new Promise<boolean>((resolve) => {
                    window.$dialog.warning({
                        title: '警告',
                        content: `采集任务「cj${job.jobName.substring(job.jobName.indexOf('_'))}」未执行，是否直接执行此任务？`,
                        positiveText: '确定',
                        negativeText: '取消',
                        onPositiveClick: () => {
                            resolve(true);
                        },
                        onNegativeClick: () => {
                            resolve(false);
                        }
                    });
                });
            }
        } else if (job.type === '数据清除任务') {

            const zjJob = (await get_workflow_page({
                page: 1,
                size: 1,
                status: null,
                procName: `zj${job.jobName.substring(job.jobName.indexOf('_'))}`
            })).data?.records[0] || null

            const bfJob = (await get_workflow_page({
                page: 1,
                size: 1,
                status: null,
                procName: `bf${job.jobName.substring(job.jobName.indexOf('_'))}`
            })).data?.records[0] || null

            if ((zjJob != null && bfJob != null
                && compareTimeStrings(await workflowJobGetLastExecTime(zjJob), job.lastExecTime) > 0
                && compareTimeStrings(await workflowJobGetLastExecTime(bfJob), job.lastExecTime) > 0)) {
                isPass = true
            } else {
                return new Promise<boolean>(async (resolve) => {
                    let content = ''
                    if (zjJob == null || compareTimeStrings(await workflowJobGetLastExecTime(zjJob), job.lastExecTime) < 1) {
                        content = `质检任务「zj${job.jobName.substring(job.jobName.indexOf('_'))}」未执行，是否直接执行此任务？`
                    } else if (bfJob == null || compareTimeStrings(await workflowJobGetLastExecTime(bfJob), job.lastExecTime) < 1) {
                        content = `备份任务「bf${job.jobName.substring(job.jobName.indexOf('_'))}」未执行，是否直接执行此任务？`
                    }
                    window.$dialog.warning({
                        title: '警告',
                        content: content,
                        positiveText: '确定',
                        negativeText: '取消',
                        onPositiveClick: () => {
                            resolve(true);
                        },
                        onNegativeClick: () => {
                            resolve(false);
                        }
                    });
                });
            }
        } else if (job.type === '单表融合任务') {
            const zjJob = (await get_workflow_page({
                page: 1,
                size: 1,
                status: null,
                procName: `zj${job.jobName.substring(job.jobName.indexOf('_'))}`
            })).data?.records[0] || null

            if (zjJob != null && compareTimeStrings(await workflowJobGetLastExecTime(zjJob), job.lastExecTime) > 0) {
                isPass = true
            } else {
                return new Promise<boolean>(async (resolve) => {
                    window.$dialog.warning({
                        title: '警告',
                        content: `质检任务「zj${job.jobName.substring(job.jobName.indexOf('_'))}」未执行，是否直接执行此任务？`,
                        positiveText: '确定',
                        negativeText: '取消',
                        onPositiveClick: () => {
                            resolve(true);
                        },
                        onNegativeClick: () => {
                            resolve(false);
                        }
                    });
                });
            }
        } else if (job.type === '多表融合任务') {
            const rh1Job = (await get_workflow_page({
                page: 1,
                size: 1,
                status: null,
                procName: `rh1${job.jobName.substring(job.jobName.indexOf('_'))}`
            })).data?.records[0] || null

            if (rh1Job != null && compareTimeStrings(await workflowJobGetLastExecTime(rh1Job), job.lastExecTime) > 0) {
                isPass = true
            } else {
                return new Promise<boolean>(async (resolve) => {
                    window.$dialog.warning({
                        title: '警告',
                        content: `单表融合任务「rh1${job.jobName.substring(job.jobName.indexOf('_'))}」未执行，是否直接执行此任务？`,
                        positiveText: '确定',
                        negativeText: '取消',
                        onPositiveClick: () => {
                            resolve(true);
                        },
                        onNegativeClick: () => {
                            resolve(false);
                        }
                    });
                });
            }
        } else {
            isPass = true
        }
    } else {
        isPass = true
    }
    return isPass
}

/**
 * 质检任务特殊检查:机构配置
 **/
const checkZjJobInpsConfig = async (job: Job): Promise<boolean> => {
    if (job.type === '数据质检任务') {
        let isValidConfigRef: boolean
        let validTableName: string = ''
        if (!job.jobName.startsWith('zj_lake_')) {
            validTableName = `di_${job.project.tableAbbr}_${job.jobName.split('_')[2].toLowerCase()}_temp_ods`
            isValidConfigRef = await getCustomTableValidConfig(validTableName)
        } else {
            // 数据湖质检
            validTableName = `sztk_${job.jobName.split('_')[2]}`
            isValidConfigRef = await getCustomTableValidConfig(validTableName)
        }

        if (!isValidConfigRef) {
            return new Promise<boolean>((resolve) => {
                window.$dialog.warning({
                    title: '警告',
                    content: `检测到未在【质量门户】对[${validTableName}]进行配置，是否继续执行质检？`,
                    positiveText: '确定',
                    negativeText: '取消',
                    onPositiveClick: () => {
                        resolve(true);
                    },
                    onNegativeClick: () => {
                        resolve(false);
                    }
                });
            });
        } else {
            return true
        }
    } else {
        return true
    }
}

// 检查任务模板是否存在新版本
const checkJobRulesUpdateTime = async (job: Job): Promise<boolean> => {
    if (job.type === '数据质检任务') {

        const tableName = job.jobName.split('_').pop()

        let rulesUpdateTime: string
        // 行为数据且不是数据湖质检任务
        if (actionTableNames.includes(tableName) && !job.jobName.startsWith('zj_lake')) {
            rulesUpdateTime = formatDate((await get_simp_zj_json(tableName))[0].simpZjUpdateTime)
        } else {
            rulesUpdateTime = formatDate((await get_zj_json(tableName))[0].zjUpdateTime)
        }

        if (compareTimeStrings(job.updateTime, rulesUpdateTime) > -1) {
            return true
        } else {
            return new Promise<boolean>((resolve) => {
                window.$dialog.warning({
                    title: '警告',
                    content: `检测到质检规则已更新，是否继续以旧规则执行质检？`,
                    positiveText: '确定',
                    negativeText: '取消',
                    onPositiveClick: () => {
                        resolve(true);
                    },
                    onNegativeClick: () => {
                        resolve(false);
                    }
                });
            });
        }
    } else if (job.type == '数据融合任务' || job.type == '单表融合任务') {
        const rulesUpdateTime = formatDate((await get_rh_json(job.jobName.split('_').pop()))[0].rh1UpdateTime)
        if (compareTimeStrings(job.updateTime, rulesUpdateTime) > -1) {
            return true
        } else {
            return new Promise<boolean>((resolve) => {
                window.$dialog.warning({
                    title: '警告',
                    content: `检测到融合任务模板已更新，是否继续以旧任务模板执行任务？`,
                    positiveText: '确定',
                    negativeText: '取消',
                    onPositiveClick: () => {
                        resolve(true);
                    },
                    onNegativeClick: () => {
                        resolve(false);
                    }
                });
            });
        }
    } else {
        return true
    }
}

const checkRh2Job = async (job: Job): Promise<boolean> => {
    if (job.type === '多表融合任务') {
        // 所有正在运行的多表融合的任务
        const runningRh2JobsByPrefix = (await get_workflow_page({
            page: 1,
            size: 10000,
            status: '4',
            procName: `rh2_`
        })).data.records

        if (!isEmpty(runningRh2JobsByPrefix) && runningRh2JobsByPrefix.some((job1: {
            procName: string;
        }) => job1.procName.split('_')[2] == job.jobName.split('_')[2])) {
            return new Promise<boolean>((resolve) => {
                window.$dialog.warning({
                    title: '警告',
                    content: `目前已有${job.jobName.split('_')[2].toUpperCase()}的多表融合任务正在运行，多个任务同时运行可能导致数据不平，是否继续执行此任务？`,
                    positiveText: '确定',
                    negativeText: '取消',
                    onPositiveClick: () => {
                        resolve(true);
                    },
                    onNegativeClick: () => {
                        resolve(false);
                    }
                });
            });
        } else {
            return true
        }
    } else {
        return true
    }
}

export const workflowStart = (v: Job, onSuccess: {
    (): any;
    (): any;
    (): any;
    (): any;
    (): any;
    (): any;
}) => {
    const param = {
        businessKey: uuid.v4(),
        code: v.code,
        createBy: v.createBy,
        creator: v.createBy
    }
    workflow_run(param).then(async res => {
        if (res.code == 200) {
            window.$message.success(res.message)
            await onSuccess()
        } else {
            window.$message.error(res.message)
        }
    }).then(() => {
        create_cron_job(v.jobName).catch(error => {
            window.$message.error(error)
        })
    })
}

export const workflowReRun = (v: Job, onSuccess: () => void) => {
    checkRunningNum().then(isPass => {
        if (isPass) {
            workflow_rerun(v.id, 1).then(res => {
                if (res.code == 200) {
                    window.$message.success(res.message)
                    onSuccess()
                } else {
                    window.$message.error(res.message)
                }
            }).then(() => {
                create_cron_job(v.jobName).catch(error => {
                    window.$message.error(error)
                })
            })
        }
    })
}

export const workflowDelete = (id: string, onSuccess: () => void) => {
    workflow_delete(id).then(res => {
        if (res.code == 200) {
            window.$message.success(res.data)
            onSuccess()
        } else {
            window.$message.error("删除失败")
        }
    })
}

export const workflowJobGetLastExecTime = async (v: {
    id: string;
}) => {
    const res = await get_workflow_log(v.id, 1, 1);
    if (!isEmpty(res.data.records)) {
        return res.data.records[0].startTime;
    } else {
        return '--';
    }
};

export const workflowJobGetNextExecTime = (v: {
    schedulingMode: number | string;
    crontab: string;
    dependencyWorkflowName: any;
}) => {
    if (v.schedulingMode == 2) {
        const interval = parseExpression(convertToSixFields(v.crontab));
        return formatDate(interval.next().toDate())
    } else if (v.schedulingMode == 1) {
        return `依赖于${v.dependencyWorkflowName}`
    } else {
        return '未配置调度任务'
    }
}

export const getWorkflowJobType = (v: {
    procName: string;
}) => {
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

export const getJobType = (jobName: string) => {
    switch (jobName.split('_')[0]) {
        case 'cj':
            return '数据采集任务'
        case 'gx':
            return '数据共享任务'
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

export const getWorkflowJobStatus = (v: {
    status: string;
}) => {
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
            return null
    }
}

//endregion

//region DataX
export const dataXJobStart = async (row: Job, onSuccess: () => void) => {
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

export const dataXJobStop = async (row: Job, onSuccess: () => void) => {
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

export const dataXJobRun = async (row: Job, onSuccess: () => void) => {
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

export const dataXJobDelete = async (row: Job, onSuccess: () => void) => {
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

export const getDataXJobStatus = async (v: {
    configuration: number;
    jobDesc: any;
}, schedJob: {
    triggerStatus: number;
}) => {
    if (v.configuration == 0) {
        return 0 //未配置
    } else {
        const log: DataXJobLogType = (await get_datax_job_log({
            current: 1,
            size: 1,
            jobContent: v.jobDesc
        })).data.records[0]
        if (log != undefined) {
            if (log.handleCode == 200) { //若成功
                if (schedJob?.triggerStatus == 1) {
                    return 2
                } else {
                    return 1
                }
            } else if (log.handleCode == 500) {
                return 4 // 异常
            } else if (log.handleCode == 0) {
                return 4 // 未运行
            } else if (log.handleCode == 201) {
                return 3 // 运行中
            } else {
                return 5 // 其他
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

export const getDataXJobType = (v: {
    jobDesc: string;
}) => {
    switch (v.jobDesc.split('_')[0]) {
        case 'cj':
            return '数据采集任务'
        case 'gx':
            return '数据共享任务'
        default :
            return '未知任务'
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

//endregion

export const getSchedJob = async (jobName: string): Promise<SchedJobType> => {
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

export const setJobStatus = (row: Job) => {
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

export const getTableCommentByProName = async (procName: string) => {
    return (await get_table_sql({
        tableName: procName.split('_')[2]
    }))[0].comment as string
}
