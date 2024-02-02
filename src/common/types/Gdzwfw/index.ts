export type ZwfwOrgNode = {
    hall: ZwfwDepartment[],
    department: ZwfwDepartment[],
    currentArr: ZwfwDepartment[]
}

export type ZwfwDepartment = {
    id: number,
    SORT: number,
    responsibility_list: string,
    dept_type: any,
    credit: string,
    town: string,
    city: string,
    cat_name: string,
    expiry_date: string,
    county: string,
    data_src_id: number,
    province: string,
    SITES_URL: string,
    DISPLAY: string,
    ORGSNAME: string, // 单位简称
    ORGNAME: string,   // 单位全称
    ORGNUMBER: string,
    ORGAREACODE: string,
    ORGTYPE: string,
    ORGUPARACODE: string,
}

export type ZwfwOrgTaskType = {
    // 行政许可
    AL: boolean,
    // 行政处罚
    AP: boolean,
    // 行政强制
    AF: boolean,
    // 行政征收
    AE: boolean,
    // 行政给付
    AG: boolean,
    // 行政检查
    AC: boolean,
    // 行政确认
    ACQ: boolean,
    // 行政奖励
    AA: boolean,
    // 行政裁决
    AFJ: boolean
}

export enum ZwfwTaskType {
    // 行政许可
    AL = '01',
    // 行政处罚
    AP = '02',
    // 行政强制
    AF = '03',
    // 行政征收
    AE = '04',
    // 行政给付
    AG = '05',
    // 行政检查
    AC = '06',
    // 行政确认
    ACQ = '07',
    // 行政奖励
    AA = '08',
    // 行政裁决
    AFJ = '09'
}

export type ZwfwOrgTask = {
    // 部门名称
    orgName: string,
    // 部门区划
    orgAreaCode: string,
    // 省名
    province: string,
    // 地市名
    city: string,
    // 区县名
    county: string,
    // 实施清单详情
    taskType: ZwfwOrgTaskType
}
