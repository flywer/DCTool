import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

/**
 * 字段质检规则
 **/
@Entity()
export class FieldInspectionRule {

    @PrimaryGeneratedColumn()
    id: number

    // 字段名称
    @Column({
        name: 'field_name',
        type: 'varchar'
    })
    fieldName: string

    // 字段注释
    @Column({
        name: 'field_comment',
        type: 'varchar'
    })
    fieldComment: string

    // 规则类型（1：自定义；2：引用其他规则）
    @Column({
        name: 'rule_type',
        type: 'int'
    })
    ruleType: number

    // 结构表ID
    @Column({
        name: 'table_id',
        type: 'int'
    })
    tableId: number

    // 引用的规则ID
    @Column({
        name: 'reference_rule_id',
        type: 'int'
    })
    referenceRuleId: number

    // 自定义规则：规则JSON字符串
    @Column({
        name: 'rule_list',
        type: 'varchar'
    })
    ruleList: string

    // 排序号
    @Column({
        name: 'sort_num',
        type: 'int'
    })
    sortNum: number

    // 是否启用
    @Column({
        name: 'enabled',
        type: 'int'
    })
    enabled: number

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
