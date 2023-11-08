import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

// 模板结构表与任务之间的关联关系
@Entity()
export class TemplateTableJobRel {
    @PrimaryGeneratedColumn()
    id: number

    // 结构表ID
    @Column({
        name: 'struct_table_id',
        type: 'int'
    })
    structTableId: number

    // 工作流任务ID
    @Column({
        name: 'job_id',
        type: 'varchar'
    })
    jobId: string
}
