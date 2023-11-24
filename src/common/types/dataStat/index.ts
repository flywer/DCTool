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
    departCount: number,
    AL: FieldDepart, // 行政许可
    AE: FieldDepart, // 行政征收
    AC: FieldDepart, // 行政检查
    AP: FieldDepart, // 行政处罚
    AF: FieldDepart  // 行政强制
}

export type FieldDepart = {
    nationalVertical: string[], // 国垂系统 4
    provincialVertical: string[], // 省垂系统 5
    yzf: string[], // 粤执法系统 6
    citySystem: string[], //市自建系统 1，2，3
    noSystem: string[], // 无系统
    noData: string[] // 无数据 0,7
}

export type ProvincialDepartCaseVolumeExcelModel = {
    cityName: string, // 省直名称
    nv: number, // 国垂
    pv: number, // 省垂
    yzf: number, // 粤执法
    other: number // 其他
}

export class CityDepartCaseVolumeExcelModel {
    cityName: string // 地市名称
    departCount: number
    caseTotalVolume: number
    AL: NoYzfStatInfo
    AE: NoYzfStatInfo
    AR: NoYzfStatInfo // 行政征用
    yzf: {
        AC: SystemStatsInfo,
        AP: SystemStatsInfo,
        AF: SystemStatsInfo,
    }
    AC: NoYzfStatInfo
    AP: NoYzfStatInfo
    AF: NoYzfStatInfo
}

type NoYzfStatInfo = {
    // 国垂
    nv: SystemStatsInfo,
    // 省垂
    pv: SystemStatsInfo,
    // 市自建系统
    citySystem: SystemStatsInfo,
    // 无系统
    noSystem: SystemStatsInfo,
    // 无数据
    noData: SystemStatsInfo,
}

// 系统统计信息
type SystemStatsInfo = {
    departCount: number,
    caseVolume: number
}
