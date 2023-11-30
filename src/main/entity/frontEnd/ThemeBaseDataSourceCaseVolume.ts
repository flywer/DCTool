import {Column, Entity} from "typeorm";

/**
 * 主题库上报单位案件量统计表
 **/
@Entity({
    name: 'xzzf_sjtj_theme_base_data_source_case_volume'
})
export class ThemeBaseDataSourceCaseVolume {

    @Column({
        name: 'id',
        nullable: false,
        comment: '主键ID',
        length: 36,
        primary: true
    })
    id: string

    @Column({
        name: 'table_type',
        comment: '数据元类型',
    })
    tableType: string

    @Column({
        name: 'volume',
        comment: '案件量',
    })
    volume: string

    @Column({
        name: 'depart_name',
        comment: '数据源单位名称',
    })
    departName: string

    @Column({
        name: 'area_code',
        comment: '单位区划',
    })
    areaCode: string

    @Column({
        name: 'create_time',
        comment: '创建时间',
    })
    createTime: Date
}
