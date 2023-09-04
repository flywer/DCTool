<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 165px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      生成用于查询前置机行为数据表<b>数据总量</b>与<b>案件量</b>的SQL
    </n-alert>

    <n-card class="mt-2" :content-style="{paddingBottom:0}" :size="'small'">
      <n-grid :cols="4" :x-gap="12">
        <n-form-item-gi span="2" label="单位选择">
          <n-tree-select
              v-model:value="formModel.departIds"
              multiple
              cascade
              checkable
              :check-strategy="'child'"
              :options="departOptionsRef"
              :size="'small'"
              clearable
          />
        </n-form-item-gi>

        <n-form-item-gi :span="2" label="时间范围">
          <n-date-picker v-model:value="formModel.timeRange" type="datetimerange"/>
        </n-form-item-gi>
      </n-grid>
    </n-card>

    <n-space class="mt-2" justify="center" align="center">
      <n-button class="w-28" type="primary" :disabled="formModel.departIds.length===0" @click="buildSql"
                :loading="isBuildSql"
      >
        SQL生成
      </n-button>
      <n-button class="w-28 float-right" :disabled="sqlRef.length===0" @click="copyText(sqlRef)">
        复制结果
      </n-button>
    </n-space>

    <n-input
        v-model:value="sqlRef"
        class="mt-2"
        type="textarea"
        placeholder=""
        readonly
        :autosize="{ minRows:4,maxRows:15 }"
    />
  </n-scrollbar>
</template>

<script setup lang="ts">
import {get_pre_database_depart, get_pre_database_table_info_json} from "@render/api/auxiliaryDb/preDatabase.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {copyText} from "@render/utils/common/clipboard";
import {formatDate, getFirstDayOfMonth} from "@render/utils/common/dateUtils";
import {TreeSelectOption} from "naive-ui";
import {format} from "sql-formatter";
import {onMounted, ref} from "vue";

const departOptionsRef = ref<TreeSelectOption[]>([])

const formModel = ref({
  departIds: [],
  timeRange: [getFirstDayOfMonth(), new Date()],
})

const sqlRef = ref('')

onMounted(() => {
  departOptionsInit()
})

const departOptionsInit = async () => {
  const departs = await get_pre_database_depart()

  departOptionsRef.value = [
    {
      label: '所有单位',
      key: 'all',
      children: [
        {
          label: '省级部门',
          key: 'prov',
          children: []
        },
        {
          label: '地市单位',
          key: 'city',
          children: []
        }
      ]
    }
  ]

  departOptionsRef.value[0].children[0].children = departs.filter((depart: { departName: string; }) => depart.departName.startsWith('广东省')).map((v => ({
    label: v.departName,
    key: v.id.toString()
  })))

  departOptionsRef.value[0].children[1].children = departs.filter((depart: { departName: string; }) => depart.departName.startsWith('广东省') == false).map((v => ({
    label: v.departName,
    key: v.id.toString()
  })))
}

const isBuildSql = ref(false)

type TableInfoType = {
  tableAbbr: string,
  tableName: string,
  region: string,
  cdBatch: string
}

const buildSql = async () => {
  isBuildSql.value = true

  let sql = ''

  const timeRange = timeRangeConvert(formModel.value.timeRange)

  for (const departId of formModel.value.departIds) {

    const tableInfo = await get_pre_database_table_info_json(departId)

    const tableInfoJson: TableInfoType[] = JSON.parse(tableInfo.tableInfoJson)

    // 行政许可基本信息
    if (tableInfoJson.some(table => table.tableAbbr.toLowerCase() === 'c1010')) {

      const c1010 = tableInfoJson.filter(table => table.tableAbbr.toLowerCase() === 'c1010')[0]

      const primId = (await get_table_sql({tableName: c1010.tableAbbr.toUpperCase()}))[0].pColName as string

      let templateSql = `SELECT '${tableInfo.departName}' AS '单位名称', '行政许可案件数量' AS '数据类型', COUNT(DISTINCT (${primId})) AS '数量'
                         FROM ${c1010.tableName}
                         WHERE cd_time >= '${timeRange[0]}'
                           AND cd_time <= '${timeRange[1]}'
                         UNION ALL `
      sql += templateSql
    }

    // 行政处罚基本信息
    if (tableInfoJson.some(table => table.tableAbbr.toLowerCase() === 'c2010')) {

      const c2010 = tableInfoJson.filter(table => table.tableAbbr.toLowerCase() === 'c2010')[0]

      const primId = (await get_table_sql({tableName: c2010.tableAbbr.toUpperCase()}))[0].pColName as string

      let templateSql = `SELECT '${tableInfo.departName}' AS '单位名称', '行政处罚案件数量' AS '数据类型', COUNT(DISTINCT (${primId})) AS '数量'
                         FROM ${c2010.tableName}
                         WHERE cd_time >= '${timeRange[0]}'
                           AND cd_time <= '${timeRange[1]}'
                         UNION ALL `
      sql += templateSql
    }

    // 行政强制基本信息
    if (tableInfoJson.some(table => table.tableAbbr.toLowerCase() === 'c3010')) {

      const c3010 = tableInfoJson.filter(table => table.tableAbbr.toLowerCase() === 'c3010')[0]

      const primId = (await get_table_sql({tableName: c3010.tableAbbr.toUpperCase()}))[0].pColName as string

      let templateSql = `SELECT '${tableInfo.departName}' AS '单位名称', '行政强制案件数量' AS '数据类型', COUNT(DISTINCT (${primId})) AS '数量'
                         FROM ${c3010.tableName}
                         WHERE cd_time >= '${timeRange[0]}'
                           AND cd_time <= '${timeRange[1]}'
                         UNION ALL `
      sql += templateSql
    }

    // 行政征收基本信息
    if (tableInfoJson.some(table => table.tableAbbr.toLowerCase() === 'c4010')) {

      const c4010 = tableInfoJson.filter(table => table.tableAbbr.toLowerCase() === 'c4010')[0]

      const primId = (await get_table_sql({tableName: c4010.tableAbbr.toUpperCase()}))[0].pColName as string

      let templateSql = `SELECT '${tableInfo.departName}' AS '单位名称', '行政征收案件数量' AS '数据类型', COUNT(DISTINCT (${primId})) AS '数量'
                         FROM ${c4010.tableName}
                         WHERE cd_time >= '${timeRange[0]}'
                           AND cd_time <= '${timeRange[1]}'
                         UNION ALL `
      sql += templateSql
    }

    // 行政征用基本信息
    if (tableInfoJson.some(table => table.tableAbbr.toLowerCase() === 'c4110')) {

      const c4110 = tableInfoJson.filter(table => table.tableAbbr.toLowerCase() === 'c4110')[0]

      const primId = (await get_table_sql({tableName: c4110.tableAbbr.toUpperCase()}))[0].pColName as string

      let templateSql = `SELECT '${tableInfo.departName}' AS '单位名称', '行政征用案件数量' AS '数据类型', COUNT(DISTINCT (${primId})) AS '数量'
                         FROM ${c4110.tableName}
                         WHERE cd_time >= '${timeRange[0]}'
                           AND cd_time <= '${timeRange[1]}'
                         UNION ALL `
      sql += templateSql
    }

    // 行政检查基本信息
    if (tableInfoJson.some(table => table.tableAbbr.toLowerCase() === 'c6010')) {

      const c6010 = tableInfoJson.filter(table => table.tableAbbr.toLowerCase() === 'c6010')[0]

      const primId = (await get_table_sql({tableName: c6010.tableAbbr.toUpperCase()}))[0].pColName as string

      let templateSql = `SELECT '${tableInfo.departName}' AS '单位名称', '行政检查案件数量' AS '数据类型', COUNT(DISTINCT (${primId})) AS '数量'
                         FROM ${c6010.tableName}
                         WHERE cd_time >= '${timeRange[0]}'
                           AND cd_time <= '${timeRange[1]}'
                         UNION ALL `
      sql += templateSql
    }

    for (const table of tableInfoJson) {

      const tableSql = (await get_table_sql({tableName: table.tableAbbr.toUpperCase()}))[0]

      let templateSql = `SELECT '${tableInfo.departName}' AS '单位名称', '${tableSql.comment}数据总量' AS '数据类型', COUNT(*) AS '数量'
                         FROM ${table.tableName}
                         WHERE cd_time >= '${timeRange[0]}'
                           AND cd_time <= '${timeRange[1]}'
                         UNION ALL `
      sql += templateSql
    }
  }

  sqlRef.value = format(sql.replace(/UNION\s+ALL\s*$/, ''));

  isBuildSql.value = false
}

const timeRangeConvert = (timeRange: (number | Date)[]) => {

  let res: string[] = []

  timeRange.forEach(time => {
    if (time instanceof Date) {
      res.push(formatDate(time))
    } else {
      res.push(formatDate(new Date(time)))
    }
  })

  return res
}

</script>

<style scoped>

</style>
