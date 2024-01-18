import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

/**
 * 任务预览统计记录
 **/
@Entity()
export class JobOverviewStatRecord {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'job_prefix',
        type: "varchar",
        comment: '任务名前缀',
    })
    jobPrefix: string

    @Column({
        name: 'project_abbr',
        type: "varchar",
        comment: '项目名简称数组',
    })
    projectAbbr: string

    /**
     * 1:dataX;2:workflow
     **/
    @Column({
        name: 'job_type',
        type: "int",
        comment: '任务类型',
    })
    jobType: number

    @Column({
        name: 'total',
        type: "int",
        comment: '总数',
    })
    total: number

    @Column({
        name: 'normal',
        type: "int",
        comment: '启用数',
    })
    normal: number

    @Column({
        name: 'running',
        type: "int",
        comment: '运行中数',
    })
    running: number

    @Column({
        name: 'exception',
        type: "int",
        comment: '异常数',
    })
    exception: number


    @Column({
        name: 'no_feedback',
        type: "int",
        comment: '未反馈数',
    })
    noFeedback: number

    @Column({
        name: 'create_time',
        type: 'datetime',
        comment: '创建时间'
    })
    createTime: Date
}
