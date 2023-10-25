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



// 字典值类型
export type DC_DictItem = {
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
