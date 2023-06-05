import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class TableSql {
    @PrimaryGeneratedColumn()
    id: number

    @Column({name: 'table_name'})
    tableName: string

    @Column()
    comment: string

    @Column({type: "longtext"})
    sql: string
}
