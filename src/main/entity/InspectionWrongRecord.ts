import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class InspectionWrongRecord {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'table_name',
        type: 'varchar',
        comment: '质检记录ID'
    })
    tableName: string

    @Column({
        name: 'inspection_record_id',
        type: 'varchar',
        comment: '质检记录ID'
    })
    inspectionRecordId: string

    @Column({
        name: 'catalog_depart_name',
        type: 'varchar',
        comment: '数据编目挂接单位名称'
    })
    catalogDepartName: string

    @Column({
        name: 'own_depart_name',
        type: 'varchar',
        comment: '质检情况所属单位名称'
    })
    ownDepartName: string

    @Column({
        name: 'wrong_field_name',
        type: 'varchar',
        comment: '问题字段名'
    })
    wrongFieldName: string

    @Column({
        name: 'wrong_reason',
        type: 'varchar',
        comment: '问题原因'
    })
    wrongReason: string

    @Column({
        name: 'p_keys',
        type: 'text',
        comment: '主键ID数组'
    })
    pKeys: string

    @Column({
        name: 'count',
        type: 'int',
        comment: '问题数据量'
    })
    count: number

    @Column({
        name: 'create_time',
        type: 'datetime',
        comment: '创建时间'
    })
    createTime: Date
}
