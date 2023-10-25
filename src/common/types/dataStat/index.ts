// 【全省部门数据量统计】数据导出model类型
export  type DepartDataVolExcelModel = {
    departName: string, // 部门名称
    tableType: string, // 数据元分类号
    tableComment: string, // 编目名称
    feTableName: string, // 前置机表名
    feDataCount: string, // 累计报送数据量
    feDataStatTime: string,// 累计报送数据量统计时间
    dataLakeDataCount: string, // 数据湖数据量
    dataLakeDataStatTime: string,// 数据湖数据量统计时间
    themeBaseDataCount: string, // 主题库数据量
    themeBaseDataStatTime: string,// 主题库数据量统计时间
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
