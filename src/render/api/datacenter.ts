import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export type CommonQueryParam = {
    current: number,
    size: number,
    blurry: string,
    subsystemName: '采集'
}

// 获取项目列表
export const get_job_project_list = async () => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.jobList))
    return data.data
}

// 获取负责人列表
export const get_person_list = async () => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.personList))
    return data.data
}

// 获取所有数据源
export const get_datasource_list = async (current: number, size: number) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.dataSourceList, current, size))
    return data.data?.records || []
}

// 检验insert语句
export const check_insert_sql = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.checkInsertSql, obj))
    return data.data
}

// 创建新工作流
export const add_work_flow = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.addWorkFlow, JSON.stringify(obj)))
    return data
}

// 获取库中表列表
export const get_tables = async (datasourceId: string, tableSchema: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getTables, datasourceId, tableSchema))
    return data.data
}

// 获取表字段数组，onlyCol:是否去除hive表中的序号与类型 0:id:int --> id
export const get_columns = async (datasourceId: string, tableName: string, onlyCol?: boolean) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getColumns, datasourceId, tableName))
    // 遍历原数组中的每个元素，使用split()方法将其按照:分割成一个数组。
    // 取这个新数组中第二个元素（索引为1），也就是两个冒号之间的值。
    // 将这个值存储到一个新的数组中。
    // 最后返回新的数组即可。
    return data.data.map((item) => {
        if (item.indexOf(':') === -1) {
            return item;
        } else {
            if (onlyCol) {
                const parts = item.split(':');
                return parts[1];
            } else {
                return item;
            }
        }
    });
}

// 获取dataXJobJson
export const build_datax_json = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.buildDataXJson, JSON.stringify(obj)))
    return data.data
}

// 创建采集任务
export const add_datax_job = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.addDataXJob, JSON.stringify(obj)))
    return data
}

// 创建采集调度任务
export const add_sched_task = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.addSchedTask, obj))
    return data
}

// 执行sql
export const exec_sql = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.execSql, obj))
    return data
}

// sql校验
export const sql_valid = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.sqlValid, obj))
    return data
}

// 创建表
export const create_table = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.createTable, JSON.stringify(obj)))
    return data
}

export const get_workflow_page = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getWorkflowPage, JSON.stringify(obj)))
    return data
}

export const get_cj_job_page = async (obj: CommonQueryParam) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getCjJobPage, JSON.stringify(obj)))
    return data
}

export const get_sched_job_page = async (current: number, size: number, blurry: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getSchedJobPage, current, size, blurry))
    return data
}
export const workflow_active = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.workflowActive, JSON.stringify(obj)))
    return data
}
export const cj_job_start = async (id: number | string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.cjJobStart, id))
    return data
}

export const cj_job_stop = async (id: number | string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.cjJobStop, id))
    return data
}

//采集任务执行
export const cj_job_run = async ({
                                     jobId,
                                     subsystemName
                                 }) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.cjJobRun, JSON.stringify({
        jobId,
        subsystemName
    })))
    return data
}

export const cj_job_delete = async (id: number | string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.cjJobDelete, id))
    return data
}

export const sched_job_delete = async (id: number | string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.schedJobDelete, id))
    return data
}

export const workflow_run = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.workflowRun, JSON.stringify(obj)))
    return data
}
export const workflow_delete = async (id: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.workflowDelete, id))
    return data
}

export type GetTablesInfoApiType = {
    size: number,
    page: number,
    sourceId: number,
    likeValue: string
}

export const get_tables_info = async (obj: GetTablesInfoApiType) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getTablesInfo, JSON.stringify(obj)))
    return data
}

export const table_preview = async (datasourceId: number, tableName: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.tablePreview, datasourceId, tableName))
    return data
}

export const table_delete = async (id: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.tableDelete, id))
    return data
}

export const get_cj_job_log = async (obj: CommonQueryParam) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getCjJobLog, JSON.stringify(obj)))
    return data
}

export const create_valid_config = async (obj: CommonQueryParam) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.createValidConfig, JSON.stringify(obj)))
    return data
}
