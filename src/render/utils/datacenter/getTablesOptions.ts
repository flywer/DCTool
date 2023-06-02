import {get_tables} from "@render/api/datacenter";

export const getTablesOptions = async (dataSourceId: string, tableSchema?: string) => {
    const tables = await get_tables(dataSourceId, tableSchema || '')
    return tables?.map((item => ({
        label: item,
        value: item
    })) || []
    )
}
