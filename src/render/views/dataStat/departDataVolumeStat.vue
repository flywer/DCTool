<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 110px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      统计各单位备份表（去重后）、数据湖、主题库数据量<br>
      因数据库与数据限制，目前只能全量统计，无法选择部门
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
import {DepartDataVolExcelModel} from "@common/types/dataStat";
import {get_all_FE_TableName} from "@render/api/auxiliaryDb/preDatabase.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {
  get_data_lake_data_vol_by_depart_name_and_table_type,
  get_FE_data_vol_by_depart_name_and_table_type, get_theme_base_data_vol_by_depart_name_and_table_type
} from "@render/api/front.api";
import {create_depart_data_vol_excel} from "@render/api/xlsx.api";
import {projectIdOptions} from "@render/typings/datacenterOptions";
import {formatDate2Day} from "@render/utils/common/dateUtils";
import {isBasicTable} from "@render/utils/common/isBasicTable";
import {basicTableNames} from "@render/utils/datacenter/constants";
import {isNull} from "lodash-es";
import {onMounted, ref} from "vue";

// 数据过滤
const filterData = ref([])

const isGenerating = ref(false)
const buttonText = ref('生成Excel')

const generateData = () => {

  isGenerating.value = true
  buttonText.value = '获取单位表名关联信息...'

  const basicDataArr: DepartDataVolExcelModel[] = []
  const actionDataArr: DepartDataVolExcelModel[] = []

  // 获取单位表名关联数据
  get_all_FE_TableName().then(async departs => {
    try {
      for (const depart of departs) {
        buttonText.value = `处理${depart.departName}数据...`

        const feDataRecord = await get_FE_data_vol_by_depart_name_and_table_type(depart.departName, depart.tableType)

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

const getProjectIdByDepartName = (departName: string): string => {
  const project = projectIdOptions.find(project => {
    const name = (project.label as string).replaceAll('数据归集', '').replaceAll('行政行为', '')
    return name == departName;
  })

  return project?.value as string
}

</script>

<style scoped>

</style>
