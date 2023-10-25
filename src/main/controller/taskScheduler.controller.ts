import {DCJob, ExecLog, Scheduler, Task} from "@common/taskSchedulerTypes";
import {DataXJobLog} from "@common/types/datacenter/dataCollection";
import {Workflow} from "@common/types/datacenter/workflow";
import {DatacenterController} from "@main/controller/datacenter.controller";
import {getAppDataPath} from "@main/utils/appPath";
import {getCurrentDateTime} from "@main/utils/dateUtils";
import {jsonfileWrite, readFsAsync} from "@main/utils/fsUtils";
import {failure, success} from "@main/vo/resultVo";
import {MAIN_WINDOW} from "@main/window/constants";
import {channels} from "@render/api/channels";
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
        this.schedulerTaskCronJobsInit().then(() => {
        })
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
    private async schedulerTaskCronJobsInit() {
        try {
            this.schedulerTaskCronJobs = []
            let scheduler = await this.handleGetScheduler()
            if (scheduler != null && !isEmpty(scheduler?.tasks)) {
                scheduler.tasks.forEach(task => {
                    let cronJob = this.getCronJobInstance(task)
                    this.schedulerTaskCronJobs.push({
                        id: task.id,
                        cronJob: cronJob
                    })
                })
            }
            return failure('CronJob单例初始化成功')
        } catch (e) {
            log.error('CronJob单例初始化失败')
            return failure('CronJob单例初始化失败')
        }

    }

    public getCronJobInstance(task: TaskAlias) {
        return new CronJob(task.cron, async () => {
            // 任务已启用且未运行
            if (task.isEnable && !task.isRunning) {
                await this.runDependencySchedulingTask(task)
            }
        })
    }

    //  启动cron，同时检测任务是否也已启动
    public async cronJobsStartAll() {
        let scheduler = await this.handleGetScheduler()
        this.schedulerTaskCronJobs.forEach(job => {
            const task = scheduler.tasks.find(task => task.id == job.id && task.isEnable);
            if (task != null) {
                job.cronJob.start()
                log.info(`[${task.taskName}] 调度任务已启用`)
            }
        })
    }

    //  停止运行所有任务
    public async cronJobsStopAll() {
        let scheduler = await this.handleGetScheduler()

        const setAllJobsIsRunningFalse = (jobList: DCJob[]) => {
            for (const job of jobList) {
                if (typeof job.sqlConfig != 'undefined') {
                    job.sqlConfig.isRunning = false;
                }

                if (job.dependentJobs.length > 0) {
                    setAllJobsIsRunningFalse(job.dependentJobs);
                }
            }
        }

        for (let i = 0; i < scheduler.tasks.length; i++) {
            scheduler.tasks[i].isRunning = false
            // 日志内运行中状态重置
            for (let j = 0; j < scheduler.tasks[i].execLog.length; j++) {
                if (scheduler.tasks[i].execLog[j].status == 0 && scheduler.tasks[i].execLog[j].jobLog.length == 0) {
                    scheduler.tasks[i].execLog[j].status = 2
                    scheduler.tasks[i].execLog[j].msg = '任务中断'
                }
            }

            // sql任务运行中重置
            setAllJobsIsRunningFalse(scheduler.tasks[i].jobList)
        }

        await jsonfileWrite(this.SCHEDULER_FILE_PATH, scheduler, {spaces: 2})

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
    public async runDependencySchedulingTask(task: TaskAlias) {
        log.info(`${task.taskName}任务开始执行`)
        task.lastStartTime = getCurrentDateTime()
        task.execLog.push({
            startTime: getCurrentDateTime(),
            status: 0,
            jobLog: []
        })
        task.isRunning = true
        await this.handleUpdateTask(task)
        this.parallelExecuteDependentJobs(task, task.jobList).then(async (res) => {
            task.isRunning = false
            task.lastEndTime = getCurrentDateTime()
            task.lastExecResult = res.success ? '成功' : '失败'
            task.execLog.at(-1).endTime = getCurrentDateTime()
            task.execLog.at(-1).status = res.success ? 1 : 2
            task.execLog.at(-1).msg = res.message
            await this.handleUpdateTask(task)

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

    private async runJob(taskId: string, job: DCJob): Promise<{
        success: boolean,
        msg: string
    }> {
        const datacenter = new DatacenterController()
        if (job.jobType == 'dataX') {

            const dataxJob = (await datacenter.handleGetSchedJobPage({
                current: 1,
                size: 1,
                jobContent: job.name
            })).data?.records[0] || null

            // 任务需存在
            if (dataxJob != null) {
                if (dataxJob.handleCode != 201) {
                    // 运行任务
                    await datacenter.handleRunDataxJobByJobContent(job.name)
                }

                return new Promise((resolve) => {

                    const interval = setInterval(async () => {
                        const log: DataXJobLog = (await datacenter.handleGetDataXJobLog({
                            current: 1,
                            size: 1,
                            jobContent: job.name
                        })).data?.records[0] || null

                        if (log != null) {
                            if (log.handleCode == 201) { //运行中
                                // 继续执行
                                console.log(`任务[${job.name}]运行中...`)
                            } else if (log.handleCode == 500) { // 异常
                                clearInterval(interval); // 停止循环
                                resolve({
                                    success: false,
                                    msg: `任务执行异常`
                                })
                            } else if (log.handleCode == 200) {
                                clearInterval(interval); // 停止循环
                                console.log(`任务[${job.name}]执行成功`)
                                resolve({
                                    success: true,
                                    msg: `任务执行成功`
                                });
                            } else {
                                clearInterval(interval); // 停止循环
                                resolve({
                                    success: false,
                                    msg: `任务执行失败`
                                });
                            }
                        } else {
                            clearInterval(interval); // 停止循环
                            resolve({
                                success: false,
                                msg: `任务未正常运行`
                            });
                        }
                    }, 1000);
                });

            } else {
                log.error("任务不存在")
                return {
                    success: false,
                    msg: `任务不存在`
                }
            }

        } else if (job.jobType == 'workflow') {

            const workflow: Workflow = (await datacenter.handleGetWorkflow(job.id)).data

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
                    await datacenter.handleWorkflowActive({
                        id: workflow.id,
                        type: '01'
                    })

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
                    // 已经开始运行
                }

                return new Promise((resolve) => {
                    const interval = setInterval(async () => {

                        const workflow: Workflow = (await datacenter.handleGetWorkflow(job.id)).data

                        if (workflow.status == '4') { //运行中
                            console.log(`任务[${job.name}]运行中...`)
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
        } else if (job.jobType == 'sparkSql' || job.jobType == 'mysql') {
            let paramModel = {
                sourceId: job.sqlConfig.dbId,
                dbType: job.sqlConfig.dbType,
                sourceName: '',
                dataTierCode: '',
                dataTierName: '',
                namedJson: '',
                datamodelTableFieldsVoList: [],
                lifeCycle: '1',
                ddlSql: job.sqlConfig.sql,
                tableName: 'execSql'
            }

            const scheduler = await this.handleGetScheduler()
            const task = scheduler.tasks.find(task => task.id == taskId);

            job.sqlConfig.isRunning = true
            const newTask = this.handleUpdateDCJob(task, job)
            if (newTask != null) {
                await this.handleUpdateTask(newTask)
            }

            const res = await datacenter.handleExecSql(paramModel)

            if ((res.code == 500 && res.message === '服务器内部错误') || (res.code == 200 && res.success)) {
                // 执行成功
                return new Promise((resolve) => {
                    setTimeout(async () => {
                        job.sqlConfig.isRunning = false
                        let newTask = this.handleUpdateDCJob(task, job)
                        if (newTask != null) {
                            await this.handleUpdateTask(newTask)
                        }
                        resolve({
                            success: true,
                            msg: "任务执行成功"
                        })
                    }, (job.sqlConfig.timeout == undefined ? 5 * 60 : job.sqlConfig.timeout) * 1000)
                })

            } else {
                job.sqlConfig.isRunning = false
                const newTask = this.handleUpdateDCJob(task, job)
                await this.handleUpdateTask(newTask)
                // 执行失败
                return {
                    success: false,
                    msg: `任务执行失败:${res.message.replace(/建表失败，/g, '')}`
                }
            }

        }

    }

    // 串行执行
    private async serialExecuteDependentJobs(task: TaskAlias, jobList: DCJob[]) {
        for (let i = 0; i < jobList.length; i++) {
            const job = jobList[i];
            try {

                const jobLog: ExecLog = {
                    jobName: job.name,
                    startTime: getCurrentDateTime(),
                    endTime: null,
                    status: 0
                }

                const jobResult = await this.runJob(task.id, job);

                jobLog.endTime = getCurrentDateTime()
                jobLog.status = jobResult.success ? 1 : 2
                jobLog.msg = jobResult.msg

                task.execLog.at(-1).jobLog.push(jobLog)
                await this.handleUpdateTask(task)

                if (jobResult.success) {
                    // 若此时本地文件内的任务配置更新
                    const newTaskConfig = (await this.handleGetScheduler()).tasks.find(task1 => task1.id == task.id)
                    if (typeof newTaskConfig.isEnable != "undefined") {
                        await this.serialExecuteDependentJobs(task, job.dependentJobs);
                    } else {
                        return failure('任务配置异常')
                    }
                }

            } catch (error) {
                log.error(error);
                return failure('执行失败')
            }
        }
        return success('执行成功')
    }

    /**
     * 同级任务中并行执行
     **/
    private async parallelExecuteDependentJobs(task: TaskAlias, jobList: DCJob[]) {
        await Promise.all(jobList.map(async (job) => {
            try {

                const jobLog: ExecLog = {
                    jobName: job.name,
                    startTime: getCurrentDateTime(),
                    endTime: null,
                    status: 0
                }

                const jobResult = await this.runJob(task.id, job);

                jobLog.endTime = getCurrentDateTime()
                jobLog.status = jobResult.success ? 1 : 2
                jobLog.msg = jobResult.msg

                task.execLog.at(-1).jobLog.push(jobLog)
                await this.handleUpdateTask(task)

                if (jobResult.success) {
                    const newTaskConfig = (await this.handleGetScheduler()).tasks.find((task1) => task1.id === task.id);

                    if (typeof newTaskConfig?.isEnable !== "undefined") {
                        await Promise.all(job.dependentJobs.map(async dependentJob => await this.parallelExecuteDependentJobs(task, [dependentJob])));
                    } else {
                        return failure('任务配置异常');
                    }
                }
            } catch (error) {
                log.error(error);
                return failure('执行失败');
            }
        }));

        return success('执行成功');
    }

    @IpcSend(channels.taskScheduler.sendTaskExecEnd, MAIN_WINDOW)
    public handleSendTaskExecEnd() {
        return true
    }

    @IpcHandle(channels.taskScheduler.getScheduler)
    public async handleGetScheduler(): Promise<Scheduler> {
        const buffer = await readFsAsync(this.SCHEDULER_FILE_PATH)
        const defaultSetting: Scheduler = {
            tasks: [],
            monitoringFrequency: 1000
        }

        if (buffer == null || isEmpty(buffer.toString())) {
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
    public async handleGetTask(id: string): Promise<Task> {
        let scheduler = await this.handleGetScheduler()
        const tasks = scheduler.tasks.find(task => task.id == id);
        if (tasks != null) {
            return tasks
        } else {
            return null
        }
    }

    @IpcHandle(channels.taskScheduler.saveTask)
    public async handleSaveTask(taskParam: TaskAlias | string) {
        try {
            let task: TaskAlias = null
            if (typeof taskParam == 'string') {
                task = JSON.parse(taskParam) as TaskAlias
            } else {
                task = taskParam
            }

            let scheduler = await this.handleGetScheduler()

            const index = scheduler.tasks.findIndex(task1 => task1.id == task.id)
            if (index !== -1) {
                // 使用新的 job 对象替换该索引处的元素
                scheduler.tasks.splice(index, 1, Object.assign(scheduler.tasks[index], task));
            } else {
                scheduler.tasks.push(task)
            }
            await jsonfileWrite(this.SCHEDULER_FILE_PATH, scheduler, {spaces: 2})

            this.handleSchedulerTaskCronJobUpdate(task)

            return success('保存成功')
        } catch (e) {
            log.error(e)
            return failure(`保存失败,${e}`)
        }
    }

    // 仅更新task 不插入
    public async handleUpdateTask(task: TaskAlias) {
        try {
            let scheduler = await this.handleGetScheduler()
            const index = scheduler.tasks.findIndex(task1 => task1.id == task.id)
            if (index !== -1) {
                // 使用新的 job 对象替换该索引处的元素
                scheduler.tasks.splice(index, 1, Object.assign(scheduler.tasks[index], task));

                await jsonfileWrite(this.SCHEDULER_FILE_PATH, scheduler, {spaces: 2})

            } else {
                return failure(`任务不存在`)
            }
        } catch (e) {
            log.error(e)
            return failure(`更新失败,${e}`)
        }
    }

    // 仅更新DCJob
    public handleUpdateDCJob(task: TaskAlias, job: DCJob) {
        try {
            const newJobList = this.UpdateJobById(job, task.jobList)
            if (typeof newJobList != 'undefined') {
                task.jobList = newJobList
                return task
            } else {
                log.error('中台任务不存在')
                return null
            }
        } catch (e) {
            log.error(`更新失败,${e}`)
            return null
        }
    }

    @IpcHandle(channels.taskScheduler.findJobById)
    public async findJobById(jobId: string, taskId: string): Promise<DCJob | undefined> {
        let scheduler = await this.handleGetScheduler()
        const task = scheduler.tasks.find(task1 => task1.id == taskId);

        function find(jobId: string, jobList: DCJob[]) {
            for (const job of jobList) {
                if (job.id === jobId) {
                    return job;
                }
                const dependentJob = find(jobId, job.dependentJobs);
                if (dependentJob) {
                    return dependentJob;
                }
            }
            return undefined;
        }

        return find(jobId, task.jobList)

    }

    public UpdateJobById(newJob: DCJob, jobList: DCJob[]): DCJob[] {
        for (let job of jobList) {
            if (job.id === newJob.id) {
                job = Object.assign(job, newJob)
                return jobList;
            }
            const dependentJobList = this.UpdateJobById(newJob, job.dependentJobs);
            if (dependentJobList.length > 0) {
                job.dependentJobs = dependentJobList;
                return jobList;
            }
        }
        return [];
    }

    // 任务更新或新增，调度任务实例数组也需更新
    public handleSchedulerTaskCronJobUpdate(task: TaskAlias) {
        let schedulerTaskCronJob = this.schedulerTaskCronJobs.find(job => job.id == task.id);
        let index = this.schedulerTaskCronJobs.findIndex(job => job.id == task.id);
        if (schedulerTaskCronJob == null) {
            this.schedulerTaskCronJobs.push({
                id: task.id,
                cronJob: this.getCronJobInstance(task)
            })
        } else {
            schedulerTaskCronJob.cronJob.stop()
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

    @IpcHandle(channels.taskScheduler.taskDelete)
    public async handleTaskDelete(id: string) {
        try {
            let scheduler = await this.handleGetScheduler()
            scheduler.tasks = scheduler.tasks.filter(task => task.id != id);
            await jsonfileWrite(this.SCHEDULER_FILE_PATH, scheduler, {spaces: 2})
            return success('删除成功')
        } catch (e) {
            log.error(e)
            return failure(`删除失败,${e}`)
        }
    }

    @IpcHandle(channels.taskScheduler.taskEnable)
    public async handleTaskEnable(taskId: string, enable: boolean) {
        try {
            let scheduler = await this.handleGetScheduler()
            const task = scheduler.tasks.find(task => task.id == taskId);

            if (task != null) {
                task.isEnable = enable
                if ((await this.handleSaveTask(task)).success) {
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
    public async handleTaskRun(taskParam: TaskAlias | string) {
        try {
            let task: TaskAlias
            if (typeof taskParam == 'string') {
                task = JSON.parse(taskParam) as TaskAlias
            } else {
                task = taskParam
            }

            if (task.isEnable && !task.isRunning) {
                await this.runDependencySchedulingTask(task)
                return success(`执行成功`)
            }

        } catch (e) {
            return failure(`执行失败,${e}`)
        }

    }

    @IpcHandle(channels.taskScheduler.taskInterrupt)
    public async handleTaskInterrupt(taskParam: TaskAlias | string) {
        try {
            let task: TaskAlias
            if (typeof taskParam == 'string') {
                task = JSON.parse(taskParam) as TaskAlias
            } else {
                task = taskParam
            }

            task.isRunning = false
            task.isEnable = false
            await this.handleSaveTask(task)
            return success(`任务中断成功`)
        } catch (e) {
            return failure(`任务中断失败,${e}`)
        }

    }
}
