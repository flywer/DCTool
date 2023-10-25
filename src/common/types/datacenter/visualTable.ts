// 可视化建表

// [可视化建表] 分页获取 表信息
export type PageTableType = {
    id: string;
    createBy: string;
    updateBy: string;
    createTime: string;
    updateTime: string;
    delFlag: number;
    sourceId: string;
    sourceName: string;
    dataTierCode: string;
    dataTierName: string;
    tableName: string;
    tableComment: string;
    storageFormat: string;
    lifeCycle: string;
    tableCreateTime: string;
    namedJson: string;
    dbType: string;
    ddlSql: string;
};

// 表主要信息
export type TableInfoType = {
    id: string;
    sourceId: string;
    sourceName: string;
    dataTierCode: string;
    dataTierName: string;
    tableName: string;
    tableComment: string;
    storageFormat: string;
    lifeCycle: string;
    tableCreateTime: string;
    namedJson: string;
    dbType: string;
    datamodelTableFieldsVoList: TableFieldType[],
    ddlSql: string
}

// 表字段信息
export  type TableFieldType = {
    id: string;
    fieldOldName?: string;
    // 名称
    fieldName: string;
    // 数据类型
    fieldType: string;
    fieldSize: number;
    // 注释
    fieldDescribe?: string;
    fieldPrecision?: any;
    //是否必填  0:可为空；1:不可为空
    emptyFlag: number;
    keyFlag: number;
    tableId: string;
    defaultValue?: any;

    emptyFlagChecked?: boolean
    isTemp?: boolean
}

// 字段值类型
export type FieldType = {
    id: string;
    createBy: any;
    updateBy?: any;
    createTime: any;
    updateTime?: any;
    delFlag: number;
    sourceType: string;
    name: string;
    sizeFlag: number;
    sizeMax: any;
    precisionFlag: number;
    dataType: string;
};
