import {Dict} from "@main/entity/Dict";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_max_running_workflow_num = async (): Promise<Dict> => {
    const {data} = (await ipcInstance.send<string>(channels.auxiliaryDb.dict.getMaxRunningWorkFlowJobNum))
    return data
}
