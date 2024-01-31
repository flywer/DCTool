import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

/**
 * 任务树节点对应的任务列表缓存
 **/

@Entity()
export class JobTableItemCache {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        comment: '任务树节点Key',
        nullable: false,
    })
    treeNodeKey: string

    @Column({
        comment: '任务ID',
        nullable: true
    })
    jobId: string

    @Column({
        comment: '任务名',
        nullable: false,
    })
    jobName: string

    @Column({
        comment: '任务类型',
        nullable: true
    })
    jobType: string

    @Column({
        type: 'text',
        comment: '任务信息项JSON字符串'
    })
    job: string

    @Column({
        name: 'create_time',
        type: 'datetime',
        nullable: false,
        comment: '创建时间'
    })
    createTime: Date

    @Column({
        name: 'update_time',
        type: 'datetime',
        nullable: false,
        comment: '变更时间'
    })
    updateTime: Date
}
