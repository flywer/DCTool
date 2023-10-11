// 数据中台分页查询返回结果
export type DCPageResult<T> = {
    code: number;
    message: string;
    success: boolean;
    data: {
        page: number;
        size: number;
        orders: any;
        total: number;
        records: T[]
    },
    timestamp: number
}

// 数据中台通用型查询返回结果
export type DCCommonResult<T> = {
    code: number;
    message: string;
    success: boolean;
    data: T,
    timestamp: number
}

// 登陆时用户信息
export  type UserType = {
    username: string;
    user: {
        id: string;
        username: string;
        name: string;
        type: string;
        gender: any;
        creditType: string;
        creditNo: string;
        source: string;
        phone: string;
        email: string;
        duty: any;
        avatar: any;
        leader: any;
        tifUserId: any;
        unit: {
            id: string;
            name: string;
            code: string;
            area: string;
            level: string;
            usci: any;
        };
        depts: {
            0: {
                id: string;
                name: string;
                code: string;
                area: string;
                level: string;
                usci: any;
            };
        };
        roles: {
            0: {
                id: string;
                systemList: {
                    0: {
                        id: string;
                        name: string;
                        code: string;
                        area: any;
                    };
                    1: {
                        id: string;
                        name: string;
                        code: string;
                        area: string;
                    };
                    2: {
                        id: string;
                        name: string;
                        code: string;
                        area: string;
                    };
                };
                category: string;
                type: string;
                name: string;
                code: string;
                level: any;
                area: string;
                dataPerms: any;
                dataConfig: string;
            };
        };
        onLoan: any;
        tempPost: any;
        onSite: any;
        expireTime: any;
    };
    loginSource: any;
    isGuest: boolean;
    isVisitor: boolean;
    functionPerms: {
        0: string;
        1: string;
    };
    dataPerms: {
        0: string;
        1: string;
        2: string;
    };
    joinUserIds: any;
    roles: {
        0: string;
    };
};

// region 可视化建表

// 可视化建表中分页获取的表信息
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
    isTemp?:boolean
}

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

// endregion

export type DictItemType = {
    id: string;
    pid: any;
    level: number;
    dictId: string;
    label: string;
    value: string;
    dictSort: number;
    status: string;
    subCount: any;
    children: any;
}
