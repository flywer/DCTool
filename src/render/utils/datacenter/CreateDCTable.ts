import {create_table, get_tables_info_page, table_delete} from "@render/api/datacenter.api";
import {format} from "sql-formatter";

export class CreateDCTable {
    /**
     * @param tableName 表名
     * @param tableSql 表定义sql
     * @param hasOptCol 是否需要opt字段
     **/
    public static async createTable(tableName: string, tableSql: string, hasOptCol: boolean) {
        let paramsJson = {
            sourceId: '6',
            dbType: "tbds-hive",
            sourceName: "数据中台（TBDS）",
            dataTierCode: "SJTZ",
            dataTierName: "数据中台",
            namedJson: '',
            datamodelTableFieldsVoList: [
                {
                    dataType: "",
                    fieldName: "",
                    fieldDescribe: "",
                    fieldSize: "",
                    fieldPrecision: "",
                    emptyFlag: 0,
                    keyFlag: 0,
                    writeFieldSize: true,
                    writeFieldPrecision: true,
                    max: 2,
                    validity: {
                        fieldName: false,
                        fieldDescribe: false,
                        fieldType: false,
                        fieldSize: false,
                        fieldPrecision: false,
                        emptyFlag: false,
                        keyFlag: false
                    }
                }
            ],
            lifeCycle: '1',
            ddlSql: '',
            tableName: tableName
        }

        if (hasOptCol) {
            paramsJson.ddlSql = format(this.addFieldsToSql(`CREATE TABLE ${tableName} ${tableSql}`))
        } else {
            paramsJson.ddlSql = `CREATE TABLE ${tableName} ${tableSql}`
        }

        const result = await create_table(paramsJson)

        return {
            success: result.success && result.code == 200,
            msg: result.message
        }
    }

    /**
     * 为表添加opt字段
     **/
    public static addFieldsToSql(sql: string) {
        const fieldStr = `OPT_AREA_CODE VARCHAR(20) COMMENT '数据所属单位区划',
    OPT_FIELD_CODE VARCHAR(20) COMMENT '数据所属单位领域',
    OPT_SUBJECT_ID VARCHAR(36) COMMENT '数据所属单位主体ID',
    OPT_SUBJECT_NAME VARCHAR(50) COMMENT '数据所属单位主体名称',
    OPT_DEPT_ID VARCHAR(36) COMMENT '数据所属单位部门ID',
    OPT_DEPT_NAME VARCHAR(50) COMMENT '数据所属单位部门名称'`;
        const index = sql.indexOf('cd_batch');
        if (index < 0) { // 如果原表中不存在cd_batch字段，则直接返回原sql语句
            return sql;
        }
        const preSql = sql.slice(0, index); // 获取cd_batch字段前面的sql语句
        const postSql = sql.slice(index).replace('cd_batch VARCHAR(50) COMMENT \'批次号\'', ''); // 获取cd_batch字段后面的sql语句
        const newFields = `cd_batch VARCHAR(50) COMMENT '批次号',
    ${fieldStr}`;
        return `${preSql} ${newFields} ${postSql}`;// 拼接新增字段后的完整sql语句
    }

    /**
     * 表删除重建
     **/
    public static async deleteTableReCreate(tableName: string, tableSql: string) {
        const table = (await get_tables_info_page({
            size: 1,
            page: 1,
            sourceId: 6,
            likeValue: tableName
        })).data?.records?.at(0) || null

        if (table) {
            table_delete(table.id).then(async res => {
                if (res.code == 200 && res.success) {
                    const res = await this.createTable(tableName, tableSql, tableName.startsWith('df'))
                    if (res.success) {
                        window.$message.success(`重建${tableName}成功`)
                    } else {
                        window.$message.error(`重建${tableName}失败`)
                    }
                } else {
                    window.$message.error(`删除${tableName}失败`)
                }
            })
        } else {
            window.$message.info(`${tableName}不存在`)
        }
    }
}
