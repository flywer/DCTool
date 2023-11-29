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
          <n-form-item-gi :span="10" label="行为表选择">
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
      <n-button type="primary" class="w-28" @click="execSql" :loading="isExecuting" :disabled="insertSql.length==0">
        执行SQL
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-icon size="16" class="m-0.5" style="line-height: 22px">
              <QuestionCircleTwotone/>
            </n-icon>
          </template>
          将数据插入到数据湖xzzf_sjtj_data_lake表中
        </n-tooltip>
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
import {exec_sql} from "@render/api/datacenter.api";
import {actionTableNames} from "@render/utils/datacenter/constants";
import {QuestionCircleTwotone} from "@vicons/antd";
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
      label: '数据湖行为表',
      key: '0',
      children: []
    }
  ]

  tableOptionsRef.value[0].children = actionTableNames.map((v) => ({
    label: `sztk_${v}`,
    key: v,
  }))
}

const generateSql = async () => {
  if (!isEmpty(formModel.value.tableSelect)) {
    isGenerating.value = true

    insertSql.value = `INSERT INTO xzzf_sjtj_data_lake
    (id, depart_name, table_type, data_count, update_time)`

    if (formModel.value.tableSelect.length == 1 && formModel.value.tableSelect[0] == '0') {
      for (const table of actionTableNames) {
        insertSql.value += await generateSubSql(table)
      }
    } else {
      for (const table of formModel.value.tableSelect) {
        insertSql.value += await generateSubSql(table)
      }
    }
    isGenerating.value = false

    insertSql.value = insertSql.value.split('\n').slice(0, -1).join('\n');
  } else {
    window.$message.error('请选择行为表')
  }
}

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

const execSql = async () => {
  isExecuting.value = true

  let paramModel = {
    sourceId: '12',
    dbType: 'mysql',
    sourceName: '',
    dataTierCode: '',
    dataTierName: '',
    namedJson: '',
    datamodelTableFieldsVoList: [],
    lifeCycle: '1',
    ddlSql: insertSql.value,
    tableName: 'execSql'
  }

  await exec_sql(paramModel).then((res) => {
    if ((res.code == 500 && res.message === '服务器内部错误') || (res.code == 200 && res.success)) {
      window.$message.success('执行成功')
    } else {
      window.$dialog.error({
        title: '执行失败',
        content: res.message.replace(/建表失败，/g, ''),
        positiveText: '确定'
      });
    }

  }).finally(() => {
    isExecuting.value = false
  })
}


</script>

<style scoped>

</style>
