import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const find_all_project_job_dependency = async () => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.projectJobDependency.findAll)
    return data
}
