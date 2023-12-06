import {ActionJobNodeSuffix} from "@common/types/jobMgt";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const update_node_suffix = async (nodeSuffix: Map<string, ActionJobNodeSuffix>) => {
    const {data} = await ipcInstance.send(channels.jobTree.updateNodeSuffix, nodeSuffix)
    return data
}

export const get_node_suffix = async (): Promise<Map<string, ActionJobNodeSuffix>> => {
    const {data} = await ipcInstance.send(channels.jobTree.getNodeSuffix)
    return data
}
