import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({
    name: 'xzzf_sjtj_data_lake_own_depart_case_volume'
})
export class DataLakeOwnDepartCaseVolume {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'table_type',
        comment: '数据元类型',
    })
    tableType: string

    @Column({
        name: 'own_depart_name',
        comment: '数据所属单位名称',
    })
    ownDepartName: string

    @Column({
        name: 'subject_name',
        comment: '执法主体名称',
    })
    subjectName: string

    @Column({
        name: 'volume',
        comment: '案件量',
    })
    volume: number

    @Column({
        name: 'create_time',
        comment: '统计时间',
    })
    createTime: Date
}
