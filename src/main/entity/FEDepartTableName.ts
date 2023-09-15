import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

/**
 * 前置机各单位表名信息
 **/
@Entity({
    name: 'fe_depart_table_name'
})
export class FEDepartTableName {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'depart_name',
        nullable: false,
        comment: '单位名称',
    })
    departName: string

    @Column({
        name: 'table_type',
        nullable: false,
        comment: '表类型',
    })
    tableType: string

    @Column({
        name: 'table_name',
        nullable: false,
        comment: '前置机表名',
    })
    tableName: string

    @Column({
        name: 'update_time',
        type: 'datetime',
        comment: '更新时间'
    })
    updateTime: Date
}

