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
      <n-checkbox-group v-model:value="syncData" :disabled="isGenerating">
        <n-space item-style="display: flex;">
          <n-checkbox value="syncOds" label="同步累计报送数据量"/>
          <n-button size="tiny" type="info" @click="syncOdsDataVol" :disabled="isGenerating">立即同步</n-button>
          <n-divider :vertical="true" style="height: 100%"/>
          <n-checkbox value="syncDataLake" label="同步数据湖数据量"/>
          <n-button size="tiny" type="info" @click="syncDataLakeDataVol" :disabled="isGenerating">立即同步
          </n-button>
          <n-divider :vertical="true" style="height: 100%"/>
          <n-checkbox value="syncThemeBase" label="同步主题库数据量"/>
          <n-button size="tiny" type="info" @click="syncThemeBaseDataVol" :disabled="isGenerating">立即同步
          </n-button>
        </n-space>
      </n-checkbox-group>
    </n-card>
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
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {datax_job_run, get_sched_job_page, table_preview} from "@render/api/datacenter.api";
import {
  get_data_lake_data_vol_by_depart_name_and_table_type, get_ods_data_volume,
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

const syncData = ref(['syncOds', 'syncDataLake', 'syncThemeBase'])

// 数据过滤
const filterData = ref([])

const isGenerating = ref(false)
const buttonText = ref('生成Excel')

const generateData = async () => {

  isGenerating.value = true

  const basicDataArr: DepartDataVolExcelModel[] = []
  const actionDataArr: DepartDataVolExcelModel[] = []

  if (syncData.value.includes('syncOds')) {
    await syncOdsDataVol()
  }

  if (syncData.value.includes('syncDataLake')) {
    await syncDataLakeDataVol()
  }

  if (syncData.value.includes('syncThemeBase')) {
    await syncThemeBaseDataVol()
  }

  // 获取单位表名关联数据
  isGenerating.value = true
  buttonText.value = '获取单位表名关联信息...'
  get_all_FE_TableName()
      .then(async departs => {
        try {
          for (const depart of departs) {
            buttonText.value = `处理${depart.departName}数据...`

            const feDataRecord = await getOdsDatVolumeByDepart(depart)

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

      })
      .catch(() => {
        window.$message.error('获取单位表名关联数据失败')
        isGenerating.value = false
        buttonText.value = `生成Excel`
      })
      .finally(() => {
        isGenerating.value = false
        buttonText.value = `生成Excel`
      })

}

type FeDataVolumeRecord = {
  departName: string,
  dataCount: string,
  updateTime: Date
}

const getOdsDatVolumeByDepart = async (depart: FEDepartTableName): Promise<FeDataVolumeRecord> => {

  const odsDataVol = await get_ods_data_volume(depart.departName, depart.tableType.toUpperCase())

  if (odsDataVol.at(0)) {
    return {
      departName: depart.departName,
      dataCount: odsDataVol.at(0).distinctDataVolume.toString(),
      updateTime: odsDataVol.at(0).createTime
    }
  } else {
    return {
      departName: depart.departName,
      dataCount: null,
      updateTime: null
    }
  }

}

const syncOdsDataVol = async () => {
  isGenerating.value = true
  buttonText.value = '正在同步累计推送数据量信息...'

  return new Promise<void>((resolve, reject) => {
    datax_job_run({
      jobId: '1092',
      subsystemName: "采集"
    }).then(() => {
      const interval = setInterval(async () => {
        const schedJob: SchedJob = (await get_sched_job_page({
          current: 1,
          size: 1,
          jobContent: 'sjtj_ods_data_volume'
        })).data?.records[0]

        if (schedJob.handleStatus != 0) {
          clearInterval(interval); // 停止循环
          if (schedJob.handleStatus == 200) {
            isGenerating.value = false
            buttonText.value = '生成Excel'
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
  })
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

const syncDataLakeDataVol = async () => {
  isGenerating.value = true
  buttonText.value = '正在同步数据湖数据量信息...'

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
                isGenerating.value = false
                buttonText.value = '生成Excel'
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

const syncThemeBaseDataVol = async () => {
  isGenerating.value = true
  buttonText.value = '正在同步主题库数据量信息...'

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
                isGenerating.value = false
                buttonText.value = '生成Excel'
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
