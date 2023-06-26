// 查询dataX任务名是否存在
import {get_cj_job_page, get_workflow_page} from "@render/api/datacenter";

export const dataXJobNameExist = async (jobName: string) => {
    const records = (await get_cj_job_page({
        current: 1,
        size: 10000,
        jobDesc: jobName,
        subsystemName: "采集"
    })).data.records
    return records.length > 0;
}

export const workflowJobNameExist = async (jobName: string) => {
    const records = (await get_workflow_page({
        page: 1,
        size: 10000,
        status: null,
        procName: jobName
    })).data.records
    return records.length > 0;
}
