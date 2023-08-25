import {DatacenterController} from "@main/controller/datacenter.controller";
import {getAppDataPath} from "@main/utils/appPath";
import {jsonfileWrite, readFsSync} from "@main/utils/fsUtils";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {Notification} from "electron";
import {join} from "path";
import {isEmpty} from "lodash";
import log from "electron-log";

@Controller()
export class CronController {
    constructor() {
    }

    @IpcHandle(channels.cron.datacenterCronJobInit)
    public async datacenterCronJobInit() {
        const CronJob = require('cron').CronJob;

        let dcJobNames: any[]

        const filePath = join(getAppDataPath(), 'cron', 'dcCron.json')
        const buffer = readFsSync(filePath)
        if (buffer == null || isEmpty(buffer.toString())) {
            dcJobNames = []
        } else {
            try {
                dcJobNames = JSON.parse(buffer.toString())
            } catch (e) {
                log.error(e)
                dcJobNames = []
            }

        }

        let filterJobs = [] //要删除的任务名

        for (const jobName of dcJobNames) {
            const datacenter = new DatacenterController()
            await datacenter.handleGetWorkflowPage(JSON.stringify({
                page: 1,
                procName: jobName,
                size: 1,
                status: '4'
            })).then(async res => {
                //若此任务处于运行中，则开启监听
                if (res != undefined && !isEmpty(res.data.records) && res.data.records[0].procName == jobName) {
                    log.info(`${jobName} 监听任务已默认开启`)
                    let job = new CronJob(
                        '*/1 * * * * *',
                        async function () {
                            await datacenter.handleGetWorkflowPage(JSON.stringify({
                                page: 1,
                                procName: jobName,
                                size: 1,
                                status: null
                            })).then(res => {
                                //任务不存在，或者任务已不在运行中则停止监听
                                if (isEmpty(res.data.records) || (res.data.records[0].procName === jobName && res.data.records[0].status != '4')) {
                                    let jobRes = ''
                                    switch (res.data.records[0].status) {
                                        case '1':// 启用
                                            jobRes = '✔️ 执行成功'
                                            break
                                        case '2':// 停用
                                            jobRes = '任务已停用'
                                            break
                                        case '3':// 异常
                                            jobRes = '❌ 任务异常'
                                            break
                                        case '5':// 未反馈
                                            jobRes = '❔ 任务未反馈'
                                            break
                                    }

                                    const filter = dcJobNames.filter((item) => item !== jobName);
                                    jsonfileWrite(filePath, filter, {spaces: 2})

                                    let jobEndNotice = new Notification({
                                        title: `任务监听`,
                                        body: `${jobName} 任务运行完毕，结果为：${jobRes}`
                                    })

                                    jobEndNotice.show()
                                    jobEndNotice.on('click', async () => {
                                        jobEndNotice.close()
                                    })

                                    job.stop()
                                }
                            })
                        }
                    );

                    job.start()
                } else {

                    filterJobs.push(jobName)
                }
            })
        }

        const filter = dcJobNames.filter((item) => !filterJobs.includes(item));
        jsonfileWrite(filePath, filter, {spaces: 2})
    }

    @IpcHandle(channels.cron.createCronJob)
    public async handleCreateCronJob(jobName: string) {
        let res: { msg: string; success: boolean }
        const datacenter = new DatacenterController()
        const records = (await datacenter.handleGetWorkflowPage(JSON.stringify({
            page: 1,
            procName: jobName,
            size: 1,
            status: '4'
        }))).data.records

        //若此任务处于运行中，则开启监听
        if (!isEmpty(records) && records[0].procName == jobName) {

            let dcJobNames: any[]

            const filePath = join(getAppDataPath(), 'cron', 'dcCron.json')
            const buffer = readFsSync(filePath)
            if (buffer == null || isEmpty(buffer.toString())) {
                dcJobNames = []
            } else {
                dcJobNames = JSON.parse(buffer.toString())
            }

            dcJobNames.push(jobName)

            jsonfileWrite(filePath, dcJobNames, {spaces: 2})

            this.createDatacenterCronJob(jobName)
            res = {
                success: true,
                msg: '监听任务创建成功'
            }
        } else {
            res = {
                success: false,
                msg: '监听任务创建失败，任务名不存在'
            }
        }

        return res
    }

    public createDatacenterCronJob(jobName: string) {
        const CronJob = require('cron').CronJob;

        log.info(`${jobName} 监听任务已开启`)
        let job = new CronJob(
            '*/1 * * * * *',
            async function () {
                const datacenter = new DatacenterController()
                await datacenter.handleGetWorkflowPage(JSON.stringify({
                    page: 1,
                    procName: jobName,
                    size: 1,
                    status: null
                })).then(async res => {
                    //任务不存在，或者任务已不在运行中则停止监听
                    if (isEmpty(res.data.records) || (res.data.records[0].procName === jobName && res.data.records[0].status != '4')) {
                        let jobRes = ''
                        switch (res.data.records[0].status) {
                            case '1':// 启用
                                jobRes = '✔️ 执行成功'
                                break
                            case '2':// 停用
                                jobRes = '任务已停用'
                                break
                            case '3':// 异常
                                jobRes = '❌ 任务异常'
                                break
                            case '5':// 未反馈
                                jobRes = '❔ 任务未反馈'
                                break
                        }

                        let dcJobNames: any[]

                        const filePath = join(getAppDataPath(), 'cron', 'dcCron.json')
                        const buffer = readFsSync(filePath)
                        if (buffer == null || isEmpty(buffer.toString())) {
                            dcJobNames = []
                        } else {
                            dcJobNames = JSON.parse(buffer.toString())
                        }

                        const filter = dcJobNames.filter((item) => item !== jobName);
                        jsonfileWrite(filePath, filter, {spaces: 2})

                        let jobEndNotice = new Notification({
                            title: `任务监听`,
                            body: `${jobName} 任务运行完毕，结果为：${jobRes}`
                        })

                        jobEndNotice.show()
                        jobEndNotice.on('click', async () => {
                            jobEndNotice.close()
                        })

                        job.stop()
                    }
                })
            }
        );

        job.start()
    }
}
