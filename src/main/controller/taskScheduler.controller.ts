import {DCJob, Scheduler, Task} from "@common/taskSchedulerTypes";
import {DataXJobLogType, WorkflowType} from "@common/types";
import {DatacenterController} from "@main/controller/datacenter.controller";
import {getAppDataPath} from "@main/utils/appPath";
import {getCurrentDateTime} from "@main/utils/dateUtils";
import {jsonfileWrite, readFsSync} from "@main/utils/fsUtils";
import {failure, success} from "@main/vo/resultVo";
import {MAIN_WINDOW} from "@main/window/constants";
import {channels} from "@render/api/channels";
import {formatDate} from "@render/utils/common/dateUtils";
import {CronJob} from "cron";
import {Controller, IpcHandle, IpcSend} from "einf";
import {Notification} from "electron";
import log from "electron-log";
import {isEmpty} from "lodash";
import {join} from "path";
import {uuid} from "vue3-uuid";

type TaskAlias = Task
type SchedulerTaskCronJobType = {
    id: string,
    cronJob: CronJob
}

@Controller()
export class TaskSchedulerController {
    // 单例模式
    private static instance: TaskSchedulerController;
    private SCHEDULER_FILE_PATH: string = join(getAppDataPath(), 'cron', 'taskDependencyScheduler.json')

    constructor() {
        this.schedulerTaskCronJobsInit()
    }

    public static getInstance(): TaskSchedulerController {
        if (!TaskSchedulerController.instance) {
            TaskSchedulerController.instance = new TaskSchedulerController();
        }
        return TaskSchedulerController.instance;
    }

    // 调度任务单例
    private schedulerTaskCronJobs: SchedulerTaskCronJobType[];

    public getSchedulerTaskCronJobs(): SchedulerTaskCronJobType[] {
        return this.schedulerTaskCronJobs;
    }

    // 初始化cron调度任务
    private schedulerTaskCronJobsInit() {
        this.schedulerTaskCronJobs = []
        let scheduler = this.handleGetScheduler()
        if (scheduler != null && !isEmpty(scheduler?.tasks)) {
            scheduler.tasks.forEach(task => {
                let cronJob = this.getCronJobInstance(task)
                this.schedulerTaskCronJobs.push({
                    id: task.id,
                    cronJob: cronJob
                })
            })
        }
    }

    public getCronJobInstance(task: TaskAlias) {
        return new CronJob(task.cron, () => {
            // 任务已启用且未运行
            if (task.isEnable && !task.isRunning) {
                task.isRunning = true
                this.handleSaveTask(task)
                this.runDependencySchedulingTask(task)
            }
        })
    }

    // 任务更新或新增，调度任务实例数组也需更新
    @IpcHandle(channels.taskScheduler.schedulerTaskCronJobUpdate)
    public handleSchedulerTaskCronJobUpdate(task: TaskAlias) {
        let schedulerTaskCronJob = this.schedulerTaskCronJobs.find(job => job.id == task.id);
        let index = this.schedulerTaskCronJobs.findIndex(job => job.id == task.id);
        if (schedulerTaskCronJob == null) {
            this.schedulerTaskCronJobs.push({
                id: task.id,
                cronJob: this.getCronJobInstance(task)
            })
        } else {
            this.schedulerTaskCronJobs.splice(index, 1, {
                id: task.id,
                cronJob: this.getCronJobInstance(task)
            })

            if (task.isEnable) {
                this.handleCronJobStart(task)
            } else {
                this.handleCronJobStop(task)
            }

        }
    }

    //  启动cron，同时检测任务是否也已启动
    public cronJobsStartAll() {
        this.schedulerTaskCronJobsInit()
        let scheduler = this.handleGetScheduler()
        this.schedulerTaskCronJobs.forEach(job => {
            const task = scheduler.tasks.find(task => task.id == job.id && task.isEnable);
            if (task != null) {
                job.cronJob.start()
                log.info(`[${task.taskName}] 调度任务已启用`)
            }
        })
    }

    //  停止运行所有任务
    public cronJobsStopAll() {
        let scheduler = this.handleGetScheduler()
        for (let i = 0; i < scheduler.tasks.length; i++) {
            scheduler.tasks[i].isRunning = false
        }
        jsonfileWrite(this.SCHEDULER_FILE_PATH, scheduler, {spaces: 2})

        this.schedulerTaskCronJobs.forEach(job => {
            if (job.cronJob != null) {
                job.cronJob.stop()
            }
        })
    }

    @IpcHandle(channels.taskScheduler.cronJobStart)
    public handleCronJobStart(task: TaskAlias) {
        const cronJob = this.schedulerTaskCronJobs.find(job => job.id == task.id)
        if (cronJob != null) {
            cronJob.cronJob.start()
            log.info(`[${task.taskName}] 调度任务已启用`)
        }
    }

    @IpcHandle(channels.taskScheduler.cronJobStop)
    public handleCronJobStop(task: TaskAlias) {
        const cronJob = this.schedulerTaskCronJobs.find(job => job.id == task.id)
        if (cronJob != null) {
            cronJob.cronJob.stop()
            log.info(`[${task.taskName}] 调度任务已停用`)
        }
    }

    /**
     * 执行任务
     **/
    public runDependencySchedulingTask(task: TaskAlias) {

        type JobExecResult = {
            success: boolean,
            msg: string
        }

        async function runJob(job: DCJob): Promise<JobExecResult> {
            const datacenter = new DatacenterController()
            if (job.jobType == 'dataX') {

                const dataxJob = (await datacenter.handleGetSchedJobPage({
                    current: 1,
                    size: 1,
                    jobContent: job.name
                })).data?.records[0] || null

                // 任务需存在
                if (dataxJob != null) {
                    if (dataxJob.handleCode == 201) {
                        // 已经开始运行 则跳过
                        return {
                            success: true,
                            msg: "任务已开始运行"
                        }
                    }

                    // 运行任务
                    await datacenter.handleRunDataxJobByJobContent(job.name)

                    return new Promise((resolve) => {

                        const interval = setInterval(async () => {
                            const log: DataXJobLogType = (await datacenter.handleGetDataXJobLog({
                                current: 1,
                                size: 1,
                                jobContent: job.name
                            })).data?.records[0] || null

                            if (log != null) {
                                if (log.handleCode == 201) { //运行中
                                    // 继续执行
                                    console.log(`任务${job.name}运行中`)
                                } else if (log.handleCode == 500) { // 异常
                                    clearInterval(interval); // 停止循环
                                    resolve({
                                        success: false,
                                        msg: "任务执行异常"
                                    })
                                } else if (log.handleCode == 200) {
                                    clearInterval(interval); // 停止循环
                                    resolve({
                                        success: true,
                                        msg: "任务执行成功"
                                    });
                                } else {
                                    clearInterval(interval); // 停止循环
                                    resolve({
                                        success: false,
                                        msg: "任务执行失败"
                                    });
                                }
                            } else {
                                clearInterval(interval); // 停止循环
                                resolve({
                                    success: false,
                                    msg: "任务未正常运行"
                                });
                            }
                        }, 1000);
                    });

                } else {
                    console.log("任务不存在")
                    return {
                        success: false,
                        msg: "任务不存在"
                    }
                }

            } else {

                const workflow: WorkflowType = (await datacenter.handleGetWorkflow(job.id)).data

                //任务需存在，且需处于启动状态
                if (workflow != null) {
                    if (workflow.status == '1') {
                        // 运行任务
                        await datacenter.handleWorkflowRun({
                            businessKey: uuid.v4(),
                            code: workflow.procCode,
                            createBy: workflow.createBy,
                            creator: workflow.createBy
                        })
                    } else if (workflow.status == '2') {
                        // 停用的 则先启用
                        await datacenter.handleWorkflowActive({id: workflow.id, type: '01'})

                        // 运行任务
                        await datacenter.handleWorkflowRun({
                            businessKey: uuid.v4(),
                            code: workflow.procCode,
                            createBy: workflow.createBy,
                            creator: workflow.createBy
                        })

                    } else if (workflow.status == '3' || workflow.status == '5') {
                        // 异常或未反馈 则重跑
                        await datacenter.handleWorkflowRerun(workflow.id, 1)
                    } else if (workflow.status == '4') {
                        // 已经开始运行 则跳过
                        return {
                            success: true,
                            msg: "任务已开始运行"
                        }
                    }

                    return new Promise((resolve) => {
                        const interval = setInterval(async () => {

                            const workflow: WorkflowType = (await datacenter.handleGetWorkflow(job.id)).data

                            if (workflow.status == '4') { //运行中
                                console.log(`任务${job.name}运行中`)
                            } else if (workflow.status == '1') {
                                clearInterval(interval); // 停止循环
                                resolve({
                                    success: true,
                                    msg: "任务执行成功"
                                });
                            } else if (workflow.status == '3' || workflow.status == '5') {
                                clearInterval(interval); // 停止循环
                                resolve({
                                    success: false,
                                    msg: "任务执行异常"
                                });
                            } else {
                                clearInterval(interval); // 停止循环
                                resolve({
                                    success: false,
                                    msg: "任务执行失败"
                                });
                            }
                        }, 1000)
                    })
                } else {
                    return {
                        success: false,
                        msg: "任务不存在"
                    }
                }
            }

        }

        async function runJobs(jobList: DCJob[]) {

            for (let i = 0; i < jobList.length; i++) {
                const job = jobList[i];
                try {
                    const jobResult = await runJob(job);

                    task.execLog.push({
                        time: getCurrentDateTime(),
                        type: jobResult.success ? '200' : '500',
                        text: `${job.name}执行结果：${jobResult.msg}`
                    })

                    if (jobResult.success) {
                        await runJobs(job.dependentJobs);
                    }

                } catch (error) {
                    log.error(error);
                    return failure('执行失败')
                }
            }
            return success('执行成功')
        }

        log.info(`${task.taskName}任务开始执行`)
        task.lastStartTime = formatDate(new Date())
        runJobs(task.jobList).then((res) => {
            task.isRunning = false
            task.lastEndTime = formatDate(new Date())
            task.lastExecResult = res.message ? '成功' : '失败'

            this.handleSaveTask(task)

            log.info(`[${task.taskName}]结束执行`)

            this.handleSendTaskExecEnd()

            let jobEndNotice = new Notification({
                title: `调度任务监听`,
                body: `[${task.taskName}]调度任务:${res.message} ${res.success ? '✔️' : '❌'}`
            })
            jobEndNotice.show()
            jobEndNotice.on('click', async () => {
                jobEndNotice.close()
            })

        })

    }

    @IpcSend(channels.taskScheduler.sendTaskExecEnd, MAIN_WINDOW)
    public handleSendTaskExecEnd() {
        return true
    }

    @IpcHandle(channels.taskScheduler.getScheduler)
    public handleGetScheduler(): Scheduler {
        const buffer = readFsSync(this.SCHEDULER_FILE_PATH)

        const defaultSetting: Scheduler = {
            tasks: [],
            monitoringFrequency: 1000
        }

        if (buffer == null || isEmpty(buffer.toString())) {
            jsonfileWrite(this.SCHEDULER_FILE_PATH, defaultSetting, {spaces: 2})
            return defaultSetting
        } else {
            try {
                return JSON.parse(buffer.toString())
            } catch (e) {
                log.error(e)
                return null
            }
        }
    }

    @IpcHandle(channels.taskScheduler.getTask)
    public handleGetTask(id: string): Task {
        let scheduler = this.handleGetScheduler()
        const tasks = scheduler.tasks.find(task => task.id == id);
        if (tasks != null) {
            return tasks
        } else {
            return null
        }
    }

    @IpcHandle(channels.taskScheduler.saveTask)
    public handleSaveTask(taskParam: TaskAlias | string) {
        try {
            let task: TaskAlias = null
            if (typeof taskParam == 'string') {
                task = JSON.parse(taskParam) as TaskAlias
            } else {
                task = taskParam
            }

            let scheduler = this.handleGetScheduler()

            const index = scheduler.tasks.findIndex(task1 => task1.id == task.id)
            if (index !== -1) {
                // 使用新的 job 对象替换该索引处的元素
                scheduler.tasks.splice(index, 1, Object.assign(scheduler.tasks[index], task));
            } else {
                scheduler.tasks.push(task)

            }
            jsonfileWrite(this.SCHEDULER_FILE_PATH, scheduler, {spaces: 2})

            this.handleSchedulerTaskCronJobUpdate(task)

            return success('保存成功')
        } catch (e) {
            log.error(e)
            return failure(`保存失败,${e}`)
        }
    }

    @IpcHandle(channels.taskScheduler.taskDelete)
    public handleTaskDelete(id: string) {
        try {
            let scheduler = this.handleGetScheduler()
            scheduler.tasks = scheduler.tasks.filter(task => task.id != id);
            jsonfileWrite(this.SCHEDULER_FILE_PATH, scheduler, {spaces: 2})
            return success('删除成功')
        } catch (e) {
            log.error(e)
            return failure(`删除失败,${e}`)
        }
    }

    @IpcHandle(channels.taskScheduler.taskEnable)
    public handleTaskEnable(taskId: string, enable: boolean) {
        try {
            let scheduler = this.handleGetScheduler()
            const task = scheduler.tasks.find(task => task.id == taskId);

            if (task != null) {
                task.isEnable = enable
                if (this.handleSaveTask(task).success) {
                    return success(`${enable ? '启用' : '停用'}成功`)
                } else {
                    return failure(`${enable ? '启用' : '停用'}失败`)
                }

            } else {
                return failure(`任务不存在`)
            }
        } catch (e) {
            log.error(e)
            return failure(`保存失败,${e}`)
        }
    }

    @IpcHandle(channels.taskScheduler.taskRun)
    public handleTaskRun(taskParam: TaskAlias | string) {
        try {
            let task: TaskAlias
            if (typeof taskParam == 'string') {
                task = JSON.parse(taskParam) as TaskAlias
            } else {
                task = taskParam
            }

            if (task.isEnable && !task.isRunning) {
                task.isRunning = true
                this.handleSaveTask(task)
                this.runDependencySchedulingTask(task)
                return success(`执行成功`)
            }

        } catch (e) {
            return failure(`执行失败,${e}`)
        }

    }
}
