import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class GdsztkDict {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'bz_id',
        nullable: false,
        comment: '业务主键ID',
    })
    bzId: string

    @Column({
        name: 'dict_name',
        nullable: false,
        comment: '代码名称'
    })
    dictName: string

    @Column({
        name: 'dict_code',
        comment: '代码值'
    })
    dictCode: string

    @Column({
        name: 'parent_id',
        comment: '父级ID'
    })
    parentId: string

    @Column({
        name: 'order_num',
        comment: '排序号'
    })
    orderNum: number

    @Column({
        name: 'add_time',
        type: 'datetime',
        nullable: false,
        comment: '创建时间'
    })
    addTime: string

    @Column({
        name: 'cd_time',
        type: 'datetime',
        nullable: false,
        comment: '变更时间'
    })
    cdTime: string

    @Column({
        name: 'cd_operation',
        nullable: false,
        comment: '增量标识,I:新增,U:修改,D:删除'
    })
    cdOperation: string

    @Column({
        name: 'cd_batch',
        nullable: false,
        comment: '批次号'
    })
    cdBatch: string
}
