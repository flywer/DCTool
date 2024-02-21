import {ProjectInfo} from "@main/entity/ProjectInfo";
import {find_by_project_id, get_all_collection_project} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {get_columns} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {actionTableNames} from "@render/utils/datacenter/constants";
import {Workflow} from "@render/utils/datacenter/workflow/Workflow";
import {format} from "sql-formatter";
import {isEmpty} from "lodash-es";

/**
 * ODS数据量统计任务 将数据统计至数据湖
 **/
export class ODSRhJobSaveModel extends Workflow {
    constructor() {
        super();
    }

    public static async createODSRhJob(model: ODSRhJobFormModel) {
        const project = await find_by_project_id(model.projectId)
        const projectTableAbbr = project.tableAbbr

        const sourceTable = `di_${projectTableAbbr}_${model.tableName.toLowerCase()}_ods`
        const aimTable = `ods_${model.tableName.toLowerCase()}`

        const sourceTableColumns = await get_columns('6', sourceTable, true)

        if (!isEmpty(sourceTableColumns)) {
            const pColName = (await get_table_sql({tableName: model.tableName}))[0].pColName as string

            const sourceTableColumns1 = sourceTableColumns.map(col => {
                if (col.toLowerCase() === pColName.toLowerCase()) {
                   return `concat(t1.${col},'#${model.projectId}') as ${pColName}`
                }
                return col
            })


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
                   ${sourceTableColumns.filter(col => col != 'id').join(',\n')}
                 FROM
                    (SELECT ${sourceTableColumns1.filter(col => col != 'id').join(',\n')},
             ROW_NUMBER() OVER (PARTITION BY t1.${pColName} ORDER BY cd_time DESC) AS rn
                  FROM ${sourceTable} t1
                           INNER JOIN (SELECT ${pColName},
                                  MAX(cd_time) AS max_cd_time
                           FROM ${sourceTable}
                           GROUP BY ${pColName}) t2 ON t1.${pColName} = t2.${pColName} AND t1.cd_time = t2.max_cd_time) latest
            WHERE latest.rn = 1`

            const {
                minutes,
                hours
            } = await this.createCronByProject(project, model.tableName)

            const jobJson = {
                name: `odsrh_${project.projectAbbr}_${model.tableName.toLowerCase()}`,
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

            await this.createJob(jobJson, '任务创建成功')
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

export type ODSRhJobFormModel = {
    projectId: string,
    personId: string,
    tableName: string
}


