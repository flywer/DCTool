import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class JobDetail {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'table_project_abbr',
        nullable: false
    })
    tableProjectAbbr: string

    @Column({
        name: 'table_abbr',
        nullable: false
    })
    tableAbbr: string

    @Column({
        name: 'basic_table',
        nullable: false
    })
    basicTable: boolean
}
