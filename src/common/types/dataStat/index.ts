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

//【主题库案件数量统计】
// 编目挂接信息数据
export type CatalogHookData = {
    cityName: string,
    AL: FieldDepart,
    AE: FieldDepart,
    AC: FieldDepart,
    AP: FieldDepart,
    AF: FieldDepart
}

export type FieldDepart = {
    nationalVertical: string[],
    provincialVertical: string[],
    yzf: string[],
    other: string[]
}

export type DepartCaseVolumeExcelModel = {
    cityName: string, // 地市名称
    nv: number, // 国垂
    pv: number, // 省垂
    yzf: number, // 粤执法
    other: number // 其他
}
