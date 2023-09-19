<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 110px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      统计各单位前置机（去重后）、数据湖、主题库数据量<br>
      因数据库与数据限制，目前只能全量统计，无法选择部门
    </n-alert>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" class="w-28" @click="generateData" :loading="isGenerating">生成Excel</n-button>
    </n-space>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {DepartDataVolExcelDataType} from "@common/types";
import {get_all_FE_TableName} from "@render/api/auxiliaryDb/preDatabase.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {
  get_data_lake_data_vol_by_depart_name_and_table_type,
  get_FE_data_vol_by_depart_name_and_table_type, get_theme_base_data_vol_by_depart_name_and_table_type
} from "@render/api/front.api";
import {create_depart_data_vol_excel} from "@render/api/xlsx.api";
import {basicTableNames} from "@render/utils/datacenter/constants";
import {ref} from "vue";

const isGenerating = ref(false)
const generateData = () => {

  isGenerating.value = true

  const excelDataArr: DepartDataVolExcelDataType[] = []

  // 获取单位表名关联数据
  get_all_FE_TableName().then(async departs => {
    for (const depart of departs) {
      // 过滤基础数据
      if (!basicTableNames.includes(depart.tableType.toLowerCase())) {
        const dataRow: DepartDataVolExcelDataType = {
          departName: depart.departName,
          tableType: depart.tableType,
          tableComment: (await get_table_sql({tableName: depart.tableType}))[0].comment,
          feTableName: depart.tableName,
          feDataCount: (await get_FE_data_vol_by_depart_name_and_table_type(depart.departName, depart.tableType))?.dataCount || '0',
          dataLakeDataCount: (await get_data_lake_data_vol_by_depart_name_and_table_type(depart.departName, depart.tableType))?.dataCount || '0',
          themeBaseDataCount: (await get_theme_base_data_vol_by_depart_name_and_table_type(depart.departName, depart.tableType))?.dataCount || '0',
        }

        excelDataArr.push(dataRow)
      }
    }

    excelDataArr.sort((a, b) => {
      // 先按 departName 进行排序
      const departNameComparison = a.departName.localeCompare(b.departName);
      if (departNameComparison !== 0) {
        return departNameComparison;
      }

      // departName 相同时，按 tableType 进行排序
      return a.tableType.localeCompare(b.tableType);
    })

    // 生成Excel
    create_depart_data_vol_excel(excelDataArr).catch(() => {
      window.$message.error('生成Excel失败')
      isGenerating.value = false
    })

  }).catch(() => {
    window.$message.error('获取单位表名关联数据失败')
    isGenerating.value = false
  }).finally(() => isGenerating.value = false)

}
</script>

<style scoped>

</style>
