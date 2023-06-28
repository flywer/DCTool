<template>
  <n-alert type="default" :show-icon="false">
    生成用于查询前置机行为数据表<b>批次号</b>与<b>行政区划</b>的SQL
  </n-alert>

  <n-card class="mt-2" :content-style="{paddingBottom:0}" :size="'small'">
    <n-tabs type="line" animated @update:value="handleTabUpdate">
      <n-tab-pane name="1" tab="简易模式">
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi span="2" label="单位选择">
            <n-select
                v-model:value="departIdRef"
                placeholder="选择单位"
                :options="departOptionsRef"
                :consistent-menu-width="false"
                filterable
                :size="'small'"
            />

          </n-form-item-gi>
        </n-grid>
      </n-tab-pane>
      <n-tab-pane name="2" tab="自定义模式">
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi span="2" label="行为表选择">
            <n-input v-model:value="departNameRef" placeholder="输入单位名称" :clearable="true" :size="'small'"/>
          </n-form-item-gi>

          <n-form-item-gi span="2" label="行为表选择">
            <n-tree-select
                v-model:value="tableSelectRef"
                multiple
                cascade
                checkable
                :check-strategy="'child'"
                :options="tableSelectOptionsRef"
                :size="'small'"
                clearable
            />
          </n-form-item-gi>

        </n-grid>
      </n-tab-pane>
    </n-tabs>

  </n-card>

  <n-space class="mt-2" justify="center" align="center">
    <n-button class="w-28" type="primary" @click="buildForm" :loading="isBuildForm">
      表单创建
    </n-button>
  </n-space>

  <n-card class="mt-2" :content-style="{paddingBottom:0}" :size="'small'" v-if="inputValueRef.length>0">
    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 500px);" trigger="hover">
      <n-grid :cols="2" :x-gap="12">
        <n-gi :span="2">
          <n-dynamic-input v-model:value="inputValueRef" class="mb-4" @create="onCreate" show-sort-button>
            <template #default="{ value }">
              <div style="display: flex; align-items: center; width: 100%">
                <n-input v-model:value="value.tableName" type="text" placeholder="输入表名"
                         style="margin-right: 12px"
                />
                <n-input v-model:value="value.tableAbbr" type="text" placeholder="输入表名简称"
                         style="margin-right: 12px"
                />
                <n-input v-model:value="value.region" type="text" placeholder="输入行政区划字段"
                         style="margin-right: 12px"
                />
                <n-input v-model:value="value.cdBatch" placeholder="输入批次号字段" type="text"/>
              </div>
            </template>
          </n-dynamic-input>
        </n-gi>
      </n-grid>
    </n-scrollbar>
  </n-card>
  <n-divider v-else/>

  <n-space class="mt-2" justify="center" align="center">

    <n-button class="w-28" type="primary" :disabled="inputValueRef.length===0" @click="buildSql"
              :loading="isBuildSql"
    >
      SQL生成
    </n-button>
    <n-button class="w-28" type="primary" :disabled="inputValueRef.length===0" @click="formSave"
              :loading="isSaveForm"
    >
      表单存储
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
      :autosize="{ minRows:3,maxRows:8 }"
  />
</template>

<script setup lang="ts">
import {
  get_pre_database_depart,
  get_pre_database_table_info_json,
  get_table_sql,
  update_table_info_json
} from "@render/api/auxiliaryDb";
import {copyText} from "@render/utils/common/clipboard";
import {isEmpty} from "lodash-es";
import {SelectGroupOption, SelectOption, TreeSelectOption} from "naive-ui";
import {format} from "sql-formatter";
import {ref, onMounted} from 'vue'

const curTabRef = ref('1')

// 简易模式 单位选项
const departOptionsRef = ref<Array<SelectOption | SelectGroupOption>>()

// 简易模式 所选单位ID
const departIdRef = ref([])

// 自定义模式 表选项
const tableSelectOptionsRef = ref<TreeSelectOption[]>([])

// 自定义模式 行为表信息
const actionTablesRef = ref([])

// 自定义模式 所选表
const tableSelectRef = ref([])

// 自定义模式 单位名称
const departNameRef = ref('')

type DynamicInputValueType = {
  tableAbbr: string,
  tableName: string,
  region: string,
  cdBatch: string
}

const inputValueRef = ref<DynamicInputValueType[]>([])

const sqlRef = ref('')

onMounted(async () => {
  tableSelectOptionsInit()

  departOptionsRef.value = (await get_pre_database_depart()).map((v => ({
    label: v.departName,
    value: v.id.toString()
  })))
})

const handleTabUpdate = async (v) => {
  curTabRef.value = v
  if (v === '1') {
    departOptionsRef.value = (await get_pre_database_depart()).map((v => ({
      label: v.departName,
      value: v.id.toString()
    })))
  }

}

const tableSelectOptionsInit = async () => {

  tableSelectOptionsRef.value = [
    {
      label: '行为数据表',
      key: '0',
      children: [
        {
          label: '行政许可',
          key: '1',
          children: []
        },
        {
          label: '行政处罚',
          key: '2',
          children: []
        },
        {
          label: '行政强制',
          key: '3',
          children: []
        },
        {
          label: '行政征收',
          key: '4',
          children: []
        },
        {
          label: '行政征用',
          key: '5',
          children: []
        },
        {
          label: '行政检查',
          key: '6',
          children: []
        },
        {
          label: '救济信息',
          key: '7',
          children: []
        }
      ]
    },
  ]

  actionTablesRef.value = (await get_table_sql({tableName: 'C'})) as any[]

  const tablePre = ['C10', 'C2', 'C30', 'C40', 'C41', 'C60', 'C70']

  for (let i = 0; i < tableSelectOptionsRef.value[0].children.length; i++) {
    tableSelectOptionsRef.value[0].children[i].children = actionTablesRef.value.filter(item => item.tableName.startsWith(tablePre[i])).map((v => ({
      label: `${v.comment}(${v.tableName})`,
      key: v.tableName
    })))
  }
}

const onCreate = () => {
  return {
    tableName: '',
    region: '',
    cdBatch: 'cd_batch'
  }
}

const isBuildForm = ref(false)

const buildForm = async () => {
  isBuildForm.value = true

  if (curTabRef.value === '1') {
    if (departIdRef.value.length > 0) {
      const josn = (await get_pre_database_table_info_json(departIdRef.value[0])).tableInfoJson
      inputValueRef.value = JSON.parse(josn)
    } else {
      window.$message.warning("单位不得为空")
      isBuildForm.value = false
      return 0
    }

  } else {
    let regionColArr = []

    for (const col of tableSelectRef.value) {
      const sql = (await get_table_sql({tableName: col}))[0].sql as string
      regionColArr.push(getRegionBySql(sql))
    }

    inputValueRef.value = tableSelectRef.value.map((tableName, index) => ({
      tableAbbr: tableName,
      tableName: '',
      region: regionColArr[index],
      cdBatch: 'cd_batch',
    }));
  }

  isBuildForm.value = false
}

const isBuildSql = ref(false)
const buildSql = async () => {
  isBuildSql.value = true

  if (inputValueRef.value.filter(item => isEmpty(item.tableName)).length > 0) {
    window.$message.warning("表名不得为空")
    isBuildSql.value = false
    return 0
  }

  let sql = ''

  inputValueRef.value.forEach(table => {
    // language=SQL format=false
    let templateSql = `SELECT '${departNameRef.value || '该地市'}'     AS '名称',
                        '${table.tableAbbr}'                        AS '表名',
                        CASE
                            WHEN c1 = 15 AND c2 = 9 THEN NULL
                            WHEN c1 != 15 AND c2 = 9 THEN '批次号'
                            WHEN c1 = 15 AND c2 != 9 THEN '行政区划'
                            ELSE '批次号、行政区划'
                        END AS '问题',
                        c1                                        AS '批次号长度',
                        c2                                        AS '行政区划长度'
                        FROM (SELECT LENGTH( ${table.cdBatch}) AS c1, LENGTH(${table.region}) AS c2
                                FROM ${table.tableName}
                                GROUP BY c1, c2)
                        t1 UNION ALL `

    sql += templateSql
  })

  isBuildSql.value = false

  sqlRef.value = format(sql.replace(/UNION\s+ALL\s*$/, ''));
}

const getRegionBySql = (sqlString: string) => {
  const regex = /(\w+)\s+VARCHAR\(\d+\)\s+COMMENT\s+'数据编目挂接单位行政区划'/;
  const match = sqlString.match(regex);
  let fieldName: string | null;

  if (match && match.length > 1) {
    fieldName = match[1];
  } else {
    fieldName = null
  }
  return fieldName
}

const isSaveForm = ref(false)

const formSave = () => {
  isSaveForm.value = true

  if (curTabRef.value === '1') {
    const departName = departOptionsRef.value.filter(opt => opt.value == departIdRef.value[0])[0].label
    update_table_info_json({
      departName: departName,
      tableInfoJson: JSON.stringify(inputValueRef.value)
    }).then(() => {
      window.$message.success('保存成功')
    }).finally(() => isSaveForm.value = false)
  } else {
    update_table_info_json({
      departName: departNameRef.value,
      tableInfoJson: JSON.stringify(inputValueRef.value)
    }).then(() => {
      window.$message.success('保存成功')
    }).finally(() => isSaveForm.value = false)
  }

}
</script>

<style scoped>

</style>
