import {DataLakeDataVolume} from "@main/entity/frontEnd/DataLakeDataVolume";
import {FrontEndDataVolume} from "@main/entity/frontEnd/FrontEndDataVolume";
import {ThemeBaseDataSourceCaseVolume} from "@main/entity/frontEnd/ThemeBaseDataSourceCaseVolume";
import {ThemeBaseDataVolume} from "@main/entity/frontEnd/ThemeBaseDataVolume";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_table_data = async (tableName: string, limitNum: number, cdTimeOrder: boolean) => {
    const {data} = await ipcInstance.send<string>(channels.front.getTableData, tableName, limitNum, cdTimeOrder)
    return data
}

export const get_FE_data_vol_by_depart_name_and_table_type = async (departName: string, tableType: string): Promise<FrontEndDataVolume> => {
    const {data} = await ipcInstance.send(channels.front.getFrontEndDataVolByDepartNameAndTableType, departName, tableType)
    return data
}

export const get_data_lake_data_vol_by_depart_name_and_table_type = async (projectId: string, tableType: string): Promise<DataLakeDataVolume> => {
    const {data} = await ipcInstance.send(channels.front.getDataLakeDataVolByDepartNameAndTableType, projectId, tableType)
    return data
}

export const get_theme_base_data_vol_by_depart_name_and_table_type = async (departName: string, tableType: string): Promise<ThemeBaseDataVolume> => {
    const {data} = await ipcInstance.send(channels.front.getThemeBaseDataVolByDepartNameAndTableType, departName, tableType)
    return data
}

export const get_theme_base_data_source_case_volume = async (): Promise<ThemeBaseDataSourceCaseVolume[]> => {
    const {data} = await ipcInstance.send(channels.front.getThemeBaseDataSourceCaseVolume)
    return data
}
