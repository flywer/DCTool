import {Controller, IpcHandle} from "einf";
import {channels} from "@render/api/channels";
import {AppDataSource} from "@main/dataSource/data-source";
import {JobOverviewStatRecord} from "@main/entity/JobOverviewStatRecord";

@Controller()
export class JobOverviewStatRecordController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.jobOverviewStatRecord.fetchData)
    public handleGetPreDatabase(jobPrefix: string, projectAbbr: string, jobType: number) {
        return AppDataSource.getRepository(JobOverviewStatRecord).findOne({
            where: {
                jobPrefix: jobPrefix,
                projectAbbr: projectAbbr,
                jobType: jobType
            },
            order: {createTime: 'desc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.jobOverviewStatRecord.saveRecord)
    public handleSaveRecord(record: JobOverviewStatRecord) {
        return AppDataSource.getRepository(JobOverviewStatRecord).save(record)
    }
}
