import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

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
    return data.data.records
}

// 检验insert语句
export const check_insert_sql = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.checkInsertSql, obj))
    return data.data
}

// 创建新工作流
export const add_work_flow = async (obj: any) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.addWorkFlow, obj))
    return data
}

// 获取表字段数组
export const get_tables = async (datasourceId: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getTables, datasourceId))
    return data.data
}

// 获取表字段数组
export const get_columns = async (datasourceId: string, tableName: string) => {
    const {data} = (await ipcInstance.send<string>(channels.datacenter.getColumns, datasourceId, tableName))
    // 遍历原数组中的每个元素，使用split()方法将其按照:分割成一个数组。
    // 取这个新数组中第二个元素（索引为1），也就是两个冒号之间的值。
    // 将这个值存储到一个新的数组中。
    // 最后返回新的数组即可。
    return data.data.map((item) => {
        if (item.indexOf(':') === -1) {
            return item.toLowerCase();
        }

        const parts = item.split(':');
        return parts[1].toLowerCase();
    });
}
