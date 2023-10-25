import {DataXJobTemplate} from "@common/types/datacenter/dataCollection";
import {add_datax_job, add_sched_task, build_datax_json, update_datax_job} from "@render/api/datacenter.api";
import {findCommonElementsByArr2} from "@render/utils/datacenter/findCommonElements";
import {cloneDeep} from "lodash-es";

export type CjFormModelType = {
    name: string,
    sourceDataSourceId: '7',
    sourceTableName: string,
    targetDataSourceId: '6',
    targetTableName: string,
    projectId: string
}

export type SchedJobFromModelType = {
    jobType: string,
    jobContent: string,
    glueType: string,
    projectId: string,
    projectName: string,
    jobCron: string,
    jobDesc: string,
    jobGroup: number,
    retry: string,
    executorFailRetryCount: number,
    jobTemplateId: string,
    subsystemName: string,
    sec: string,
    min: number,
    hour: string,
    day: string,
    month: string,
    week: string,
    year: string,
}

const templateJson = {
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
            content: `目标表有字段无法在来源表[${formModel.sourceTableName}]找到对应字段：${targetTableColumns.filter((_, index) => indexes.includes(index)).map(item => item.split(':')[1]).join(', ')}`,
            type: "error"
        })

        return null
    } else {
        let paramsJson = cloneDeep(templateJson)

        paramsJson.jobDesc = formModel.name
        paramsJson.projectId = formModel.projectId

        paramsJson.readerId = formModel.sourceDataSourceId
        paramsJson.writerId = formModel.targetDataSourceId
        paramsJson.mappingType = "the-same-name"

        let path = ''
        for (let i = 0; i < targetTableColumns.length; i++) {
            path += `M0,${72 + (48 * i)}.0 L100,${72 + (48 * i)}.0`
        }
        paramsJson.path = path

        paramsJson.gatherMethod = '2'
        paramsJson.incrementType = '2'
        paramsJson.incrementType = '2'
        paramsJson.replaceParam = "-DlastTime='%s' -DcurrentTime='%s'"
        paramsJson.incStartTime = "1971-01-01 00:00:00"
        paramsJson.replaceParamType = "yyyy-MM-dd HH:mm:ss"

        paramsJson.readerModel.datasourceType = 'mysql'
        paramsJson.readerModel.datasourceId = formModel.sourceDataSourceId
        paramsJson.readerModel.readerFieldDelimiter = ','
        paramsJson.readerModel.tableName = formModel.sourceTableName
        paramsJson.readerModel.whereParams = "cd_time >= ${lastTime} and cd_time < ${currentTime}"
        paramsJson.readerModel.columns = newSourceTable

        paramsJson.writerModel.datasourceType = 'tbds-hive'
        paramsJson.writerModel.datasourceId = formModel.targetDataSourceId
        paramsJson.writerModel.fromTableName = formModel.targetTableName
        paramsJson.writerModel.writerFileName = formModel.targetTableName
        paramsJson.writerModel.writerPath = `/apps/hive/warehouse/xzzf_ods.db/${formModel.targetTableName}`
        paramsJson.writerModel.columns = targetTableColumns
        paramsJson.writerModel.ftpColums = Array(targetTableColumns.length).fill(0).map((_, index) => index)

        paramsJson.initReaderModel = sourceTableColumns
        paramsJson.initWriterModel = targetTableColumns

        let buildJson = {
            readerDatasourceId: paramsJson.readerId,
            readerTables: [paramsJson.readerModel.tableName],
            readerColumns: paramsJson.readerModel.columns,
            writerDatasourceId: paramsJson.writerId,
            writerTables: [paramsJson.writerModel.fromTableName],
            writerColumns: paramsJson.writerModel.columns,
            rdbmsReader: {
                whereParams: paramsJson.readerModel.whereParams
            },
            hiveWriter: {
                datasourceType: paramsJson.writerModel.datasourceType,
                datasourceId: paramsJson.writerModel.datasourceId,
                fromTableName: paramsJson.writerModel.fromTableName,
                writerFileName: paramsJson.writerModel.writerFileName,
                writeFieldDelimiter: paramsJson.writerModel.writeFieldDelimiter,
                writeMode: paramsJson.writerModel.writeMode,
                writerFileType: paramsJson.writerModel.writerFileType,
                writerDefaultFS: paramsJson.writerModel.writerDefaultFS,
                writerPath: paramsJson.writerModel.writerPath,
            },
            subsystemName: "采集"
        }

        paramsJson.jobJson = await build_datax_json(buildJson)

        return paramsJson
    }
}

export const createCjJob = async (formModel: CjFormModelType, sourceTableColumns: any[], targetTableColumns: any[]) => {
    const param = await buildCjJobJson(formModel, sourceTableColumns, targetTableColumns)
    if (param != null) {
        await add_datax_job(param).then(async (res) => {
            if (res.code == 0) {
                window.$message.success('采集任务创建成功')
            } else {
                window.$message.error(res.msg)
                console.error(res)
            }
        })
    }
}

export const updateDataXJob = async (formModel: DataXJobTemplate) => {
    await update_datax_job(formModel).then(async (res) => {
        if (res.code == 0) {
            window.$message.success('采集任务更新成功')
        } else {
            window.$message.error(res.msg)
            console.error(res)
        }
    })
}

export const createSchedJob = async (formModel: SchedJobFromModelType) => {
    const {
        projectName,
        sec,
        min,
        hour,
        day,
        month,
        week,
        year,
        ...newAddSchedJobModalFormModel
    } = {
        ...formModel,
        retry: parseInt(formModel.retry),
        executorFailRetryCount: formModel.executorFailRetryCount.toString(),
        jobCron: `${formModel.sec} ${formModel.min} ${formModel.hour} ${formModel.day} ${formModel.month} ${formModel.week} ${formModel.year}`
    };

    await add_sched_task(newAddSchedJobModalFormModel).then(res => {
        if (res.code == 0) {
            window.$message.success('调度任务创建成功')

        } else {
            window.$notification.create({
                title: '调度任务创建失败',
                content: res.msg + '，请重新配置CRON表达式',
                type: "warning"
            })
        }
    })
}
