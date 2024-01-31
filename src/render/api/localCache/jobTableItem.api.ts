import {ipcInstance} from "@render/plugins";
import {channels} from "@render/api/channels";
import {JobTableItemCache} from "@main/entity/localCache/JobTableItem";
import {Job} from "@common/types/jobMgt";

export const save_job_table_item_cache = async (treeNodeKey: string, jobs: Job[]) => {
    const {data} = await ipcInstance.send(channels.localCache.jobTableItem.save, treeNodeKey,
        JSON.stringify(jobs, (key, value) => {
            // 排除jobNameVNode属性
            if (key === 'jobNameVNode') {
                return undefined;
            }
            return value;
        }))
    return data
}

export const fetch_job_table_item_cache = async (key: string): Promise<JobTableItemCache[]> => {
    const {data} = await ipcInstance.send(channels.localCache.jobTableItem.fetchByTreeNodeKey, key)
    return data
}
