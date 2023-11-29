import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_columns} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {Workflow} from "@render/utils/datacenter/workflow/Workflow";
import {format} from "sql-formatter";

/**
 * ODS数据量统计备份任务
 **/
export class ODSTjBfJobSaveModel extends Workflow {
    constructor() {
        super();
    }

    public static async createODSTjBfJob(model: ODSTjBfJobFormModel) {
        const project = await find_by_project_id(model.projectId)
        const projectTableAbbr = project.tableAbbr

        const sourceTable = `df_${projectTableAbbr}_${model.tableName.toLowerCase()}_odstj_dws`
        const aimTable = `sjtj_ods_data_volume`

        if (await get_columns('6', sourceTable, true)) {

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

            const sql = `
            INSERT INTO ${aimTable}
            SELECT
             project_id,
             depart_name,
             depart_area,
             table_type,
             raw_data_volume,
             distinct_data_volume,
             create_time
            FROM ${sourceTable}`

            const jobJson = {
                name: `odstjbf_${project.projectAbbr}_${model.tableName.toLowerCase()}`,
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

export type ODSTjBfJobFormModel = {
    projectId: string,
    personId: string,
    tableName: string
}
