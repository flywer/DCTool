import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

/**
 * 部门编目挂接情况记录表
 **/
@Entity()
export class DepartCatalogHookRecord {
    @PrimaryGeneratedColumn()
    id: number

    // 地市名称
    @Column({
        name: 'city_name',
        nullable: false,
        type: 'varchar',
        comment: '地市名称'
    })
    cityName: string

    // 区县名称
    @Column({
        name: 'district_name',
        type: 'varchar',
        comment: '区县名称'
    })
    districtName: string

    // 镇街名称
    @Column({
        name: 'town_name',
        type: 'varchar',
        comment: '镇街名称'
    })
    townName: string

    // 部门名称
    @Column({
        name: 'depart_name',
        type: 'varchar',
        comment: '部门名称'
    })
    departName: string

    // 行政许可
    @Column({
        name: 'AL',
        type: 'int',
        comment: '行政许可'
    })
    AL: number

    // 行政征收
    @Column({
        name: 'AE',
        type: 'int',
        comment: '行政征收'
    })
    AE: number

    // 行政检查
    @Column({
        name: 'AC',
        type: 'int',
        comment: '行政检查'
    })
    AC: number

    // 行政处罚
    @Column({
        name: 'AP',
        type: 'int',
        comment: '行政处罚'
    })
    AP: number

    // 行政强制
    @Column({
        name: 'AF',
        type: 'int',
        comment: '行政强制'
    })
    AF: number

    @Column({
        name: 'update_time',
        type: 'datetime',
        comment: '更新时间'
    })
    updateTime: Date
}

/**
 * 编目挂接类型
 **/
export enum CatalogHookType {
    // 无职权
    noAuthority,
    // 未编目
    noCatalog,
    // 已编目无数据
    catalogedNoData,
    // 已编目已挂接
    hooked,
    // 使用国垂系统
    nationalVertical,
    // 使用省垂系统
    provincialVertical,
    // 粤执法
    yzf,
    // 未确定
    undefined
}
