import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const create_cron_job = async (jobName: string) => {
    const {data} = (await ipcInstance.send<string>(channels.cron.createCronJob, jobName))
    return data.data
}
