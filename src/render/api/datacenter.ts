import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

// 获取项目列表
export async function get_job_project_list() {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.request, '/gather/api/jobProject/list', 'GET'))
    return data.data
}

// 获取负责人列表
export async function get_person_list() {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.request, '/services/am-usrc/usrc/user/sm-list', 'POST'))
    return data.data
}
