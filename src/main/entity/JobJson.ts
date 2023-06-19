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

    @Column({
        type: "longtext",
        name: 'rh_json',
        nullable: true
    })
    rhJson: string

    @Column({
        type: "longtext",
        name: 'zj_json',
        nullable: true
    })
    zjJson: string

    @Column({name: 'order_num'})
    orderNum: number
}
