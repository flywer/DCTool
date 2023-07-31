import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class ProjectInfo {

    @PrimaryGeneratedColumn()
    id: number

    @Column({name: 'project_id'})
    projectId: string

    @Column({name: 'project_name'})
    projectName: string

    @Column({name: 'project_abbr'})
    projectAbbr: string

    @Column({name: 'table_abbr'})
    tableAbbr: string

    @Column({name: 'cj_cron'})
    cjCron: string
}
