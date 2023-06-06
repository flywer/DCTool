import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class JobJson {
    @PrimaryGeneratedColumn()
    id: number

    @Column({name: 'table_name'})
    tableName: string

    @Column({
        type: "longtext",
        name: 'rh_json',
        nullable: true
    })
    rhJson: string
}
