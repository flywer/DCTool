<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 110px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      因数据库与数据限制，目前只能全量统计，无法选择部门
    </n-alert>

    <n-card class="mt-2" :content-style="{paddingBottom:0}">
      <n-form ref="formRef"
              inline
              :size="'small'"
              :model="formModel"
              label-placement="left"
      >
        <n-grid :cols="10" :x-gap="12">
          <n-form-item-gi :span="10" label="数据表选择">
            <n-tree-select
                v-model:value="formModel.tableSelect"
                multiple
                cascade
                checkable
                :check-strategy="'parent'"
                :options="tableOptionsRef"
                :size="'small'"
                clearable
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" class="w-28" @click="generateSql" :loading="isGenerating">生成SQL</n-button>
      <n-button type="primary" @click="execSql" :loading="isExecuting" :disabled="insertSql.length==0">
        同步至前置机
      </n-button>
    </n-space>

    <n-input
        class="mt-2"
        v-model:value="insertSql"
        type="textarea"
        placeholder=""
        :autosize="{minRows:12,maxRows:12}"
        :loading="isGenerating"
    />
  </n-scrollbar>
</template>

<script setup lang="ts">
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {get_data_volume} from "@render/api/shareBase.api";
import {actionTableNames, basicTableNames} from "@render/utils/datacenter/constants";
import {isEmpty} from "lodash-es";
import {FormInst, TreeSelectOption} from "naive-ui";
import {onMounted, ref} from "vue";

onMounted(() => {
  tableOptionsInit()
})

const formRef = ref<FormInst | null>(null);
const formModel = ref({
  tableSelect: []
})
const tableOptionsRef = ref<TreeSelectOption[]>([])
const insertSql = ref('')

const isGenerating = ref(false)

const isExecuting = ref(false)

const tableOptionsInit = () => {
  tableOptionsRef.value = [
    {
      label: '主题库基础数据表',
      key: '0',
      children: []
    },
    {
      label: '主题库行为数据表',
      key: '1',
      children: []
    },
  ]

  tableOptionsRef.value[0].children = basicTableNames.map((v) => ({
    label: `sztk_${v}`,
    key: v,
  }))

  tableOptionsRef.value[1].children = actionTableNames.map((v) => ({
    label: `sztk_${v}`,
    key: v,
  }))
}

const generateSql = async () => {
  if (!isEmpty(formModel.value.tableSelect)) {
    isGenerating.value = true

    for (const tables of formModel.value.tableSelect) {
      if (tables == '0') {
        for (const table of basicTableNames) {
          insertSql.value += await generateSubSql(table)
        }
      } else if (tables == '1') {
        for (const table of actionTableNames) {
          insertSql.value += await generateSubSql(table)
        }
      } else {
        insertSql.value += await generateSubSql(tables)
      }
    }

    isGenerating.value = false

    insertSql.value = insertSql.value.split('\n').slice(0, -1).join('\n')
  } else {
    window.$message.error('请选择数据表')
  }
}

const generateSubSql = async (tableName: string) => {
  const tableSql = await get_table_sql({tableName: tableName})

  const departColName = tableSql[0].sql.split('\n').find(str => str.includes("'数据编目挂接单位名称'")).trim().split(' ')[0]

  return `
    SELECT UUID()                       AS id,
           ${departColName}             AS departName,
           '${tableName.toUpperCase()}' AS tableType,
           COUNT(*)                     AS dataCount,
           NOW()                        AS updateTime
    FROM gdsztk_${tableName}
    GROUP BY ${departColName}
    UNION ALL`
}

const execSql = () => {
  isExecuting.value = true

  get_data_volume(insertSql.value).then(res => {
    if (res.success) {
      window.$message.success(res.message)
    } else {
      window.$message.error(res.message)
    }
  }).finally(() => isExecuting.value = false)
}
</script>

<style scoped>

</style>
