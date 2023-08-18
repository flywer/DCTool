import {InspectionDataStatType} from "@common/types";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const create_data_inps_stat = (dataSata: InspectionDataStatType[]) => {
    return ipcInstance.send<string>(channels.xlsx.createDataInpsStat, dataSata);
}
