import {ipcInstance} from "@render/plugins";
import {channels} from "@render/api/channels";
import {JobOverviewStatRecord} from "@main/entity/JobOverviewStatRecord";

export const fetch_job_overview_stat_record = async (jobPrefix: string, projectAbbr: string,jobType:number): Promise<JobOverviewStatRecord> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.jobOverviewStatRecord.fetchData, jobPrefix, projectAbbr,jobType))
    return data
}

export const save_job_overview_stat_record = async (record: JobOverviewStatRecord) => {
    const {data} = (await ipcInstance.send(channels.auxiliaryDb.jobOverviewStatRecord.saveRecord, record))
    return data
}
