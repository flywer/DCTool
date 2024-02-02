import {ipcInstance} from "@render/plugins";
import {channels} from "@render/api/channels";
import {ZwfwOrgNode} from "@common/types/Gdzwfw";

export const fetch_org_node = async (regCode: string): Promise<ZwfwOrgNode> => {
    const {data} = await ipcInstance.send(channels.gdZwfw.fetchOrgNode, regCode)
    return data
}

export const fetch_task_type_list = async (orgNumber: string) => {
    const {data} = await ipcInstance.send(channels.gdZwfw.fetchTaskTypeList, orgNumber)
    return data
}
