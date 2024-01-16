import {AppDataSource} from "@main/dataSource/data-source";
import {JobDetail} from "@main/entity/JobDetail";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {InspectionWrongRecord} from "@main/entity/InspectionWrongRecord";
import {ProjectInfo} from "@main/entity/ProjectInfo";

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
