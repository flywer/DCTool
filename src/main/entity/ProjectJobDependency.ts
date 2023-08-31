import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

/**
 * 项目间任务依赖
 **/
@Entity()
export class ProjectJobDependency {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'source',
        nullable: false
    })
    source: string

    @Column({
        name: 'target',
        nullable: false
    })
    target: string
}
