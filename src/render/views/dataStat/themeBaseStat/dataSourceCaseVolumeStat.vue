<template>
  <n-alert type="default" :show-icon="false">
    统计规则：<br>
    1.数据根据<b>主键ID</b>去重<br>
    2.案件量按照<b>数据编目挂接单位</b>维度统计
  </n-alert>

  <n-space justify="center" align="center" class="mt-2">
    <n-button type="primary" @click="exportExcel" :loading="isGenerating">{{ buttonText }}</n-button>
  </n-space>
</template>

<script setup lang="ts">
import {SchedJob} from "@common/types/datacenter/dataCollection";
import {datax_job_run, get_sched_job_page} from "@render/api/datacenter.api";
import {get_theme_base_data_source_case_volume} from "@render/api/front.api";
import {export_data_source_depart_case_volume} from "@render/api/xlsx.api";
import {ExecuteDCSql} from "@render/utils/datacenter/ExecuteDCSql";
import {ref} from "vue";

const isGenerating = ref(false)
const buttonText = ref('生成Excel')

const exportExcel = () => {
  isGenerating.value = true
  buttonText.value = '正在统计数据...'

  const executeDcSql = new ExecuteDCSql('8', 'mysql')

  const sql = `
  INSERT INTO data_source_case_volume
  SELECT UUID(), 'c1010',COUNT(DISTINCT C101000), C101037, GROUP_CONCAT( DISTINCT C101039), NOW() FROM sztk_c1010 GROUP BY C101037 UNION ALL
  SELECT UUID(), 'c2010',COUNT(DISTINCT C201000), C201029, GROUP_CONCAT(DISTINCT C201031), NOW() FROM  sztk_c2010 GROUP BY C201029 UNION ALL
  SELECT UUID(), 'c3010',COUNT(DISTINCT C301000), C301017, GROUP_CONCAT(DISTINCT C301019), NOW() FROM  sztk_c3010 GROUP BY C301017 UNION ALL
  SELECT UUID(), 'c4010',COUNT(DISTINCT C401000), C401021, GROUP_CONCAT(DISTINCT C401023), NOW() FROM  sztk_c4010 GROUP BY C401021 UNION ALL
  SELECT UUID(), 'c4110',COUNT(DISTINCT C411000), C411022, GROUP_CONCAT(DISTINCT C411024), NOW() FROM  sztk_c4110 GROUP BY C411022 UNION ALL
  SELECT UUID(), 'c6010',COUNT(DISTINCT C601000), C601039, GROUP_CONCAT(DISTINCT C601041), NOW() FROM  sztk_c6010 GROUP BY C601039`

  executeDcSql.execSql(sql, false).then(() => {

    setTimeout(() => {
      datax_job_run({
        jobId: '1077',
        subsystemName: "采集"
      }).then(() => {

        const interval = setInterval(async () => {
          const schedJob: SchedJob = (await get_sched_job_page({
            current: 1,
            size: 1,
            jobContent: 'sjtj_theme_base_data_source_case_volume'
          })).data?.records[0]

          if (schedJob.handleStatus != 0) {
            clearInterval(interval); // 停止循环
            if (schedJob.handleStatus == 200) {
              await createExcelModel()
            } else {
              window.$message.error(`[${schedJob.jobContent}]执行异常`)
              isGenerating.value = false
              buttonText.value = '生成Excel'
            }
          }
        }, 1000)

      })

    }, 3000)
  }).catch(() => {
    isGenerating.value = false
    buttonText.value = '生成Excel'
  })

}

const createExcelModel = async () => {
  buttonText.value = '正在生成Excel...'

  const data = await get_theme_base_data_source_case_volume()

  const provincialData = data.filter(record => record.departName.startsWith('广东省'))
  const cityData = data.filter(record => !record.departName.startsWith('广东省'))

  export_data_source_depart_case_volume(provincialData, cityData)
      .catch(() => {
        window.$message.error('生成Excel失败')
      })
      .finally(() => {
        isGenerating.value = false
        buttonText.value = '生成Excel'
      })
}

</script>

<style scoped>

</style>
