<template>
  <n-scrollbar style="height: calc(100vh - 110px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      统计规则：<br>
      1.数据根据<b>案件编号</b>去重<br>
      2.案件量按照<b>数据所属单位</b>维度统计
    </n-alert>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" @click="exportExcel" :loading="isGenerating">{{ buttonText }}</n-button>
    </n-space>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {
  CatalogHookData,
  CityDepartCaseVolumeExcelModel,
  ProvincialDepartCaseVolumeExcelModel
} from "@common/types/dataStat";
import {export_catalog_hook_data} from "@render/api/auxiliaryDb/departCatalogHookRecord.api";
import {table_preview} from "@render/api/datacenter.api";
import {create_depart_case_volume_excel} from "@render/api/xlsx.api";
import {ExecuteDCSql} from "@render/utils/datacenter/ExecuteDCSql";
import {isEmpty} from "lodash-es";
import {ref} from "vue";

interface DepartVolume {
  departName: string;
  volume: number;
}

const isGenerating = ref(false)
const buttonText = ref('生成Excel')
const exportExcel = () => {
  isGenerating.value = true
  buttonText.value = '正在获取单位编目挂接信息...'

  export_catalog_hook_data()
      .then(async res => {
        if (res.success) {

          const provCaseVolumes = await createProvincialVolumeModel()

          const cityCaseVolumes = await createCityVolumeModel(res.data)

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

/**
 *  统计省直单位案件量
 **/
const createProvincialVolumeModel = async (): Promise<ProvincialDepartCaseVolumeExcelModel[]> => {
  buttonText.value = '正在统计省直单位案件量...'

  // 许可

  const provALData = await getProvincialVolumeBySql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C101001) AS 'volume'
          FROM sztk_c1010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME`, 200)

  // 行政征收
  const provAEData = await getProvincialVolumeBySql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C401001) AS 'volume'
          FROM sztk_c4010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME`, 200)

  // 行政检查
  const provACData = await getProvincialVolumeBySql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C601001) AS 'volume'
          FROM sztk_c6010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME`, 200)

  // 行政处罚
  const provAPData = await getProvincialVolumeBySql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C201001) AS 'volume'
          FROM sztk_c2010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME`, 200)

  // 行政强制
  const provAFData = await getProvincialVolumeBySql(`
          SELECT OPT_SUBJECT_NAME AS 'departName', COUNT(DISTINCT C401001) AS 'volume'
          FROM sztk_c4010
          WHERE OPT_AREA_CODE = '440000000'
          GROUP BY OPT_SUBJECT_NAME`, 200)

  // 使用省垂
  const usePVDeparts = ['广东省交通运输厅 ', '广东省卫生健康委员会', '广东省应急管理厅']

  const mergeArray = mergeArrays(provALData, provAEData, provACData, provAPData, provAFData)

  const resultData: ProvincialDepartCaseVolumeExcelModel[] = []

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

/**
 * 获取地市单位案件量
 **/
const getProvincialVolumeBySql = async (sql: string, limitNum?: number): Promise<DepartVolume[]> => {
  const executeDcSql = new ExecuteDCSql('8', 'mysql')

  await executeDcSql.execSql('truncate table xzzf_sjtj_theme_base_case_volume', false)

  await executeDcSql.execSql('insert into xzzf_sjtj_theme_base_case_volume\n' + sql, false)

  const record: string[][] = (await table_preview(8, 'xzzf_sjtj_theme_base_case_volume', limitNum)).data

  const volumes = record.slice(1, record.length)

  return volumes.map(value => ({
    departName: value.at(0),
    volume: parseInt(value.at(1))
  }))
}

const mergeArrays = (...arrays: DepartVolume[][]): DepartVolume[] => {
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
  const mergedArray: DepartVolume[] = [];
  for (const [departName, volume] of mergedMap) {
    mergedArray.push({
      departName,
      volume
    });
  }

  return mergedArray;
}

/**
 * 生成地市案件量ExcelModel
 **/
const createCityVolumeModel = async (catalogHookData: CatalogHookData[]) => {
  const cityCaseVolumes: CityDepartCaseVolumeExcelModel[] = []

  for (const city of catalogHookData) {
    buttonText.value = `正在统计${city.cityName}信息...`

    let model: CityDepartCaseVolumeExcelModel = new CityDepartCaseVolumeExcelModel()

    // region 行政许可
    let alSql = ''

    if (isEmpty(city.AL.nationalVertical)) {
      alSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      alSql += `SELECT '${city.cityName}',COUNT(DISTINCT C101001) AS volume
        FROM sztk_c1010
        WHERE OPT_SUBJECT_NAME IN (${city.AL.nationalVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AL.provincialVertical)) {
      alSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      alSql += `SELECT '${city.cityName}',COUNT(DISTINCT C101001) AS volume
        FROM sztk_c1010
        WHERE OPT_SUBJECT_NAME IN (${city.AL.provincialVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AL.citySystem)) {
      alSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      alSql += `SELECT '${city.cityName}',COUNT(DISTINCT C101001) AS volume
        FROM sztk_c1010
        WHERE OPT_SUBJECT_NAME IN (${city.AL.citySystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AL.noSystem)) {
      alSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      alSql += `SELECT '${city.cityName}',COUNT(DISTINCT C101001) AS volume
        FROM sztk_c1010
        WHERE OPT_SUBJECT_NAME IN (${city.AL.noSystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AL.noData)) {
      alSql += `SELECT '${city.cityName}',0 AS volume \n`
    } else {
      alSql += `SELECT '${city.cityName}',COUNT(DISTINCT C101001) AS volume
        FROM sztk_c1010
        WHERE OPT_SUBJECT_NAME IN (${city.AL.noData.map(department => `'${department}'`).join(',')}) \n`
    }

    const al = await getCityVolumeBySql(alSql)

    model.AL = {
      nv: {
        departCount: city.AL.nationalVertical.length,
        caseVolume: parseInt(al[0])
      },
      pv: {
        departCount: city.AL.provincialVertical.length,
        caseVolume: parseInt(al[1])
      },
      citySystem: {
        departCount: city.AL.citySystem.length,
        caseVolume: parseInt(al[2])
      },
      noSystem: {
        departCount: city.AL.noSystem.length,
        caseVolume: parseInt(al[3])
      },
      noData: {
        departCount: city.AL.noData.length,
        caseVolume: parseInt(al[4])
      }
    }

    // endregion

    // region 行政征收
    let aeSql = ''

    if (isEmpty(city.AE.nationalVertical)) {
      aeSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      aeSql += `SELECT '${city.cityName}',COUNT(DISTINCT C401001) AS volume
        FROM sztk_c4010
        WHERE OPT_SUBJECT_NAME IN (${city.AE.nationalVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AE.provincialVertical)) {
      aeSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      aeSql += `SELECT '${city.cityName}',COUNT(DISTINCT C401001) AS volume
        FROM sztk_c4010
        WHERE OPT_SUBJECT_NAME IN (${city.AE.provincialVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AE.citySystem)) {
      aeSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      aeSql += `SELECT '${city.cityName}',COUNT(DISTINCT C401001) AS volume
        FROM sztk_c4010
        WHERE OPT_SUBJECT_NAME IN (${city.AE.citySystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AE.noSystem)) {
      aeSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      aeSql += `SELECT '${city.cityName}',COUNT(DISTINCT C401001) AS volume
        FROM sztk_c4010
        WHERE OPT_SUBJECT_NAME IN (${city.AE.noSystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AE.noData)) {
      aeSql += `SELECT '${city.cityName}',0 AS volume \n`
    } else {
      aeSql += `SELECT '${city.cityName}',COUNT(DISTINCT C401001) AS volume
        FROM sztk_c4010
        WHERE OPT_SUBJECT_NAME IN (${city.AE.noData.map(department => `'${department}'`).join(',')}) \n`
    }

    const ae = await getCityVolumeBySql(aeSql)

    model.AE = {
      nv: {
        departCount: city.AE.nationalVertical.length,
        caseVolume: parseInt(ae[0])
      },
      pv: {
        departCount: city.AE.provincialVertical.length,
        caseVolume: parseInt(ae[1])
      },
      citySystem: {
        departCount: city.AE.citySystem.length,
        caseVolume: parseInt(ae[2])
      },
      noSystem: {
        departCount: city.AE.noSystem.length,
        caseVolume: parseInt(ae[3])
      },
      noData: {
        departCount: city.AE.noData.length,
        caseVolume: parseInt(ae[4])
      }
    }

    // endregion

    // region 行政征用
    model.AR = {
      nv: {
        departCount: 0,
        caseVolume: 0
      },
      pv: {
        departCount: 0,
        caseVolume: 0
      },
      citySystem: {
        departCount: 0,
        caseVolume: 0
      },
      noSystem: {
        departCount: 0,
        caseVolume: 0
      },
      noData: {
        departCount: 0,
        caseVolume: 0
      }
    }

    // endregion

    // region 行政检查
    let acSql = ''

    if (isEmpty(city.AC.nationalVertical)) {
      acSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      acSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.nationalVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AC.provincialVertical)) {
      acSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      acSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.provincialVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AC.citySystem)) {
      acSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      acSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.citySystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AC.noSystem)) {
      acSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      acSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.noSystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AC.noData)) {
      acSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      acSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.noData.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AC.yzf)) {
      acSql += `SELECT '${city.cityName}',0 AS volume \n`
    } else {
      acSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AC.yzf.map(department => `'${department}'`).join(',')}) \n`
    }
    const ac = await getCityVolumeBySql(acSql)

    model.AC = {
      nv: {
        departCount: city.AC.nationalVertical.length,
        caseVolume: parseInt(ac[0])
      },
      pv: {
        departCount: city.AC.provincialVertical.length,
        caseVolume: parseInt(ac[1])
      },
      citySystem: {
        departCount: city.AC.citySystem.length,
        caseVolume: parseInt(ac[2])
      },
      noSystem: {
        departCount: city.AC.noSystem.length,
        caseVolume: parseInt(ac[3])
      },
      noData: {
        departCount: city.AC.noData.length,
        caseVolume: parseInt(ac[4])
      }
    }

    // endregion

    // region 行政处罚
    let apSql = ''

    if (isEmpty(city.AP.nationalVertical)) {
      apSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      apSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.nationalVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AP.provincialVertical)) {
      apSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      apSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.provincialVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AP.citySystem)) {
      apSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      apSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.citySystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AP.noSystem)) {
      apSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      apSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.noSystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AP.noData)) {
      apSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      apSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.noData.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AP.yzf)) {
      apSql += `SELECT '${city.cityName}',0 AS volume \n`
    } else {
      apSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AP.yzf.map(department => `'${department}'`).join(',')}) \n`
    }
    const ap = await getCityVolumeBySql(apSql)

    model.AP = {
      nv: {
        departCount: city.AP.nationalVertical.length,
        caseVolume: parseInt(ap[0])
      },
      pv: {
        departCount: city.AP.provincialVertical.length,
        caseVolume: parseInt(ap[1])
      },
      citySystem: {
        departCount: city.AP.citySystem.length,
        caseVolume: parseInt(ap[2])
      },
      noSystem: {
        departCount: city.AP.noSystem.length,
        caseVolume: parseInt(ap[3])
      },
      noData: {
        departCount: city.AP.noData.length,
        caseVolume: parseInt(ap[4])
      }
    }

    // endregion

    // region 行政强制
    let afSql = ''

    if (isEmpty(city.AF.nationalVertical)) {
      afSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      afSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.nationalVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AF.provincialVertical)) {
      afSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      afSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.provincialVertical.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AF.citySystem)) {
      afSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      afSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.citySystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AF.noSystem)) {
      afSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      afSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.noSystem.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }
    if (isEmpty(city.AF.noData)) {
      afSql += `SELECT '${city.cityName}',0 AS volume UNION ALL\n`
    } else {
      afSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.noData.map(department => `'${department}'`).join(',')}) UNION ALL\n`
    }

    if (isEmpty(city.AF.yzf)) {
      afSql += `SELECT '${city.cityName}',0 AS volume \n`
    } else {
      afSql += `SELECT '${city.cityName}',COUNT(DISTINCT C601001) AS volume
        FROM sztk_c6010
        WHERE OPT_SUBJECT_NAME IN (${city.AF.yzf.map(department => `'${department}'`).join(',')}) \n`
    }
    const af = await getCityVolumeBySql(afSql)

    model.AF = {
      nv: {
        departCount: city.AF.nationalVertical.length,
        caseVolume: parseInt(af[0])
      },
      pv: {
        departCount: city.AF.provincialVertical.length,
        caseVolume: parseInt(af[1])
      },
      citySystem: {
        departCount: city.AF.citySystem.length,
        caseVolume: parseInt(af[2])
      },
      noSystem: {
        departCount: city.AF.noSystem.length,
        caseVolume: parseInt(af[3])
      },
      noData: {
        departCount: city.AF.noData.length,
        caseVolume: parseInt(af[4])
      }
    }

    // endregion

    // region 粤执法
    model.yzf = {
      AC: {
        departCount: city.AC.yzf.length,
        caseVolume: parseInt(af[5])
      },
      AP: {
        departCount: city.AP.yzf.length,
        caseVolume: parseInt(ap[5])
      },
      AF: {
        departCount: city.AF.yzf.length,
        caseVolume: parseInt(af[5])
      }
    }
    // endregion

    model.cityName = city.cityName
    model.departCount = city.departCount
    model.caseTotalVolume = calculateTotalCaseVolume(model)

    cityCaseVolumes.push(model)
  }

  return cityCaseVolumes
}

/**
 * 获取地市单位案件量
 **/
const getCityVolumeBySql = async (sql: string, limitNum?: number): Promise<string[]> => {
  const executeDcSql = new ExecuteDCSql('8', 'mysql')

  await executeDcSql.execSql('truncate table xzzf_sjtj_theme_base_case_volume', false)

  await executeDcSql.execSql('insert into xzzf_sjtj_theme_base_case_volume\n' + sql, false)

  const record: string[][] = (await table_preview(8, 'xzzf_sjtj_theme_base_case_volume', limitNum)).data

  const volumes = record.slice(1, record.length)
  console.log(volumes)
  return volumes.map(value => value.at(1))
}

/**
 * 计算合计
 **/
const calculateTotalCaseVolume = (data: CityDepartCaseVolumeExcelModel): number => {
  let totalVolume = 0;

  // 遍历 AL
  totalVolume += data.AL.nv.caseVolume;
  totalVolume += data.AL.pv.caseVolume;
  totalVolume += data.AL.citySystem.caseVolume;
  totalVolume += data.AL.noSystem.caseVolume;
  // totalVolume += data.AL.noData.caseVolume;

  // 遍历 AE
  totalVolume += data.AE.nv.caseVolume;
  totalVolume += data.AE.pv.caseVolume;
  totalVolume += data.AE.citySystem.caseVolume;
  totalVolume += data.AE.noSystem.caseVolume;
  // totalVolume += data.AE.noData.caseVolume;

  // 遍历 AR
  totalVolume += data.AR.nv.caseVolume;
  totalVolume += data.AR.pv.caseVolume;
  totalVolume += data.AR.citySystem.caseVolume;
  totalVolume += data.AR.noSystem.caseVolume;
  // totalVolume += data.AR.noData.caseVolume;

  // 遍历 yzf
  totalVolume += data.yzf.AC.caseVolume;
  totalVolume += data.yzf.AP.caseVolume;
  // totalVolume += data.yzf.AF.caseVolume;

  // 遍历 AC
  totalVolume += data.AC.nv.caseVolume;
  totalVolume += data.AC.pv.caseVolume;
  totalVolume += data.AC.citySystem.caseVolume;
  totalVolume += data.AC.noSystem.caseVolume;
  // totalVolume += data.AC.noData.caseVolume;

  // 遍历 AP
  totalVolume += data.AP.nv.caseVolume;
  totalVolume += data.AP.pv.caseVolume;
  totalVolume += data.AP.citySystem.caseVolume;
  totalVolume += data.AP.noSystem.caseVolume;
  // totalVolume += data.AP.noData.caseVolume;

  // 遍历 AF
  totalVolume += data.AF.nv.caseVolume;
  totalVolume += data.AF.pv.caseVolume;
  totalVolume += data.AF.citySystem.caseVolume;
  totalVolume += data.AF.noSystem.caseVolume;
  // totalVolume += data.AF.noData.caseVolume;

  return totalVolume;
}
</script>

<style scoped>

</style>
