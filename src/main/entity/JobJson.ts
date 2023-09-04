import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class JobJson {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'table_name',
        unique: true
    })
    tableName: string

    // 单表融合JSON
    @Column({
        type: "longtext",
        name: 'rh1_json',
        comment: '单表融合JSON',
        nullable: true
    })
    rh1Json: string

    @Column({
        name: 'rh1_update_time',
        type: 'datetime',
        comment: '单表融合JSON变更时间'
    })
    rh1UpdateTime: Date

    // 多表融合JSON
    @Column({
        type: "longtext",
        name: 'rh2_json',
        comment: '多表融合JSON',
        nullable: true
    })
    rh2Json: string

    @Column({
        type: "longtext",
        name: 'zj_json',
        nullable: true
    })
    zjJson: string

    @Column({
        name: 'zj_update_time',
        type: 'datetime',
        comment: '质检JSON变更时间'
    })
    zjUpdateTime: Date

    @Column({
        type: "longtext",
        name: 'simp_zj_json',
        comment: '简化版质检JSON',
        nullable: true
    })
    simpZjJson: string

    @Column({
        name: 'simp_zj_update_time',
        type: 'datetime',
        comment: '简化版质检JSON变更时间'
    })
    simpZjUpdateTime: Date

    @Column({name: 'order_num'})
    orderNum: number
}
