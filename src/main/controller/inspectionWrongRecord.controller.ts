import {AppDataSource} from "@main/dataSource/data-source";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {InspectionWrongRecord} from "@main/entity/InspectionWrongRecord";

@Controller()
export class InspectionWrongRecordController {
    constructor() {
    }

    @IpcHandle(channels.inspectionWrongRecord.findByInspectionRecordId)
    public handleGetProjectInfo(inspectionRecordId: string) {
        return AppDataSource.getRepository(InspectionWrongRecord).findBy({
            inspectionRecordId: inspectionRecordId
        })
    }

    @IpcHandle(channels.inspectionWrongRecord.saveWrongRecord)
    public handleSaveWrongRecord(records: InspectionWrongRecord[]) {
        return AppDataSource.getRepository(InspectionWrongRecord).save(records)
    }
}
