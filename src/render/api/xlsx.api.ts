import {
    ProvincialDepartCaseVolumeExcelModel,
    DepartDataVolExcelModel,
    InspectionDataExcelModel,
    CityDepartCaseVolumeExcelModel, DataLakeOwnDepartCaseVolumeExcelModel
} from "@common/types/dataStat";
import {ThemeBaseDataSourceCaseVolume} from "@main/entity/frontEnd/ThemeBaseDataSourceCaseVolume";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const create_data_inps_stat = (dataSata: InspectionDataExcelModel[]) => {
    return ipcInstance.send<string>(channels.xlsx.createDataInpsStat, dataSata)
}

export const generate_insert_statements = async (tableName: string) => {
    const {data} = (await ipcInstance.send<string>(channels.xlsx.generateInsertStatements, tableName))
    return data
}

export const create_depart_data_vol_excel = async (excelData: {
    basicData: DepartDataVolExcelModel[],
    actionData: DepartDataVolExcelModel[],
}) => {
    const {data} = (await ipcInstance.send<string>(channels.xlsx.createDepartDataVolExcel, excelData))
    return data
}

export const create_depart_case_volume_excel = async (excelData: {
    provincialData: ProvincialDepartCaseVolumeExcelModel[],
    cityData: CityDepartCaseVolumeExcelModel[]
}) => {
    const {data} = await ipcInstance.send(channels.xlsx.createDepartCaseVolumeExcel, excelData)
    return data
}

export const export_data_source_depart_case_volume = async (provincialData: ThemeBaseDataSourceCaseVolume[], cityData: ThemeBaseDataSourceCaseVolume[]) => {
    const {data} = await ipcInstance.send(channels.xlsx.exportDataSourceDepartCaseVolume, provincialData, cityData)
    return data
}

export const export_data_lake_own_depart_case_volume = async (model: DataLakeOwnDepartCaseVolumeExcelModel[]) => {
    const {data} = await ipcInstance.send(channels.xlsx.exportDataLakeOwnDepartCaseVolume, model)
    return data
}
