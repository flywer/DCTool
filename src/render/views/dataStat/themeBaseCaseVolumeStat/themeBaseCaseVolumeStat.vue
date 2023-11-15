<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 110px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      数据会根据案件编号去重<br>
      案件量按数据所属单位统计
    </n-alert>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" @click="exportExcel" :loading="isGenerating">{{ buttonText }}</n-button>
    </n-space>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {CatalogHookData, DepartCaseVolumeExcelModel} from "@common/types/dataStat";
import {export_catalog_hook_data} from "@render/api/auxiliaryDb/departCatalogHookRecord.api";
import {execute_sql} from "@render/api/shareBase.api";
import {create_depart_case_volume_excel} from "@render/api/xlsx.api";
import {isEmpty} from "lodash-es";
import {ref} from "vue";

const isGenerating = ref(false)
const buttonText = ref('生成Excel')
const exportExcel = () => {
  isGenerating.value = true
  buttonText.value = '正在获取单位编目挂接信息...'

  export_catalog_hook_data()
      .then(async res => {
        if (res.success) {

          buttonText.value = '正在统计省直单位案件量...'
          // 统计省直单位案件量

          const provCaseVolumes = await new Promise<DepartCaseVolumeExcelModel[]>((resolve) => {
            resolve(getProvincialVolume())
          })

          const cityCaseVolumes = await new Promise<DepartCaseVolumeExcelModel[]>((resolve) => {
            resolve(getCityVolume(res.data))
          })

          buttonText.value = '正在生成导出文件...'

          await create_depart_case_volume_excel({
            provincialData: provCaseVolumes,
            cityData: cityCaseVolumes
          })
              .catch(() => {
                window.$message.error('生成Excel失败')
                isGenerating.value = false
              })

        } else {
          window.$message.error(res.message)
          buttonText.value = `生成Excel`
        }
      }).finally(() => {
    buttonText.value = `生成Excel`
    isGenerating.value = false
  })

}

const getProvincialVolume = async (): Promise<DepartCaseVolumeExcelModel[]> => {
  // 许可
  const provALData = (await execute_sql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C101001) AS 'volume'
          FROM gdsztk_c1010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME`))

  // 行政征收
  const provAEData = (await execute_sql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C401001) AS 'volume'
          FROM gdsztk_c4010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME;`))

  // 行政检查
  const provACData = (await execute_sql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C601001) AS 'volume'
          FROM gdsztk_c6010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME;`))

  // 行政处罚
  const provAPData = (await execute_sql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C201001) AS 'volume'
          FROM gdsztk_c2010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME;`))

  // 行政强制
  const provAFData = (await execute_sql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C401001) AS 'volume'
          FROM gdsztk_c4010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME;`))

  // 使用省垂
  const usePVDeparts = ['广东省交通运输厅 ', '广东省卫生健康委员会', '广东省应急管理厅']

  const mergeArray = mergeArrays(provALData, provAEData, provACData, provAPData, provAFData)

  const resultData: DepartCaseVolumeExcelModel[] = []

  mergeArray.forEach(depart => {
    if (usePVDeparts.includes(depart.departName)) {
      resultData.push({
        cityName: depart.departName,
        nv: 0,
        pv: depart.volume,
        yzf: 0,
        other: 0
      })
    } else {
      resultData.push({
        cityName: depart.departName,
        nv: 0,
        pv: 0,
        yzf: 0,
        other: depart.volume,
      })
    }
  })

  return resultData

}

interface Department {
  departName: string;
  volume: number;
}

const mergeArrays = (...arrays: Department[][]): Department[] => {
  const mergedMap = new Map<string, number>();

  // 遍历每个数组，将 volume 值相加
  for (const array of arrays) {
    for (const {
      departName,
      volume
    } of array) {
      if (mergedMap.has(departName)) {
        mergedMap.set(departName, mergedMap.get(departName)! + Number(volume));
      } else {
        mergedMap.set(departName, Number(volume));
      }
    }
  }

  // 将合并后的结果转为数组
  const mergedArray: Department[] = [];
  for (const [departName, volume] of mergedMap) {
    mergedArray.push({
      departName,
      volume
    });
  }

  return mergedArray;
}

const getCityVolume = async (catalogHookData: CatalogHookData[]) => {
  const cityCaseVolumes: DepartCaseVolumeExcelModel[] = []

  for (const city of catalogHookData) {
    buttonText.value = `正在统计${city.cityName}信息...`

    // 统计国垂
    const nvSql = `SELECT
        (${isEmpty(city.AL.nationalVertical) ? '0' :
        `SELECT COUNT(DISTINCT C101001)
        FROM gdsztk_c1010
        WHERE OPT_SUBJECT_NAME IN (${city.AL.nationalVertical.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AP.nationalVertical) ? '0' :
        `SELECT COUNT(DISTINCT C201001)
        FROM gdsztk_c2010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.nationalVertical.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AF.nationalVertical) ? '0' :
        `SELECT COUNT(DISTINCT C301003)
        FROM gdsztk_c3010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.nationalVertical.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AE.nationalVertical) ? '0' :
        `SELECT COUNT(DISTINCT C401001)
        FROM gdsztk_c4010
        WHERE OPT_SUBJECT_NAME IN (${city.AE.nationalVertical.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AC.nationalVertical) ? '0' :
        `SELECT COUNT(DISTINCT C601001)
        FROM gdsztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.nationalVertical.map(department => `'${department}'`).join(',')})`}) AS 'volume'`
    const nv = (await execute_sql(nvSql))[0].volume

    // 统计省垂
    const pvSql = `SELECT
        (${isEmpty(city.AL.provincialVertical) ? '0' :
        `SELECT COUNT(DISTINCT C101001)
        FROM gdsztk_c1010
        WHERE OPT_SUBJECT_NAME IN (${city.AL.provincialVertical.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AP.provincialVertical) ? '0' :
        `SELECT COUNT(DISTINCT C201001)
        FROM gdsztk_c2010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.provincialVertical.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AF.provincialVertical) ? '0' :
        `SELECT COUNT(DISTINCT C301003)
        FROM gdsztk_c3010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.provincialVertical.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AE.provincialVertical) ? '0' :
        `SELECT COUNT(DISTINCT C401001)
        FROM gdsztk_c4010
        WHERE OPT_SUBJECT_NAME IN (${city.AE.provincialVertical.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AC.provincialVertical) ? '0' :
        `SELECT COUNT(DISTINCT C601001)
        FROM gdsztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.provincialVertical.map(department => `'${department}'`).join(',')})`}) AS 'volume'`
    const pv = (await execute_sql(pvSql))[0].volume

    // 统计粤执法
    const yzfSql = `SELECT
        (${isEmpty(city.AL.yzf) ? '0' :
        `SELECT COUNT(DISTINCT C101001)
        FROM gdsztk_c1010
        WHERE OPT_SUBJECT_NAME IN (${city.AL.yzf.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AP.yzf) ? '0' :
        `SELECT COUNT(DISTINCT C201001)
        FROM gdsztk_c2010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.yzf.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AF.yzf) ? '0' :
        `SELECT COUNT(DISTINCT C301003)
        FROM gdsztk_c3010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.yzf.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AE.yzf) ? '0' :
        `SELECT COUNT(DISTINCT C401001)
        FROM gdsztk_c4010
        WHERE OPT_SUBJECT_NAME IN (${city.AE.yzf.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AC.yzf) ? '0' :
        `SELECT COUNT(DISTINCT C601001)
        FROM gdsztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.yzf.map(department => `'${department}'`).join(',')})`}) AS 'volume'`
    const yzf = (await execute_sql(yzfSql))[0].volume

    // 统计其他
    const otherSql = `SELECT
        (${isEmpty(city.AL.other) ? '0' :
        `SELECT COUNT(DISTINCT C101001)
        FROM gdsztk_c1010
        WHERE OPT_SUBJECT_NAME IN (${city.AL.other.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AP.other) ? '0' :
        `SELECT COUNT(DISTINCT C201001)
        FROM gdsztk_c2010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.other.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AF.other) ? '0' :
        `SELECT COUNT(DISTINCT C301003)
        FROM gdsztk_c3010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.other.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AE.other) ? '0' :
        `SELECT COUNT(DISTINCT C401001)
        FROM gdsztk_c4010
        WHERE OPT_SUBJECT_NAME IN (${city.AE.other.map(department => `'${department}'`).join(',')})`}) +
        (${isEmpty(city.AC.other) ? '0' :
        `SELECT COUNT(DISTINCT C601001)
        FROM gdsztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.other.map(department => `'${department}'`).join(',')})`}) AS 'volume'`
    const other = (await execute_sql(otherSql))[0].volume

    cityCaseVolumes.push({
      cityName: city.cityName,
      nv: parseInt(nv),
      pv: parseInt(pv),
      yzf: parseInt(yzf),
      other: parseInt(other)
    })
  }

  return cityCaseVolumes
}
</script>

<style scoped>

</style>
