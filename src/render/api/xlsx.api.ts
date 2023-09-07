import {InspectionDataStatType} from "@common/types";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const create_data_inps_stat = (dataSata: InspectionDataStatType[]) => {
    return ipcInstance.send<string>(channels.xlsx.createDataInpsStat, dataSata)
}

export const generate_insert_statements = async (tableName:string) => {
    const {data} = (await ipcInstance.send<string>(channels.xlsx.generateInsertStatements,tableName))
    return data
}
