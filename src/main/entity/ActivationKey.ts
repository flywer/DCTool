import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class ActivationKey {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        comment: '辅助工具激活码'
    })
    cdk: string

    @Column({
        name: 'expiration_date',
        comment: '有效期（天数）'
    })
    expirationDate: number

    @Column({
        name: 'is_used',
        comment: '是否已使用'
    })
    isUsed: number
}
