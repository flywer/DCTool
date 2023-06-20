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

    @Column({name: 'order_num'})
    orderNum: number
}
