import {ipcInstance} from "@render/plugins";
import {channels} from "@render/api/channels";
import {InspectionWrongRecord} from "@main/entity/InspectionWrongRecord";

export const find_wrong_record_by_inspection_record_id = async (inspectionRecordId: string): Promise<InspectionWrongRecord[]> => {
    const {data} = (await ipcInstance.send<string>(channels.inspectionWrongRecord.findByInspectionRecordId, inspectionRecordId))
    return data
}


export const save_wrong_records = async (records: Partial<InspectionWrongRecord[]>): Promise<InspectionWrongRecord> => {
    const {data} = (await ipcInstance.send<string>(channels.inspectionWrongRecord.saveWrongRecord, records))
    return data
}

