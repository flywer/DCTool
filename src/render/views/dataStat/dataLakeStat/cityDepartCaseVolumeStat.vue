<template>
  <n-scrollbar style="height: calc(100vh - 110px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      统计规则：<br>
      1.数据根据<b>案件编号</b>去重<br>
      2.案件量按照<b>执法主体ID其对应的执法主体名称</b>维度统计<br>
    </n-alert>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" @click="exportExcel" :loading="isGenerating">{{ buttonText }}</n-button>
    </n-space>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {DC_Datasource} from "@common/types/datacenter/common";
import {SchedJob} from "@common/types/datacenter/dataCollection";
import {DataLakeOwnDepartCaseVolumeExcelModel} from "@common/types/dataStat";
import {CatalogHookType} from "@main/entity/DepartCatalogHookRecord";
import {find_catalog_hook_record_by_depart_name} from "@render/api/auxiliaryDb/departCatalogHookRecord.api";
import {datax_job_run, get_sched_job_page, table_preview} from "@render/api/datacenter.api";
import {get_data_lake_own_depart_case_volume} from "@render/api/front.api";
import {export_data_lake_own_depart_case_volume} from "@render/api/xlsx.api";
import {ExecuteDCSql} from "@render/utils/datacenter/ExecuteDCSql";
import {ref} from "vue";

const isGenerating = ref(false)
const buttonText = ref('生成Excel')

const exportExcel = async () => {
  isGenerating.value = true

  await syncZ2020Data()

  await syncCaseVolumeData()

  isGenerating.value = true
  buttonText.value = '正在分析统计数据...'

  get_data_lake_own_depart_case_volume()
      .then(async data => {
        try {

          const caseVolumeModel: DataLakeOwnDepartCaseVolumeExcelModel[] = []
          for (const datum of data) {

            const model = new DataLakeOwnDepartCaseVolumeExcelModel()
            model.subjectName = datum.subjectName
            model.ownDepartName = datum.ownDepartName
            model.caseTotalVolume = datum.volume

            if (datum.ownDepartName != null) {
              const catalogHookRecord = await find_catalog_hook_record_by_depart_name(datum.ownDepartName)
              if (catalogHookRecord != null) {
                switch (datum.tableType) {
                  case 'C1010':
                    switch (catalogHookRecord.AL) {
                      case CatalogHookType.nationalVertical:
                        model.AL.nv = datum.volume
                        break
                      case CatalogHookType.provincialVertical:
                        model.AL.pv = datum.volume
                        break
                      case CatalogHookType.noCatalog:
                      case CatalogHookType.catalogedNoData:
                      case CatalogHookType.hooked:
                        model.AL.citySystem = datum.volume
                        break
                    }
                    break
                  case 'C2010':
                    switch (catalogHookRecord.AP) {
                      case CatalogHookType.nationalVertical:
                        model.AP.nv = datum.volume
                        break
                      case CatalogHookType.provincialVertical:
                        model.AP.pv = datum.volume
                        break
                      case CatalogHookType.noCatalog:
                      case CatalogHookType.catalogedNoData:
                      case CatalogHookType.hooked:
                        model.AP.citySystem = datum.volume
                        break
                    }
                    break
                  case 'C3010':
                    switch (catalogHookRecord.AF) {
                      case CatalogHookType.nationalVertical:
                        model.AF.nv = datum.volume
                        break
                      case CatalogHookType.provincialVertical:
                        model.AF.pv = datum.volume
                        break
                      case CatalogHookType.noCatalog:
                      case CatalogHookType.catalogedNoData:
                      case CatalogHookType.hooked:
                        model.AF.citySystem = datum.volume
                        break
                    }
                    break
                  case 'C4010':
                    switch (catalogHookRecord.AE) {
                      case CatalogHookType.nationalVertical:
                        model.AE.nv = datum.volume
                        break
                      case CatalogHookType.provincialVertical:
                        model.AE.pv = datum.volume
                        break
                      case CatalogHookType.noCatalog:
                      case CatalogHookType.catalogedNoData:
                      case CatalogHookType.hooked:
                        model.AE.citySystem = datum.volume
                        break
                    }
                    break
                  case 'C6010':
                    switch (catalogHookRecord.AC) {
                      case CatalogHookType.nationalVertical:
                        model.AC.nv = datum.volume
                        break
                      case CatalogHookType.provincialVertical:
                        model.AC.pv = datum.volume
                        break
                      case CatalogHookType.noCatalog:
                      case CatalogHookType.catalogedNoData:
                      case CatalogHookType.hooked:
                        model.AC.citySystem = datum.volume
                        break
                    }
                    break
                }
              }
            }

            caseVolumeModel.push(model)
          }

          await export_data_lake_own_depart_case_volume(caseVolumeModel)
              .catch(() => {
                window.$message.error('生成Excel失败')
                isGenerating.value = false
              })

        } catch (e) {
          window.$message.error('分析统计数据失败')
          window.$message.error(e)
          isGenerating.value = false
          buttonText.value = `生成Excel`
          console.log(e)
        }
      })
      .catch(() => {
        window.$message.error('分析统计数据失败')
        isGenerating.value = false
        buttonText.value = `生成Excel`
      })
      .finally(() => {
        isGenerating.value = false
        buttonText.value = `生成Excel`
      })
}

const syncZ2020Data = async () => {
  isGenerating.value = true
  buttonText.value = '正在同步执法主体信息...'

  return new Promise<void>((resolve, reject) => {
    datax_job_run({
      jobId: '1093',
      subsystemName: "采集"
    }).then(() => {
      const interval = setInterval(async () => {
        const schedJob: SchedJob = (await get_sched_job_page({
          current: 1,
          size: 1,
          jobContent: 'gx_lake_z2020'
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

const syncCaseVolumeData = async () => {
  isGenerating.value = true
  buttonText.value = '正在查询案件量信息...'

  const executeDcSql = new ExecuteDCSql(DC_Datasource.dataLake, 'mysql')

  await executeDcSql.execSql('truncate table xzzf_sjtj_data_lake_own_depart_case_volume', false)

  const insertSql = `
  INSERT INTO xzzf_sjtj_data_lake_own_depart_case_volume
    (table_type, own_depart_name, subject_name, volume, create_time)
SELECT 'C1010'       AS table_type,
       z2020.Z202001 AS own_depart_name,
       c1010.C101002 AS subject_name,
       COUNT(*)      AS volume,
       NOW()         AS create_time
FROM sztk_c1010 c1010
         LEFT JOIN sztk_z2020 z2020 ON c1010.Z202000 = z2020.Z202000
GROUP BY own_depart_name, subject_name
UNION ALL
SELECT 'C2010'       AS table_type,
       z2020.Z202001 AS own_depart_name,
       c2010.C201003 AS subject_name,
       COUNT(*)      AS volume,
       NOW()         AS create_time
FROM sztk_c2010 c2010
         LEFT JOIN sztk_z2020 z2020 ON c2010.Z202000 = z2020.Z202000
GROUP BY own_depart_name, subject_name
UNION ALL
SELECT 'C3010'       AS table_type,
       z2020.Z202001 AS own_depart_name,
       c3010.C301004 AS subject_name,
       COUNT(*)      AS volume,
       NOW()
FROM sztk_c3010 c3010
         LEFT JOIN sztk_z2020 z2020 ON c3010.Z202000 = z2020.Z202000
GROUP BY own_depart_name, subject_name
UNION ALL
SELECT 'C4010'       AS table_type,
       z2020.Z202001 AS own_depart_name,
       c4010.C401003 AS subject_name,
       COUNT(*)      AS volume,
       NOW()
FROM sztk_c4010 c4010
         LEFT JOIN sztk_z2020 z2020 ON c4010.Z202000 = z2020.Z202000
GROUP BY own_depart_name, subject_name
UNION ALL
SELECT 'C4110'       AS table_type,
       z2020.Z202001 AS own_depart_name,
       c4110.C411003 AS subject_name,
       COUNT(*)      AS volume,
       NOW()
FROM sztk_c4110 c4110
         LEFT JOIN sztk_z2020 z2020 ON c4110.Z202000 = z2020.Z202000
GROUP BY own_depart_name, subject_name
UNION ALL
SELECT 'C6010'       AS table_type,
       z2020.Z202001 AS own_depart_name,
       c6010.C601024 AS subject_name,
       COUNT(*)      AS volume,
       NOW()
FROM sztk_c6010 c6010
         LEFT JOIN sztk_z2020 z2020 ON c6010.Z202000 = z2020.Z202000
GROUP BY own_depart_name, subject_name`

  await executeDcSql.execSql(insertSql, false)

  return new Promise<void>((resolve, reject) => {
    const interval1 = setInterval(async () => {
      const record: string[][] = (await table_preview(12, `xzzf_sjtj_data_lake_own_depart_case_volume`)).data
      if (record.length == 1) {
        // 无数据
      } else {
        clearInterval(interval1)
        datax_job_run({
          jobId: '1094',
          subsystemName: "采集"
        }).then(() => {
          buttonText.value = '正在同步案件量信息...'

          const interval = setInterval(async () => {
            const schedJob: SchedJob = (await get_sched_job_page({
              current: 1,
              size: 1,
              jobContent: 'sjtj_data_lake_own_depart_case_volume'
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
</script>

<style scoped>

</style>
