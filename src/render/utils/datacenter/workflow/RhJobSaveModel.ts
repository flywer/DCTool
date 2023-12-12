import {get_rh_json} from "@render/api/auxiliaryDb/jobJson.api";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {get_columns} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {Workflow} from "@render/utils/datacenter/workflow/Workflow";
import {isEmpty} from "lodash-es";
import {format} from "sql-formatter";

export class RhJobSaveModel extends Workflow {

    constructor() {
        super();
    }

    /**
     * 创建基础数据-单表融合任务 rh
     **/
    public static async createBasicDataRhJob(model: RhFormModel) {

        const project = (await find_by_project_id(model.projectId))
        const projectTableAbbr = project.tableAbbr

        const jobJson = await get_rh_json(model.tableName)
        let templateJsonStr: string
        if (jobJson.length > 0) {
            templateJsonStr = jobJson[0]?.rh1Json || null

            let templateJson = JSON.parse(templateJsonStr)

            templateJson.name = `rh_${projectTableAbbr}_${model.tableName.toLowerCase()}`

            templateJson.projectId = model.projectId
            templateJson.projectName = projectIdOptions.find(option => option.value === model.projectId).label as string
            templateJson.personId = model.personId
            templateJson.personName = personIdOptions.find(option => option.value === model.personId).label as string

            await this.createJob(templateJson, '融合任务创建成功')
        } else {
            window.$message.error('融合模板JSON不存在')
        }
    }

    /**
     * 创建行为数据-单表融合任务 rh1
     **/
    public static async createActionDataRhJob(model: RhFormModel) {

        const project = (await find_by_project_id(model.projectId))
        const projectTableAbbr = project.tableAbbr

        const sourceTable = `di_${projectTableAbbr}_${model.tableName.toLowerCase()}_right_dwd`
        const aimTable = `df_${projectTableAbbr}_${model.tableName.toLowerCase()}_dwb`

        const sourceTableColumns = await get_columns('6', sourceTable, true)

        if (!isEmpty(sourceTableColumns)) {
            const pColName = (await get_table_sql({tableName: model.tableName}))[0].pColName as string

            const sourceTableColumns1 = sourceTableColumns.map(col => {
                if (col.toLowerCase() === pColName.toLowerCase()) {
                    return 't1.' + col
                }
                return col
            })

            const rhSql = `
            INSERT INTO ${aimTable}
            SELECT latest.${sourceTableColumns.join(',\n')},
                   NULL           AS OPT_AREA_CODE,
                   NULL           AS OPT_FIELD_CODE,
                   '${model.projectId}'   AS OPT_SUBJECT_ID,
                   NULL           AS OPT_SUBJECT_NAME,
                   NULL           AS OPT_DEPT_ID,
                   NULL           AS OPT_DEPT_NAME
            FROM (SELECT ${sourceTableColumns1.join(',\n')},
             ROW_NUMBER() OVER (PARTITION BY t1.${pColName} ORDER BY cd_time DESC) AS rn
                  FROM ${sourceTable} t1
                           INNER JOIN (SELECT ${pColName},
                                  MAX(cd_time) AS max_cd_time
                           FROM ${sourceTable}
                           GROUP BY ${pColName}) t2 ON t1.${pColName} = t2.${pColName} AND t1.cd_time = t2.max_cd_time) latest
            WHERE latest.rn = 1
            UNION ALL
            SELECT t1.*
            FROM ${aimTable} t1
                     LEFT JOIN (SELECT ${pColName}
                                FROM ${sourceTable}
                                GROUP BY ${pColName}) t2 ON t1.${pColName} = t2.${pColName}
            WHERE t2.${pColName} IS NULL`

            const templateJson = {
                name: `rh1_${project.projectAbbr}_${model.tableName.toLowerCase()}`,
                email: '',
                description: '',
                personId: model.personId,
                personName: personIdOptions.find(option => option.value === model.personId).label as string,
                projectId: model.projectId,
                projectName: projectIdOptions.find(option => option.value === model.projectId).label as string,
                crontab: '',
                type: "流程",
                code: "sjkfec411f34768447085a7503c9c71a0ee",
                modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjkfec411f34768447085a7503c9c71a0ee\" name=\"sjkfec411f34768447085a7503c9c71a0ee\" isExecutable=\"true\">\n        <startEvent id=\"sjk8b73cc3bc9e249089269e733145f4ad0\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjkdda5609dba704415b42d90095c7164b0\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjk774187b499a545809a77264183deeed8\" name=\"结束\"/>\n        <sequenceFlow id=\"sjk97c64796bfe14a418baaa0882c817818\" name=\"TDBS-Hive\" sourceRef=\"sjk8b73cc3bc9e249089269e733145f4ad0\" targetRef=\"sjkdda5609dba704415b42d90095c7164b0\"/>\n        <sequenceFlow id=\"sjk4345c5a6a8224dfea437cba044804550\" name=\"TDBS-Hive\" sourceRef=\"sjkdda5609dba704415b42d90095c7164b0\" targetRef=\"sjk774187b499a545809a77264183deeed8\"/>\n    </process>\n</definitions>",
                modelJson: `{"nodeList":[{"id":"sjk8b73cc3bc9e249089269e733145f4ad0","shape":"image","image":"/szrzyt/data_center/tdbs-dev/65accb422a8d3f181bbbc1c537006cc0.svg","size":"20","type":"startProcess","name":"开始"},{"id":"sjkf1901ba54d204ce38464621e74114cee","shape":"image","image":"/szrzyt/data_center/tdbs-dev/32a601d50ea448553386f286a6911239.svg","size":"20","type":"database","database":"TDBS-Hive","name":"TDBS-Hive","databaseName":6,"tableName":"${sourceTable}"},{"id":"sjk71c9e6d02b65425c97141b6e00a78517","shape":"image","image":"/szrzyt/data_center/tdbs-dev/32a601d50ea448553386f286a6911239.svg","size":"20","type":"database","database":"TDBS-Hive","name":"TDBS-Hive","databaseName":6,"tableName":"${aimTable}"},{"id":"sjkdda5609dba704415b42d90095c7164b0","shape":"image","image":"/szrzyt/data_center/tdbs-dev/fea7e3bc7f3297c8652a8aa51c964606.svg","size":"20","delegateExpression":"dataDevSpTaskListener","type":"component","name":"数据开发(Spark SQL)"},{"id":"sjk1fe850d7a1e04442968d5495129cab3b","shape":"image","image":"/szrzyt/data_center/tdbs-dev/32a601d50ea448553386f286a6911239.svg","size":"20","type":"database","database":"TDBS-Hive","name":"TDBS-Hive","databaseName":6,"tableName":"${aimTable}"},{"id":"sjk774187b499a545809a77264183deeed8","shape":"image","image":"/szrzyt/data_center/tdbs-dev/198b2349289796a4476408838a50f944.svg","size":"20","type":"endProcess","name":"结束"}],"edgesList":[{"from":"sjk8b73cc3bc9e249089269e733145f4ad0","to":"sjkf1901ba54d204ce38464621e74114cee","id":"sjk680e3b75804d48e1a8d60a8ae37ddcaf"},{"from":"sjk8b73cc3bc9e249089269e733145f4ad0","to":"sjk71c9e6d02b65425c97141b6e00a78517","id":"sjkdef4dbcfe525451b82efe4c084f06b58"},{"from":"sjk71c9e6d02b65425c97141b6e00a78517","to":"sjkdda5609dba704415b42d90095c7164b0","id":"sjk2ff08d658ca54e78b35adcc69a6091c5"},{"from":"sjkf1901ba54d204ce38464621e74114cee","to":"sjkdda5609dba704415b42d90095c7164b0","id":"sjk97c64796bfe14a418baaa0882c817818"},{"from":"sjkdda5609dba704415b42d90095c7164b0","to":"sjk1fe850d7a1e04442968d5495129cab3b","id":"sjk27bfa861fd904104b778a67174ff032e"},{"from":"sjk1fe850d7a1e04442968d5495129cab3b","to":"sjk774187b499a545809a77264183deeed8","id":"sjk4345c5a6a8224dfea437cba044804550"}]}`,
                dataDevBizVo: {
                    sparkSqlDtoList: [
                        {
                            taskType: "TDBS-HIVE2TDBS-HIVE",
                            sourceDBId: [
                                6,
                                6
                            ],
                            sourceTable: [
                                sourceTable,
                                aimTable
                            ],
                            targetDBId: 6,
                            sql: format(rhSql),
                            sparkConfig: {
                                saveMode: "overwrite"
                            },
                            targetTable: aimTable,
                            taskInfoDto: {
                                taskDefKey: "sjkdda5609dba704415b42d90095c7164b0"
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

            const rh1Json = JSON.parse(updateSjkUUID(removeIds(templateJson)))

            await this.createJob(rh1Json, '单表融合任务创建成功')
        } else {
            window.$message.error(`来源表[${sourceTable}]不存在`)
        }

    }

    /**
     * 创建行为数据-数据入湖-多表融合任务 rh2
     **/
    public static async createActionData2LakeRh2Job(model: RhFormModel) {
        const project = await find_by_project_id(model.projectId)
        const projectAbbr = project.projectAbbr
        const projectTableAbbr = project.tableAbbr

        const pColName = (await get_table_sql({tableName: model.tableName}))[0].pColName as string

        const templateJson = {
            name: `rh2_${projectAbbr}_${model.tableName.toLowerCase()}`,
            email: '',
            description: '',
            personId: model.personId,
            personName: personIdOptions.find(option => option.value === model.personId).label as string,
            projectId: model.projectId,
            projectName: projectIdOptions.find(option => option.value === model.projectId).label as string,
            crontab: '',
            type: "流程",
            code: 'sjk45196358bf9149f289f431a3ed48d37b',
            modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjk45196358bf9149f289f431a3ed48d37b\" name=\"sjk45196358bf9149f289f431a3ed48d37b\" isExecutable=\"true\">\n        <startEvent id=\"sjkd564ce3ac49449feafe224a3ec7ce9de\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjk584f23e6fbcb42528847a59c962bca83\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjk515d0bf22e19430aa1ed28e5c5a8a096\" name=\"结束\"/>\n        <sequenceFlow id=\"sjk2e1a3b714a8840d4ad8aa77d9d258c62\" name=\"TDBS-Hive\" sourceRef=\"sjkd564ce3ac49449feafe224a3ec7ce9de\" targetRef=\"sjk584f23e6fbcb42528847a59c962bca83\"/>\n        <sequenceFlow id=\"sjk0e72c1985a1b44b98000fbe695b87ffb\" name=\"TDBS-Hive\" sourceRef=\"sjk584f23e6fbcb42528847a59c962bca83\" targetRef=\"sjk515d0bf22e19430aa1ed28e5c5a8a096\"/>\n    </process>\n</definitions>",
            modelJson: "{\"nodeList\":[{\"id\":\"sjkd564ce3ac49449feafe224a3ec7ce9de\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjkc650b8c022eb470cb5e4ecd7dadcf07b\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"df_{PROJECT}_{TABLE_NAME}_dwb\"},{\"id\":\"sjka1d8460e0fe5417e846cfbe764ff510b\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"df_lake_{TABLE_NAME}_dm\"},{\"id\":\"sjk584f23e6fbcb42528847a59c962bca83\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/71f2f583f082a8d659c9336cab5dc360.svg\",\"size\":\"20\",\"delegateExpression\":\"dataDevSpTaskListener\",\"type\":\"component\",\"name\":\"数据开发(Spark SQL)\"},{\"id\":\"sjkf13a977ed6394695a14e22ab257ba4a0\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"df_lake_{TABLE_NAME}_dm\"},{\"id\":\"sjk515d0bf22e19430aa1ed28e5c5a8a096\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/fc24a27468b1b125d7cf415739058b41.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjkd564ce3ac49449feafe224a3ec7ce9de\",\"to\":\"sjkc650b8c022eb470cb5e4ecd7dadcf07b\",\"id\":\"sjkc257e38a8b59419fb7574dc427590c9c\"},{\"from\":\"sjkd564ce3ac49449feafe224a3ec7ce9de\",\"to\":\"sjka1d8460e0fe5417e846cfbe764ff510b\",\"id\":\"sjkdeeab9335c0f471795dbfda467823292\"},{\"from\":\"sjka1d8460e0fe5417e846cfbe764ff510b\",\"to\":\"sjk584f23e6fbcb42528847a59c962bca83\",\"id\":\"sjkcde188685a9641a09516de0cee22039b\"},{\"from\":\"sjkc650b8c022eb470cb5e4ecd7dadcf07b\",\"to\":\"sjk584f23e6fbcb42528847a59c962bca83\",\"id\":\"sjk2e1a3b714a8840d4ad8aa77d9d258c62\"},{\"from\":\"sjk584f23e6fbcb42528847a59c962bca83\",\"to\":\"sjkf13a977ed6394695a14e22ab257ba4a0\",\"id\":\"sjk291a008d3eca47f487bfa2c1d748e022\"},{\"from\":\"sjkf13a977ed6394695a14e22ab257ba4a0\",\"to\":\"sjk515d0bf22e19430aa1ed28e5c5a8a096\",\"id\":\"sjk0e72c1985a1b44b98000fbe695b87ffb\"}]}",
            dataDevBizVo: {
                dataSyncDtoList: [],
                qualityInspectionDtoList: [],
                sparkSqlDtoList: [
                    {
                        taskType: "TDBS-HIVE2TDBS-HIVE",
                        sourceDBId: [
                            6,
                            6
                        ],
                        sourceTable: [
                            "df_{PROJECT}_{TABLE_NAME}_dwb",
                            "df_lake_{TABLE_NAME}_dm"
                        ],
                        targetDBId: 6,
                        targetTable: "df_lake_{TABLE_NAME}_dm",
                        sparkConfig: {
                            saveMode: "overwrite"
                        },
                        sql: "INSERT INTO\n  df_lake_{TABLE_NAME}_dm\nSELECT\n  *\nFROM\n  df_{PROJECT}_{TABLE_NAME}_dwb\nUNION ALL\nSELECT\n  t1.*\nFROM\n  df_lake_{TABLE_NAME}_dm t1\n  LEFT JOIN (\n    SELECT\n      CONCAT({PRIM_COL_NAME}, OPT_SUBJECT_ID) AS uniqId\n    FROM\n      df_{PROJECT}_{TABLE_NAME}_dwb\n  ) t2 ON CONCAT(t1.{PRIM_COL_NAME}, t1.OPT_SUBJECT_ID) = t2.uniqId\nWHERE\n  t2.uniqId IS NULL",
                        taskInfoDto: {
                            taskDefKey: "sjk584f23e6fbcb42528847a59c962bca83"
                        },
                    }
                ],
                mySqlDtoList: [],
                postgreSqlDtoList: [],
                trinoSqlDtoList: [],
                conversionDtoList: []
            }
        }

        const paramsJson = JSON.parse(JSON.stringify(templateJson)
            .replaceAll('{TABLE_NAME}', model.tableName.toLowerCase())
            .replaceAll('{PROJECT}', projectTableAbbr.toLowerCase())
            .replaceAll('{PRIM_COL_NAME}', pColName.toLowerCase())
        )
        const rh2Json = JSON.parse(updateSjkUUID(removeIds(paramsJson)))

        await this.createJob(rh2Json, '行为数据入湖-多表融合任务创建成功')

    }

    /**
     * 创建行为数据-数据入库-多表融合任务 rh3
     **/
    public static async createActionData2ThemeRh3Job(model: RhFormModel) {
        const project = await find_by_project_id(model.projectId)
        const projectTableAbbr = project.tableAbbr

        const sourceTable = `df_${projectTableAbbr}_${model.tableName.toLowerCase()}_right_dwb`
        const sourceTableColumns = await get_columns('6', sourceTable, true)

        if (!isEmpty(sourceTableColumns)) {
            const aimTable = `df_sztk_${model.tableName.toLowerCase()}_dm`

            // 使用到的来源表
            let sourceTableNames: string[] = [sourceTable, aimTable]

            // 来源表主表名
            const sourceTableSql = (await get_table_sql({tableName: model.tableName}))[0]
            const sourceTablePrimColName = sourceTableSql.pColName
            const sourceTableUsccColName = sourceTableSql.sql.split('\n').find(str => str.includes("'数据编目挂接单位统一社会信用代码'")).trim().split(' ')[0]

            const sourceTableColumnsAlias = sourceTableColumns.filter(col => !col.toLowerCase().startsWith('opt_')).map(col => 't1.' + col)

            let rh3Sql: string = ''

            if (model.tableName.toLowerCase() === 'c7090') {
                sourceTableNames.push(...['df_ssft_z2020_dwb', 'df_ssft_z2010_dwb'])
                sourceTableNames.push(...[
                    `df_${projectTableAbbr}_c1010_right_dwb`,
                    `df_${projectTableAbbr}_c2010_right_dwb`,
                    `df_${projectTableAbbr}_c3010_right_dwb`,
                    `df_${projectTableAbbr}_c4010_right_dwb`,
                    `df_${projectTableAbbr}_c6010_right_dwb`
                ])

                rh3Sql = `
                INSERT INTO ${aimTable}
                SELECT ${sourceTableColumnsAlias.join(',')},
                   z2010.Z201013 AS OPT_AREA_CODE,
                   z2010.Z201012 AS OPT_FIELD_CODE,
                   z2020.Z202000 AS OPT_SUBJECT_ID,
                   z2020.Z202001 AS OPT_SUBJECT_NAME,
                   z2010.Z201000 AS OPT_DEPT_ID,
                   z2010.Z201001 AS OPT_DEPT_NAME
                FROM ${sourceTable} t1
                   INNER JOIN df_${projectTableAbbr}_c1010_right_dwb t2 ON t1.C201000 = t2.C101000
                   INNER JOIN df_ssft_z2020_dwb z2020 ON z2020.Z202000 = t2.Z202000
                   INNER JOIN df_ssft_z2010_dwb z2010 ON z2020.Z201000 = z2010.Z201000
                WHERE t1.C209001 ='01'
                UNION ALL
                SELECT ${sourceTableColumnsAlias.join(',')},
                   z2010.Z201013 AS OPT_AREA_CODE,
                   z2010.Z201012 AS OPT_FIELD_CODE,
                   z2020.Z202000 AS OPT_SUBJECT_ID,
                   z2020.Z202001 AS OPT_SUBJECT_NAME,
                   z2010.Z201000 AS OPT_DEPT_ID,
                   z2010.Z201001 AS OPT_DEPT_NAME
                FROM ${sourceTable} t1
                   INNER JOIN df_${projectTableAbbr}_c2010_right_dwb t2 ON t1.C201000 = t2.C201000
                   INNER JOIN df_ssft_z2020_dwb z2020 ON z2020.Z202000 = t2.Z202000
                   INNER JOIN df_ssft_z2010_dwb z2010 ON z2020.Z201000 = z2010.Z201000
                WHERE t1.C209001 ='02'
                UNION ALL
                SELECT ${sourceTableColumnsAlias.join(',')},
                   z2010.Z201013 AS OPT_AREA_CODE,
                   z2010.Z201012 AS OPT_FIELD_CODE,
                   z2020.Z202000 AS OPT_SUBJECT_ID,
                   z2020.Z202001 AS OPT_SUBJECT_NAME,
                   z2010.Z201000 AS OPT_DEPT_ID,
                   z2010.Z201001 AS OPT_DEPT_NAME
                FROM ${sourceTable} t1
                   INNER JOIN df_${projectTableAbbr}_c3010_right_dwb t2 ON t1.C201000 = t2.C301000
                   INNER JOIN df_ssft_z2020_dwb z2020 ON z2020.Z202000 = t2.Z202000
                   INNER JOIN df_ssft_z2010_dwb z2010 ON z2020.Z201000 = z2010.Z201000
                WHERE t1.C209001 ='03'
                UNION ALL
                SELECT ${sourceTableColumnsAlias.join(',')},
                   z2010.Z201013 AS OPT_AREA_CODE,
                   z2010.Z201012 AS OPT_FIELD_CODE,
                   z2020.Z202000 AS OPT_SUBJECT_ID,
                   z2020.Z202001 AS OPT_SUBJECT_NAME,
                   z2010.Z201000 AS OPT_DEPT_ID,
                   z2010.Z201001 AS OPT_DEPT_NAME
                FROM ${sourceTable} t1
                   INNER JOIN df_${projectTableAbbr}_c4010_right_dwb t2 ON t1.C201000 = t2.C401000
                   INNER JOIN df_ssft_z2020_dwb z2020 ON z2020.Z202000 = t2.Z202000
                   INNER JOIN df_ssft_z2010_dwb z2010 ON z2020.Z201000 = z2010.Z201000
                WHERE t1.C209001 ='04'
                UNION ALL
                                SELECT ${sourceTableColumnsAlias.join(',')},
                   z2010.Z201013 AS OPT_AREA_CODE,
                   z2010.Z201012 AS OPT_FIELD_CODE,
                   z2020.Z202000 AS OPT_SUBJECT_ID,
                   z2020.Z202001 AS OPT_SUBJECT_NAME,
                   z2010.Z201000 AS OPT_DEPT_ID,
                   z2010.Z201001 AS OPT_DEPT_NAME
                FROM ${sourceTable} t1
                   INNER JOIN df_${projectTableAbbr}_c6010_right_dwb t2 ON t1.C201000 = t2.C601000
                   INNER JOIN df_ssft_z2020_dwb z2020 ON z2020.Z202000 = t2.Z202000
                   INNER JOIN df_ssft_z2010_dwb z2010 ON z2020.Z201000 = z2010.Z201000
                WHERE t1.C209001 ='06'
                UNION ALL
                SELECT t1.*
                FROM ${aimTable} t1
                        LEFT JOIN (SELECT CONCAT(${sourceTablePrimColName},${sourceTableUsccColName}) AS uniqId
                                    FROM ${sourceTable}
                                   ) t2 ON CONCAT(t1.${sourceTablePrimColName},t1.${sourceTableUsccColName}) = t2.uniqId
                WHERE t2.uniqId IS NULL`
            } else {
                // 不需要主表关联的表
                const noJoinTable = ['c1010', 'c2010', 'c3010', 'c4010', 'c4110', 'c6010', 'c6030']
                let joinSql: string

                if (noJoinTable.includes(model.tableName.toLowerCase())) {
                    sourceTableNames.push(...['df_ssft_z2020_dwb', 'df_ssft_z2010_dwb'])

                    joinSql = `
                     INNER JOIN df_ssft_z2020_dwb z2020 ON z2020.Z202000 = t1.Z202000
                     INNER JOIN df_ssft_z2010_dwb z2010 ON z2020.Z201000 = z2010.Z201000`
                } else {
                    // 将要关联的主表名称
                    let joinMainTable = `df_${projectTableAbbr}_${model.tableName.toLowerCase().slice(0, 2)}010_right_dwb`
                    const joinMainTablePrimColName = (await get_table_sql({tableName: `${model.tableName.toLowerCase().slice(0, 2)}010`}))[0].pColName as string

                    sourceTableNames.push(...[joinMainTable, 'df_ssft_z2020_dwb', 'df_ssft_z2010_dwb'])

                    joinSql = `
                     INNER JOIN ${joinMainTable} mainTable ON t1.${joinMainTablePrimColName} = mainTable.${joinMainTablePrimColName}
                     INNER JOIN df_ssft_z2020_dwb z2020 ON z2020.Z202000 = mainTable.Z202000
                     INNER JOIN df_ssft_z2010_dwb z2010 ON z2020.Z201000 = z2010.Z201000`
                }

                rh3Sql = `
                INSERT INTO ${aimTable}
                SELECT ${sourceTableColumnsAlias.join(',')},
                    z2010.Z201013 AS OPT_AREA_CODE,
                    z2010.Z201012 AS OPT_FIELD_CODE,
                    z2020.Z202000 AS OPT_SUBJECT_ID,
                    z2020.Z202001 AS OPT_SUBJECT_NAME,
                    z2010.Z201000 AS OPT_DEPT_ID,
                    z2010.Z201001 AS OPT_DEPT_NAME
                FROM ${sourceTable} t1
                     ${joinSql}
                UNION ALL
                SELECT t1.*
                    FROM ${aimTable} t1
                            LEFT JOIN (SELECT CONCAT(${sourceTablePrimColName},${sourceTableUsccColName}) AS uniqId
                                    FROM ${sourceTable}
                                   ) t2 ON CONCAT(t1.${sourceTablePrimColName},t1.${sourceTableUsccColName}) = t2.uniqId
                    WHERE t2.uniqId IS NULL`
            }

            const {
                modelXml,
                modelJson
            } = this.createModalByTables({
                    tableName: sourceTableNames,
                    dBId: 6
                },
                {
                    tableName: aimTable,
                    dBId: 6
                }
            )

            const rh3Json = {
                name: `rh3_${project.projectAbbr}_${model.tableName.toLowerCase()}`,
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
                            taskType: "TDBS-HIVE2TDBS-HIVE",
                            sourceDBId: sourceTableNames.map(() => 6),
                            sourceTable: sourceTableNames,
                            targetDBId: 6,
                            sql: format(rh3Sql),
                            sparkConfig: {
                                saveMode: "overwrite"
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

            await this.createJob(rh3Json, '入库融合任务创建成功')

        } else {
            window.$message.error(`来源表[${sourceTable}]不存在`)
        }

    }

    /**
     * 创建C7090入库多表融合任务
     **/
    public static async createC7090Rh3Job() {

    }
}

export type RhFormModel = {
    projectId: string,
    personId: string,
    tableName: string
}

