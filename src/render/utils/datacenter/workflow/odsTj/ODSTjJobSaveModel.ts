import {ProjectInfo} from "@main/entity/ProjectInfo";
import {find_by_project_id, get_all_collection_project} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {get_columns} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {actionTableNames} from "@render/utils/datacenter/constants";
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

            const {
                minutes,
                hours
            } = await this.createCronByProject(project, model.tableName)

            const jobJson = {
                name: `odstj_${project.projectAbbr}_${model.tableName.toLowerCase()}`,
                email: '',
                description: '',
                personId: model.personId,
                personName: personIdOptions.find(option => option.value === model.personId).label as string,
                projectId: model.projectId,
                projectName: projectIdOptions.find(option => option.value === model.projectId).label as string,
                crontab: `0 ${minutes} ${hours} ? * * *`,
                schedulingMode: '2',
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

    private static async createCronByProject(project: ProjectInfo, tableName: string) {

        const projects = await get_all_collection_project(1)

        const index = projects.findIndex(p => p.projectId == project.projectId)

        if (index != -1) {
            let hours = 0
            let minutes = -6

            for (let i = 0; i <= index; i++) {
                minutes += 6
                if (minutes >= 60) {
                    hours++
                    minutes = 0
                }
            }
            if (project.projectId == '6') {
                if (['g1010', 'g1020',
                    'y2010', 'y2020', 'y2030', 'y3010'].includes(tableName.toLowerCase())) {

                } else {
                    if (minutes + 3 >= 60) {
                        minutes = 60 - (minutes + 3)
                        hours++
                    } else {
                        minutes = minutes + 3
                    }
                }
            } else if (['11', '5'].includes(project.projectId)) {
                // 除开司法厅基础数据
            } else {
                let index = actionTableNames.findIndex(name => name == tableName.toLowerCase())
                const row = parseInt(String(index / 8))
                if (minutes + row * 2 >= 60) {
                    minutes = 60 - (minutes + row * 2)
                    hours++
                } else {
                    minutes = minutes + row * 2
                }
            }

            return {
                minutes: minutes,
                hours: hours
            }
        } else {
            return {
                minutes: 0,
                hours: 12
            }
        }

    }
}

export type ODSTjJobFormModel = {
    projectId: string,
    personId: string,
    tableName: string
}


