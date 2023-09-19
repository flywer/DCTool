import {Column, Entity} from "typeorm";

@Entity({
    name: 'xzzf_sjtj_data_lake'
})
export class DataLakeDataVolume {

    @Column({
        name: 'id',
        nullable: false,
        comment: '主键ID',
        length: 36,
        primary: true
    })
    id: string

    @Column({
        name: 'depart_name',
        comment: '单位名称',
    })
    departName: string

    @Column({
        name: 'table_type',
        comment: '数据源类型',
    })
    tableType: string

    @Column({
        name: 'data_count',
        comment: '数据量',
    })
    dataCount: string

    @Column({
        name: 'update_time',
        comment: '统计时间',
    })
    updateTime: Date
}
