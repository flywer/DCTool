import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class PreDatabase {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'depart_name',
        unique: true
    })
    departName: string

    @Column({
        name: 'table_info_json',
        type: "longtext"
    })
    tableInfoJson: string
}
