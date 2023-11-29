<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 110px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      统计规则：<br>
      1.数据根据<b>主键ID</b>去重<br>
      2.案件量按照<b>数据编目挂接单位</b>维度统计<br>
      3.分别统计各单位ODS表、数据湖、主题库数据量<br>
      4.统计ODS表，需先执行各单位ODS统计任务，否则无值
    </n-alert>

    <n-card class="mt-2">
      <n-checkbox-group v-model:value="filterData" :disabled="isGenerating">
        <n-space item-style="display: flex;">
          <n-checkbox value="fe" label="过滤累计报送数据量为空的数据"/>
          <n-checkbox value="dataLake" label="过滤数据湖数据量为空的数据"/>
          <n-checkbox value="themeBase" label="过滤主题库数据量为空的数据"/>
        </n-space>
      </n-checkbox-group>
    </n-card>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" @click="generateData" :loading="isGenerating">{{ buttonText }}</n-button>
    </n-space>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {SchedJob} from "@common/types/datacenter/dataCollection";
import {DepartDataVolExcelModel} from "@common/types/dataStat";
import {FEDepartTableName} from "@main/entity/FEDepartTableName";
import {get_all_FE_TableName} from "@render/api/auxiliaryDb/preDatabase.api";
import {get_project_by_project_name} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {datax_job_run, get_sched_job_page, table_preview} from "@render/api/datacenter.api";
import {
  get_data_lake_data_vol_by_depart_name_and_table_type,
  get_theme_base_data_vol_by_depart_name_and_table_type
} from "@render/api/front.api";
import {create_depart_data_vol_excel} from "@render/api/xlsx.api";
import {projectIdOptions} from "@render/typings/datacenterOptions";
import {formatDate2Day} from "@render/utils/common/dateUtils";
import {isBasicTable} from "@render/utils/common/isBasicTable";
import {actionTableNames, basicTableNames} from "@render/utils/datacenter/constants";
import {ExecuteDCSql} from "@render/utils/datacenter/ExecuteDCSql";
import {isNull} from "lodash-es";
import {ref} from "vue";

// 数据过滤
const filterData = ref([])

const isGenerating = ref(false)
const buttonText = ref('生成Excel')

const generateData = async () => {

  isGenerating.value = true

  const basicDataArr: DepartDataVolExcelModel[] = []
  const actionDataArr: DepartDataVolExcelModel[] = []

  buttonText.value = '正在同步数据湖数据量信息...'
  await sync_data_lake_data_vol()

  buttonText.value = '正在同步主题库数据量信息...'
  await sync_theme_base_data_vol()

  buttonText.value = '获取单位表名关联信息...'

  // 获取单位表名关联数据
  get_all_FE_TableName().then(async departs => {
    try {
      for (const depart of departs) {
        buttonText.value = `处理${depart.departName}数据...`

        const feDataRecord = await getFeDataVolumeByDepart(depart)

        const dataLakeDataRecord = await get_data_lake_data_vol_by_depart_name_and_table_type(getProjectIdByDepartName(depart.departName), depart.tableType)

        const themeBaseDataRecord = await get_theme_base_data_vol_by_depart_name_and_table_type(depart.departName, depart.tableType)

        if ((filterData.value.includes('fe') && isNull(feDataRecord)) ||
            (filterData.value.includes('dataLake') && !isBasicTable(depart.tableType) && isNull(dataLakeDataRecord)) ||
            (filterData.value.includes('themeBase') && isNull(themeBaseDataRecord))) {
          continue
        }

        const dataRow: DepartDataVolExcelModel = {
          departName: depart.departName,
          tableType: depart.tableType,
          tableComment: (await get_table_sql({tableName: depart.tableType}))[0].comment,
          feTableName: depart.tableName,
          feDataCount: feDataRecord?.dataCount || '0',
          feDataStatTime: feDataRecord?.updateTime ? formatDate2Day(feDataRecord?.updateTime, true) : '-',
          dataLakeDataCount: dataLakeDataRecord?.dataCount || '0',
          dataLakeDataStatTime: dataLakeDataRecord?.updateTime ? formatDate2Day(dataLakeDataRecord?.updateTime, true) : '-',
          themeBaseDataCount: themeBaseDataRecord?.dataCount || '0',
          themeBaseDataStatTime: themeBaseDataRecord?.updateTime ? formatDate2Day(themeBaseDataRecord?.updateTime, true) : '-',
        }

        // 基础数据
        if (basicTableNames.includes(depart.tableType.toLowerCase())) {
          basicDataArr.push(dataRow)
        } else {
          actionDataArr.push(dataRow)
        }
      }
    } catch (e) {
      window.$message.error('数据处理失败')
      window.$message.error(e)
      isGenerating.value = false
      buttonText.value = `生成Excel`
      console.log(e)
    }

    const customSort = (a: DepartDataVolExcelModel, b: DepartDataVolExcelModel) => {
      // 先按 departName 进行排序
      const departNameComparison = a.departName.localeCompare(b.departName);
      if (departNameComparison !== 0) {
        return departNameComparison;
      }

      // departName 相同时，按 tableType 进行排序
      return a.tableType.localeCompare(b.tableType);
    }

    basicDataArr.sort(customSort)
    actionDataArr.sort(customSort)

    buttonText.value = `生成Excel中...`

    // 生成Excel
    create_depart_data_vol_excel({
      basicData: basicDataArr,
      actionData: actionDataArr
    }).catch(() => {
      window.$message.error('生成Excel失败')
      isGenerating.value = false
      buttonText.value = `生成Excel`
    })

  }).catch(() => {
    window.$message.error('获取单位表名关联数据失败')
    isGenerating.value = false
    buttonText.value = `生成Excel`
  }).finally(() => {
    isGenerating.value = false
    buttonText.value = `生成Excel`
  })

}

type FeDataVolumeRecord = {
  departName: string,
  dataCount: string,
  updateTime: Date
}

const getFeDataVolumeByDepart = async (depart: FEDepartTableName): Promise<FeDataVolumeRecord> => {
  let projectName = ''
  // 若是基础数据
  if (isBasicTable(depart.tableType)) {
    projectName = depart.departName + '数据归集'
  } else {
    if (depart.departName.startsWith('广东省')) {
      projectName = depart.departName + '数据归集'
    } else {
      projectName = depart.departName + '行政行为数据归集'
    }
  }

  const projects = await get_project_by_project_name(projectName)

  for (const project of projects) {
    const record: string[][] = (await table_preview(6, `df_${project.tableAbbr}_${depart.tableType.toLowerCase()}_odstj_dws`)).data
    if (record && record.length > 1) {
      const data = record.at(1)
      // 确定是否是此项目
      if (data.at(0) == project.projectId) {
        return {
          departName: data.at(1),
          dataCount: data.at(4).toString(),
          updateTime: new Date(data.at(5))
        }
      }
    } else {
      return null
    }
  }

}

const getProjectIdByDepartName = (departName: string): string => {
  if (departName == '广东省司法厅') {
    return '21'
  } else if (departName == '广东省市场监督管理局') {
    return '10'
  } else if (departName == '广东省政务服务数据管理局') {
    return '64'
  } else {
    const project = projectIdOptions.find(project => {
      const name = (project.label as string).replaceAll('数据归集', '').replaceAll('行政行为', '')
      return name == departName;
    })

    return project?.value as string
  }

}

const sync_data_lake_data_vol = async () => {
  const executeDcSql = new ExecuteDCSql('12', 'mysql')
  await executeDcSql.execSql('truncate table xzzf_sjtj_data_lake', false)

  const generateSubSql = async (tableName: string) => {

    const pColName = (await get_table_sql({tableName: tableName}))[0].pColName as string

    return `
    SELECT UUID(),
           OPT_SUBJECT_ID,
           '${tableName.toUpperCase()}',
           COUNT( DISTINCT ${pColName}),
           NOW()
    FROM sztk_${tableName}
    WHERE OPT_SUBJECT_NAME IS NULL
    GROUP BY OPT_SUBJECT_ID
    UNION ALL`
  }

  let insertSql = `INSERT INTO xzzf_sjtj_data_lake
    (id, project_id, table_type, data_count, update_time)`
  for (const table of actionTableNames) {
    insertSql += await generateSubSql(table)
  }
  insertSql = insertSql.split('\n').slice(0, -1).join('\n')

  await executeDcSql.execSql(insertSql, false)

  return new Promise<void>((resolve, reject) => {
    const interval1 = setInterval(async () => {
      const record: string[][] = (await table_preview(12, `xzzf_sjtj_data_lake`)).data
      if (record.length == 1) {
        // 无数据
      } else {
        clearInterval(interval1)
        datax_job_run({
          jobId: '803',
          subsystemName: "采集"
        }).then(() => {
          const interval = setInterval(async () => {
            const schedJob: SchedJob = (await get_sched_job_page({
              current: 1,
              size: 1,
              jobContent: 'sjtj_data_lake'
            })).data?.records[0]

            if (schedJob.handleStatus != 0) {
              clearInterval(interval); // 停止循环
              if (schedJob.handleStatus == 200) {
                resolve()
              } else {
                reject()
                window.$message.error(`[${schedJob.jobContent}]执行异常`)
                isGenerating.value = false
                buttonText.value = '生成Excel'
              }
            }
          }, 1000)
        })
      }
    }, 1000)
  })

}

const sync_theme_base_data_vol = async () => {
  const executeDcSql = new ExecuteDCSql('8', 'mysql')
  await executeDcSql.execSql('truncate table xzzf_sjtj_theme_base_data_volume', false)

  let insertSql = `
  INSERT INTO xzzf_sjtj_theme_base_data_volume
    (id, depart_name, table_type, data_count, update_time)
  `

  const generateSubSql = async (tableName: string) => {
    const tableSql = await get_table_sql({tableName: tableName})

    let departColName = tableSql[0].sql.split('\n').find(str => str.includes("'数据编目挂接单位名称'")).trim().split(' ')[0]

    // 有些单位名称会带有括号，需去掉，比如市场监管局
    const departName = `IF(LOCATE('(', ${departColName}) > 0, SUBSTRING(${departColName}, 1, LOCATE('(', ${departColName}) - 1), ${departColName})`

    return `
    SELECT UUID()                       ,
           ${departName}                ,
           '${tableName.toUpperCase()}' ,
           COUNT(*)                     ,
           NOW()
    FROM sztk_${tableName}
    GROUP BY ${departColName}
    UNION ALL`
  }

  for (const table of basicTableNames) {
    insertSql += await generateSubSql(table)
  }
  for (const table of actionTableNames) {
    insertSql += await generateSubSql(table)
  }
  insertSql = insertSql.split('\n').slice(0, -1).join('\n')

  await executeDcSql.execSql(insertSql, false)

  return new Promise<void>((resolve, reject) => {
    const interval1 = setInterval(async () => {
      const record: string[][] = (await table_preview(8, `xzzf_sjtj_theme_base_data_volume`)).data
      if (record.length == 1) {
        // 无数据
      } else {
        clearInterval(interval1); // 停止循环
        datax_job_run({
          jobId: '1091',
          subsystemName: "采集"
        }).then(() => {
          const interval2 = setInterval(async () => {
            const schedJob: SchedJob = (await get_sched_job_page({
              current: 1,
              size: 1,
              jobContent: 'sjtj_theme_base'
            })).data?.records[0]

            if (schedJob.handleStatus != 0) {
              clearInterval(interval2); // 停止循环
              if (schedJob.handleStatus == 200) {
                resolve()
              } else {
                reject()
                window.$message.error(`[${schedJob.jobContent}]执行异常`)
                isGenerating.value = false
                buttonText.value = '生成Excel'
              }
            }
          }, 1000)
        })
      }
    }, 1000)

  })
}
</script>

<style scoped>

</style>
