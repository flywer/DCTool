import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

/**
 * 模板所含结构表名
 **/
@Entity()
export class TemplateStructTable {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'table_name',
        type: 'varchar'
    })
    tableName: string

    // 表领域
    @Column({
        name: 'field_type',
        type: 'int'
    })
    fieldType: StructTableFieldType

    @Column({
        name: 'template_id',
        type: 'int'
    })
    templateId: number

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

export enum StructTableFieldType {
    // 法律法规 G
    LAR,
    // 执法和监督部门 Z
    LASD,
    // 执法和监督人员 Y
    LASS,
    // “互联网+监管” F2
    IAR,
    // 行政职权类事项
    GEA,
    // “双随机、一公开”事项
    DRPO,
    // 执法对象
    TLO,
    // 行政许可
    AL,
    // 行政处罚
    AP,
    // 行政征收
    AE,
    // 行政征用
    AR,
    // 行政强制
    AF,
    // 行政检查
    AC,
    // 救济信息
    RI,
    // 监督投诉
    RC,
    // 数据对账
    DRA
}
