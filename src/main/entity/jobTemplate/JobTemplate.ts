import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

/**
 * 任务模板
 **/
@Entity()
export class JobTemplate {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'template_name'
    })
    templateName: string

    // 1:质检模板
    @Column({
        name: 'template_type'
    })
    templateType: number

    @Column({
        name: 'create_time',
        type: 'datetime'
    })
    createTime: Date

    @Column({
        name: 'update_time',
        type: 'datetime'
    })
    updateTime: Date
}
