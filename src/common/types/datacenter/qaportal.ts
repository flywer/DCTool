// 质量门户

// 质检情况分页查询记录类型
export interface InspectionRecord {
    inspectionRecordId: string;
    sourceTableName: string;
    dbId: string;
    inspectionTime: string;
    orgName: string;
    totalRecordSum: number;
    wrongRecordSum: number;
    aimRecordSum: number;
    repairRecordSum: number;
    unRepairRecordSum: number;
    isProcessor: number;
}
