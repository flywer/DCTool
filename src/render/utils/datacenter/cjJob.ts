import {add_datax_job, build_datax_json} from "@render/api/datacenter";
import {findCommonElementsByArr2} from "@render/utils/datacenter/findCommonElements";

export type CjFormModelType = {
    name: string,
    sourceDataSourceId: '7',
    sourceTableName: string,
    targetDataSourceId: '6',
    targetTableName: string,
    projectId: string
}

let paramsModel = {
    readerModel: {
        datasourceType: "mysql",
        datasourceId: '8',
        path: '',
        readerFieldDelimiter: ',',
        tableName: "",
        whereParams: '',
        columns: []
    },
    writerModel: {
        datasourceType: "tbds-hive",
        datasourceId: '11',
        fromTableName: '',
        writerFileName: '',
        writeFieldDelimiter: "|",
        writeMode: "append",
        writerFileType: "orc",
        writerDefaultFS: "hdfs://173.76.2.222:8020",
        writerPath: '',
        columns: [],
        ftpColums: []
    },
    initReaderModel: [],
    initWriterModel: [],
    writerId: '11',
    readerId: '8',
    mappingType: 'the-same-row',
    path: '',
    dynamicPath: '',
    dynamicPathData: "[]",
    jobJson: {
        job: {
            content: [
                {
                    reader: {
                        parameter: {
                            password: '',
                            column: [],
                            connection: [
                                {
                                    jdbcUrl: [],
                                    table: []
                                }
                            ],
                            splitPk: null,
                            username: ''
                        },
                        name: ''
                    },
                    writer: {
                        parameter: {
                            postSql: null,
                            password: '',
                            column: [],
                            connection: [
                                {
                                    jdbcUrl: [],
                                    table: []
                                }
                            ],
                            username: '',
                            preSql: []
                        },
                        name: ''
                    }
                }
            ],
            setting: {
                errorLimit: {
                    record: 0,
                    percentage: 0.02
                },
                speed: {
                    byte: 10485760,
                    channel: 3
                }
            }
        }
    },
    jobDesc: '',
    autoVerifyRecord: 0,
    gatherMethod: "1",
    incrementType: "0",
    projectId: '6',
    gatherSource: "业务系统库",
    subsystemName: "采集",
    replaceParam: '',
    incStartTime: '',
    replaceParamType: ''
}

const buildCjJobJson = async (formModel: CjFormModelType, sourceTableColumns: any[], targetTableColumns: any[]) => {
    const newSourceTable = findCommonElementsByArr2(sourceTableColumns, targetTableColumns, true)

    const indexes = newSourceTable
        .map((item, i) => item === null ? i : -1)
        .filter(i => i !== -1);

    if (indexes.length > 0) {
        // 有 NULL 则说明目标表有字段没有被对应上
        window.$notification.create({
            title: "字段对应失败",
            content: `目标表有字段无法在来源表找到对应字段：${targetTableColumns.filter((_, index) => indexes.includes(index)).map(item => item.split(':')[1]).join('，')}`,
            type: "error"
        })

        return null
    } else {
        paramsModel.jobDesc = formModel.name
        paramsModel.projectId = formModel.projectId

        paramsModel.readerId = formModel.sourceDataSourceId
        paramsModel.writerId = formModel.targetDataSourceId
        paramsModel.mappingType = "the-same-name"

        let path = ''
        for (let i = 0; i < targetTableColumns.length; i++) {
            path += `M0,${72 + (48 * i)}.0 L100,${72 + (48 * i)}.0`
        }
        paramsModel.path = path

        paramsModel.gatherMethod = '2'
        paramsModel.incrementType = '2'
        paramsModel.incrementType = '2'
        paramsModel.replaceParam = "-DlastTime='%s' -DcurrentTime='%s'"
        paramsModel.incStartTime = "1971-01-01 00:00:00"
        paramsModel.replaceParamType = "yyyy-MM-dd HH:mm:ss"

        paramsModel.readerModel.datasourceType = 'mysql'
        paramsModel.readerModel.datasourceId = formModel.sourceDataSourceId
        paramsModel.readerModel.readerFieldDelimiter = ','
        paramsModel.readerModel.tableName = formModel.sourceTableName
        paramsModel.readerModel.whereParams = "cd_time >= ${lastTime} and cd_time < ${currentTime}"
        paramsModel.readerModel.columns = newSourceTable

        paramsModel.writerModel.datasourceType = 'tbds-hive'
        paramsModel.writerModel.datasourceId = formModel.targetDataSourceId
        paramsModel.writerModel.fromTableName = formModel.targetTableName
        paramsModel.writerModel.writerFileName = formModel.targetTableName
        paramsModel.writerModel.writerPath = `/apps/hive/warehouse/xzzf_ods.db/${formModel.targetTableName}`
        paramsModel.writerModel.columns = targetTableColumns
        paramsModel.writerModel.ftpColums = Array(targetTableColumns.length).fill(0).map((_, index) => index)

        paramsModel.initReaderModel = sourceTableColumns
        paramsModel.initWriterModel = targetTableColumns

        let buildJson = {
            readerDatasourceId: paramsModel.readerId,
            readerTables: [paramsModel.readerModel.tableName],
            readerColumns: paramsModel.readerModel.columns,
            writerDatasourceId: paramsModel.writerId,
            writerTables: [paramsModel.writerModel.fromTableName],
            writerColumns: paramsModel.writerModel.columns,
            rdbmsReader: {
                whereParams: paramsModel.readerModel.whereParams
            },
            hiveWriter: {
                datasourceType: paramsModel.writerModel.datasourceType,
                datasourceId: paramsModel.writerModel.datasourceId,
                fromTableName: paramsModel.writerModel.fromTableName,
                writerFileName: paramsModel.writerModel.writerFileName,
                writeFieldDelimiter: paramsModel.writerModel.writeFieldDelimiter,
                writeMode: paramsModel.writerModel.writeMode,
                writerFileType: paramsModel.writerModel.writerFileType,
                writerDefaultFS: paramsModel.writerModel.writerDefaultFS,
                writerPath: paramsModel.writerModel.writerPath,
            },
            subsystemName: "采集"
        }

        console.log(buildJson)

        paramsModel.jobJson = await build_datax_json(buildJson)

        return paramsModel
    }
}

export const createCjJob = (formModel: CjFormModelType, sourceTableColumns: any[], targetTableColumns: any[]) => {
    const param = buildCjJobJson(formModel, sourceTableColumns, targetTableColumns)
    if (param != null) {
        add_datax_job(paramsModel).then(async (res) => {
            if (res.code == 0) {
                window.$message.success('采集任务创建成功')
            } else {
                window.$message.error(res.msg)
                console.log(res)
            }
        })
    }
}
