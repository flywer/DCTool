import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({
    name: 'sjtj_ods_data_volume'
})
export class OdsDataVolume {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'project_id',
        comment: '上报单位归集项目ID标识',
    })
    projectId: string

    @Column({
        name: 'depart_name',
        comment: '上报单位名称',
    })
    departName: string

    @Column({
        name: 'depart_area',
        comment: '单位区划',
        type: 'int'
    })
    departArea: 1 | 2

    @Column({
        name: 'table_type',
        comment: '数据元类型',
    })
    tableType: string

    @Column({
        name: 'raw_data_volume',
        comment: '原始数据量（根据业务主键ID、批次号去重）',
    })
    rawDataVolume: number

    @Column({
        name: 'distinct_data_volume',
        comment: '推送数据量（根据业务主键ID去重）',
    })
    distinctDataVolume: number

    @Column({
        name: 'create_time',
        type: 'datetime',
        comment: '统计时间'
    })
    createTime: Date
}
