import {add_datax_job, build_datax_json, get_columns} from "@render/api/datacenter";

export type GxFormModelType = {
    name: string,
    sourceTableName: string,
    targetTableName: string,
    projectId: string
}

let paramsJson = {
    readerModel: {
        datasourceType: "mysql",
        datasourceId: '8',
        path: '',
        tableName: "",
        columns: []
    },
    writerModel: {
        datasourceType: "mysql",
        datasourceId: '11',
        fromTableName: '',
        preSql: '',
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
    subsystemName: "采集"
}

export const buildGxJson = async (formModel: GxFormModelType) => {
    paramsJson.jobDesc = formModel.name
    paramsJson.projectId = formModel.projectId

    paramsJson.readerModel.tableName = formModel.sourceTableName
    // paramsJson.readerModel.datasourceId = formModel.value.sourceDataSourceId
    paramsJson.readerModel.columns = (await get_columns(paramsJson.readerModel.datasourceId, formModel.sourceTableName, true))

    paramsJson.writerModel.fromTableName = formModel.targetTableName
    paramsJson.writerModel.preSql = `truncate table ${formModel.targetTableName}`
    // paramsJson.writerModel.datasourceId = formModel.value.targetDataSourceId
    paramsJson.writerModel.columns = (await get_columns(paramsJson.writerModel.datasourceId, formModel.targetTableName, true))
    paramsJson.writerModel.ftpColums = Array(paramsJson.writerModel.columns.length).fill(0).map((_, index) => index)

    paramsJson.initReaderModel = paramsJson.readerModel.columns
    paramsJson.initWriterModel = paramsJson.writerModel.columns

    // paramsJson.readerId = formModel.value.sourceDataSourceId
    // paramsJson.writerId = formModel.value.targetDataSourceId

    let path = ''
    for (let i = 0; i < paramsJson.readerModel.columns.length; i++) {
        path += `M0,${72 + (48 * i)}.0 L100,${72 + (48 * i)}.0`
    }
    paramsJson.path = path

    let buildJson = {
        readerDatasourceId: paramsJson.readerId,
        readerTables: [paramsJson.readerModel.tableName],
        readerColumns: paramsJson.readerModel.columns,
        writerDatasourceId: paramsJson.writerId,
        writerTables: [paramsJson.writerModel.fromTableName],
        writerColumns: paramsJson.writerModel.columns,
        rdbmsReader: {},
        rdbmsWriter: {
            preSql: paramsJson.writerModel.preSql
        },
        subsystemName: "采集"
    }

    paramsJson.jobJson = await build_datax_json(buildJson)

    return paramsJson
}

export const createGxJob = async (formModel: GxFormModelType) => {
    await buildGxJson(formModel).then(res => {
        add_datax_job(res).then(async (res) => {
            if (res.code == 0) {
                window.$message.success('共享任务创建成功')
            } else {
                window.$message.error(res.msg)
                console.log(res)
            }
        })
    }).catch(e => {
        window.$message.error(e)
    })
}
