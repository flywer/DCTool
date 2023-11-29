import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {get_columns} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {Workflow} from "@render/utils/datacenter/workflow/Workflow";
import {format} from "sql-formatter";

/**
 * ODS数据量统计任务 将数据统计至数据湖
 **/
export class ODSTjJobSaveModel extends Workflow {
    constructor() {
        super();
    }

    public static async createODSTjJob(model: ODSTjJobFormModel) {
        const project = await find_by_project_id(model.projectId)
        const projectTableAbbr = project.tableAbbr

        const sourceTable = `di_${projectTableAbbr}_${model.tableName.toLowerCase()}_ods`
        // const aimTable = `df_${projectTableAbbr}_${model.tableName.toLowerCase()}_odstj_dws`
        const aimTable = `sjtj_ods_data_volume`

        if (await get_columns('6', sourceTable, true)) {

            const sourceTablePrimColName = (await get_table_sql({tableName: model.tableName}))[0].pColName as string

            const {
                modelXml,
                modelJson
            } = this.createModalByTables({
                    tableName: [sourceTable],
                    dBId: 6
                },
                {
                    tableName: aimTable,
                    dBId: 12
                }
            )

            const sql: string = `
                INSERT INTO
                 ${aimTable}
                 SELECT
                    '${project.projectId}' AS project_id,
                    '${project.projectName.replaceAll('数据归集', '').replaceAll('行政行为', '')}' AS depart_name,
                    ${project.projectName.startsWith('广东省') ? 1 : 2} AS depart_area,
                    '${model.tableName.toUpperCase()}' AS table_type,
                    COUNT(DISTINCT CONCAT(${sourceTablePrimColName}, cd_batch)) AS raw_data_volume,
                    COUNT(DISTINCT ${sourceTablePrimColName}) AS distinct_data_volume,
                    CURRENT_TIMESTAMP() AS create_time
                 FROM
                    ${sourceTable}`

            const jobJson = {
                name: `odstj_${project.projectAbbr}_${model.tableName.toLowerCase()}`,
                email: '',
                description: '',
                personId: model.personId,
                personName: personIdOptions.find(option => option.value === model.personId).label as string,
                projectId: model.projectId,
                projectName: projectIdOptions.find(option => option.value === model.projectId).label as string,
                crontab: '',
                type: "流程",
                code: this.getCodeByModelXml(modelXml),
                modelXml: modelXml,
                modelJson: modelJson,
                dataDevBizVo: {
                    sparkSqlDtoList: [
                        {
                            taskType: "TDBS-HIVE2MYSQL",
                            sourceDBId: [6],
                            sourceTable: [sourceTable],
                            targetDBId: 12,
                            sql: format(sql),
                            sparkConfig: {
                                saveMode: "append"
                            },
                            targetTable: aimTable,
                            taskInfoDto: {
                                taskDefKey: this.getTaskDefKeyByModelXml(modelXml)
                            },
                        }
                    ],
                    dataSyncDtoList: [],
                    qualityInspectionDtoList: [],
                    mySqlDtoList: [],
                    postgreSqlDtoList: [],
                    trinoSqlDtoList: [],
                    conversionDtoList: []
                }
            }

            await this.createJob(jobJson, '统计任务创建成功')
        } else {
            window.$message.error(`来源表[${sourceTable}]不存在`)
        }
    }
}

export type ODSTjJobFormModel = {
    projectId: string,
    personId: string,
    tableName: string
}


