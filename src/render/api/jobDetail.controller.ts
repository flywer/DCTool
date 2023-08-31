import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const find_all_job_detail = async () => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.jobDetail.findAll)
    return data
}
