import {cloneDeep} from "lodash-es";
import {add_datax_job, build_datax_json, get_columns} from "@render/api/datacenter.api";

export type ODSRhQcFormModelType = {
    name: string,
    dataSourceId: '12',
    tableName: string,
    projectId: string
}

const templateJson = {
    readerModel: {
        datasourceType: "mysql",
        datasourceId: '12',
        path: '',
        tableName: "",
        whereParams: '1 = 0',
        columns: []
    },
    writerModel: {
        datasourceType: "mysql",
        datasourceId: '12',
        fromTableName: '',
        preSql: '',
        columns: [],
        ftpColums: []
    },
    initReaderModel: [],
    initWriterModel: [],
    writerId: '12',
    readerId: '12',
    mappingType: 'the-same-row',
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
    writerTable: '',
    readerTable: '',
    autoVerifyRecord: 0,
    gatherMethod: "1",
    incrementType: "0",
    projectId: '73',
    gatherSource: "采集前置库",
    subsystemName: "采集"
}


const buildODSRhQcJobJson = async (model: ODSRhQcFormModelType) => {

    const tableColumns = await get_columns('12', `ods_${model.tableName.toLowerCase()}`, true)

    let paramsJson = cloneDeep(templateJson)


    paramsJson.readerModel.tableName = `ods_${model.tableName}`
    paramsJson.readerModel.columns = tableColumns

    paramsJson.writerModel.fromTableName = `ods_${model.tableName}`
    paramsJson.writerModel.columns = tableColumns
    paramsJson.writerModel.preSql = `truncate table ods_${model.tableName}`


    paramsJson.initReaderModel = tableColumns
    paramsJson.initWriterModel = tableColumns

    paramsJson.jobDesc = model.name
    paramsJson.projectId = model.projectId
    paramsJson.writerTable = `ods_${model.tableName}`
    paramsJson.readerTable = `ods_${model.tableName}`


    const buildJson = {
        readerDatasourceId: paramsJson.readerId,
        readerTables: [paramsJson.readerModel.tableName],
        readerColumns: paramsJson.readerModel.columns,
        writerDatasourceId: paramsJson.writerId,
        writerTables: [paramsJson.writerModel.fromTableName],
        writerColumns: paramsJson.writerModel.columns,
        rdbmsReader: {
            whereParams: paramsJson.readerModel.whereParams
        },
        rdbmsWriter: {
            preSql: paramsJson.writerModel.preSql
        },
        subsystemName: "采集"
    }

    paramsJson.jobJson = await build_datax_json(buildJson)

    return paramsJson
}

export const createODSRhQcJob = async (formModel: ODSRhQcFormModelType) => {
    const param = await buildODSRhQcJobJson(formModel)
    if (param != null) {
        await add_datax_job(param).then(async (res) => {
            if (res.code == 0) {
                window.$message.success('ODS融合表清除任务创建成功')
            } else {
                window.$message.error(res.msg)
                console.error(res)
            }
        })
    }
}
