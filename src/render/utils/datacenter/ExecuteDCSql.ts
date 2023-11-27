import {exec_sql} from "@render/api/datacenter.api";

/**
 * 执行中台Sql工具类
 **/
export class ExecuteDCSql {
    sourceId: string
    dbType: 'tbds-hive' | 'mysql'
    sourceName: string
    dataTierCode: string
    dataTierName: string
    namedJson: string
    datamodelTableFieldsVoList: any[]
    lifeCycle: string
    ddlSql: string
    tableName: string

    constructor(sourceId?: string, dbType?: 'tbds-hive' | 'mysql') {
        this.sourceId = sourceId || '6'
        this.dbType = dbType || 'tbds-hive'

        this.sourceName = ''
        this.dataTierCode = ''
        this.dataTierName = ''
        this.namedJson = ''
        this.datamodelTableFieldsVoList = []
        this.lifeCycle = '1'
        this.tableName = 'execSql'
    }

    public execSql(sql: string, showMessage: boolean) {
        this.ddlSql = sql
        return new Promise<void>((resolve, reject) => {
            exec_sql(this).then((res) => {
                if ((res.code == 500 && res.message === '服务器内部错误') || (res.code == 200 && res.success)) {
                    if (showMessage) {
                        window.$message.success('执行成功')
                    }
                    resolve()
                } else {
                    if (showMessage) {
                        window.$dialog.error({
                            title: '执行失败',
                            content: res.message.replace(/建表失败，/g, ''),
                            positiveText: '确定'
                        });
                    }
                    reject(res.message.replace(/建表失败，/g, ''))
                }

            })
        })
    }
}
