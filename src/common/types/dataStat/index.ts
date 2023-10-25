// 【全省部门数据量统计】数据导出model类型
export  type DepartDataVolExcelModel = {
    departName: string,
    tableType: string,
    tableComment: string,
    feTableName: string,
    feDataCount: string,
    dataLakeDataCount: string,
    themeBaseDataCount: string
}

// 【质检情况统计】数据导出model类型
export type InspectionDataExcelModel = {
    orgName: string,
    tableComment: string,
    tableName: string,
    totalRecordSum: number,
    aimRecordSum: number,
    wrongRecordSum: number,
    inspectionTime: string
}
