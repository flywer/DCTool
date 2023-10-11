import {
    DCCommonResult,
    DCPageResult,
    DictItemType,
    FieldType,
    PageTableType,
    TableInfoType
} from "@common/datacenter.types";
import {CommonQueryParam, DataXJobQueryParams, JobTemplateType, PageVo} from "@common/types";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_user = async () => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getUser))
    return data.data
}

// 获取项目列表
export const get_job_project_list_all = async () => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.jobProjectListAll))
    return data.data
}

export const get_job_project_list_by_page = async (param: PageVo) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getJobProjectListByPage, param))
    return data.data
}

export const get_job_project_by_id = async (id: string | number) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getProject, id))
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

export const get_all_datasource = async (datasource: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getAllDataSource, datasource))
    return data.data || []
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
    if (data.code == -1) {
        return null
    } else {
        return data.data.map((item: string) => {
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

}

// 获取dataXJobJson
export const build_datax_json = async (obj: object) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.buildDataXJson, JSON.stringify(obj)))
    return data.data
}

// 创建采集任务
export const add_datax_job = async (obj: object) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.addDataXJob, JSON.stringify(obj)))
    return data
}

export const update_datax_job = async (obj: JobTemplateType) => {
    const {data} = (await ipcInstance.send(channels.datacenter.updateDataXJob, obj))
    return data
}

// 创建采集调度任务
export const add_sched_task = async (obj: object) => {
    const {data} = (await ipcInstance.send<object>(channels.datacenter.addSchedTask, obj))
    return data
}

export const update_sched_job = async (obj: any) => {
    const {data} = (await ipcInstance.send(channels.datacenter.updateSchedJob, obj))
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

export const get_workflow_page = async (obj: {
    page: number,
    size: number,
    status?: number | string,
    procName?: string
}) => {
    const {data} = (await ipcInstance.send(channels.datacenter.getWorkflowPage, obj))
    return data
}

export const get_cj_job_page = async (obj: DataXJobQueryParams) => {
    const {data} = (await ipcInstance.send(channels.datacenter.getCjJobPage, obj))
    return data
}

export const get_sched_job_page = async (obj: DataXJobQueryParams) => {
    const {data} = (await ipcInstance.send(channels.datacenter.getSchedJobPage, obj))
    return data
}

//   type: '01' : '启用', '02' : '停用'
export const workflow_active = async (obj: {
    id: string,
    type: '01' | '02'
}) => {
    const {data} = (await ipcInstance.send(channels.datacenter.workflowActive, obj))
    return data
}
export const datax_job_start = async (id: number | string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.dataxJobStart, id))
    return data
}

export const datax_job_stop = async (id: number | string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.dataxJobStop, id))
    return data
}

//采集任务执行
export const datax_job_run = async ({
                                        jobId,
                                        subsystemName
                                    }) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.dataxJobRun, JSON.stringify({
        jobId,
        subsystemName
    })))
    return data
}

export const datax_job_delete = async (id: number | string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.dataxJobDelete, id))
    return data
}

export const sched_job_delete = async (id: number | string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.schedJobDelete, id))
    return data
}

export const workflow_run = async (obj: any) => {
    const {data} = (await ipcInstance.send(channels.datacenter.workflowRun, obj))
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

export const get_tables_info_page = async (obj: GetTablesInfoApiType): Promise<DCPageResult<PageTableType>> => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getTablesInfo, obj))
    return data
}

export const get_table_info_by_id = async (tableId: string): Promise<DCCommonResult<TableInfoType>> => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getTableInfoById, tableId))
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

export const get_datax_job_log = async (obj: CommonQueryParam) => {
    const {data} = (await ipcInstance.send(channels.datacenter.getDataxJobLog, obj))
    return data
}

export const create_valid_config = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.createValidConfig, JSON.stringify(obj)))
    return data
}

export const get_valid_config_page = async (likeName: string) => {
    const params = {
        page: 1,
        size: 1,
        likeName: likeName,
        orders: [
            {
                asc: true,
                column: "table_name"
            }
        ],
        likeType: 0
    }
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getValidConfigPage, JSON.stringify(params)))
    return data
}

export const get_workflow_log = async (id: string, size: number, page: number) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.workflowLog, id, size, page))
    return data
}

export const workflow_rerun = async (id: string, type: number) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.workflowRerun, id, type))
    return data
}

export const gte_usrc_org_tree = async () => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getUsrcOrgTree))
    return data
}

type GetDictPageType = {
    codeSetName: string
    page: number
    size: number
    state?: 0
    type?: 4
}

export const get_dict_by_name = async (obj: GetDictPageType) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getDictByName, JSON.stringify(obj)))
    return data
}
export const get_dict_list_by_id = async (id: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getDictListById, id))
    return data
}

export const insp_home_list = async () => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.inspHomeList))
    return data
}

type GetInspRecordPageType = {
    page: number,
    size: number,
    orgIds: string[],
    inspTime: string[],
    likeName: string,
    likeType?: 1
}

export const get_inps_record_page = async (obj: GetInspRecordPageType) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getInpsRecordPage, JSON.stringify(obj)))
    return data
}

export const get_workflow = async (jobId: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getWorkflow, jobId))
    return data
}

export const update_workflow = async (jobId: string, params: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.updateWorkflow, jobId, JSON.stringify(params)))
    return data
}

export const get_dataXJob = async (jobId: string): Promise<{
    code: number,
    data: {
        jobTemplate: JobTemplateType
    },
    msg: string
}> => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getDataXJob, jobId))
    return data
}

/**
 * @param projectId 项目ID
 * @param procName 任务名称
 **/
export const get_workflow_list_by_project_id = async (projectId: string, procName?: string) => {
    const {data} = (await ipcInstance.send(channels.datacenter.getWorkflowListByProjectId, projectId, procName))
    return data
}

export const update_is_processed = async (id: string, isProcessed: number) => {
    const {data} = (await ipcInstance.send(channels.datacenter.updateIsProcessed, id, isProcessed))
    return data
}

export const get_sched_job_by_id = async (id: string | number) => {
    const {data} = (await ipcInstance.send(channels.datacenter.getSchedJobById, id))
    return data
}

export const get_table_store_format = async (): Promise<DCCommonResult<DictItemType[]>> => {
    const {data} = (await ipcInstance.send(channels.datacenter.getTableStoreFormat))
    return data
}

export const get_table_field_type = async (type: 'tbds-hive' | 'mysql'): Promise<DCCommonResult<FieldType[]>> => {
    const {data} = (await ipcInstance.send(channels.datacenter.getTableFieldType, type))
    return data
}

export const update_table = async (params: string): Promise<DCCommonResult<any>> => {
    const {data} = (await ipcInstance.send(channels.datacenter.updateTable, params))
    return data
}
