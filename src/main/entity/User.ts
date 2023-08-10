import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true,
        comment: '账号',
    })
    account: string

    @Column({
        comment: '密码',
    })
    password: string

    @Column({
        name: 'user_name',
        comment: '用户名'
    })
    userName: string

    @Column({
        comment: '辅助工具激活码'
    })
    cdk: string

    @Column({
        name: 'dc_token',
        comment: '数广中台Token'
    })
    dcToken: string

    @Column({
        name: 'is_active',
        comment: '是否启用'
    })
    isActive: number

    @Column({
        name: 'create_time',
        type: 'datetime',
        comment: '创建时间'
    })
    createTime: string

}
