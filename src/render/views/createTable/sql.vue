<template>
  <n-alert type="default" :show-icon="false">
    此处为<b>融合前</b>的原始数据表结构
  </n-alert>
  <n-space justify="end" class="mt-2">
    <n-input
        placeholder="搜索"
        v-model:value="searchValue"
        @update:value="tableDataInit"
        @keydown.enter="tableDataInit"
        clearable
    >
      <template #prefix>
        <n-icon>
          <Search/>
        </n-icon>
      </template>
    </n-input>
    <n-button secondary strong @click="add">
      新增
      <template #icon>
        <n-icon>
          <Add/>
        </n-icon>
      </template>
    </n-button>
    <n-button secondary strong @click="tableDataInit">
      刷新
      <template #icon>
        <n-icon>
          <Refresh/>
        </n-icon>
      </template>
    </n-button>
  </n-space>
  <n-data-table
      ref="tableRef"
      :key="(row) => row.id"
      class="mt-2"
      :columns="columnsRef"
      :data="tableDataRef"
      :pagination="paginationReactive"
      :bordered="true"
      :size="'small'"
      :loading="isLoading"
      :striped="true"
  />

  <n-modal
      v-model:show="showModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="modalTitle"
      :size="'small'"
  >
    <n-form
        class="mt-4"
        ref="modalFormRef"
        :model="modalFormModel"
        :rules="modalFormRules"
        :size="'small'"
    >
      <n-grid :cols="2" :x-gap="4">
        <n-form-item-gi label="表名" path="tableName">
          <n-input v-model:value.trim="modalFormModel.tableName" placeholder="输入表名"
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi label="注释" path="comment">
          <n-input v-model:value="modalFormModel.comment" placeholder="输入注释"
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="建表语句" path="sql">
          <n-input
              class="mt-2"
              v-model:value="modalFormModel.sql"
              type="textarea"
              placeholder=""
              :autosize="{ minRows: 7, maxRows: 14 }"
          />
        </n-form-item-gi>

      </n-grid>
    </n-form>
    <template #action>
      <n-button type="primary" :size="'small'" @click="onPositiveClick" :loading="isSaving">保存</n-button>
      <n-button :size="'small'" @click=" showModalRef = false">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {get_table_sql, update_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {DataTableColumns, NButton, FormInst} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";
import {Refresh, Add, Search} from '@vicons/ionicons5'

type TableSql = {
  id: number
  tableName: string
  comment: string
  sql: string
}

const searchValue = ref('')

const tableDataRef = ref([])

const isLoading = ref(true)

const showModalRef = ref(false)

let modalTitle = '';

const modalFormRef = ref<FormInst | null>(null);

const modalFormModel = ref({
  id: null,
  tableName: '',
  comment: '',
  sql: ''
})

const modalFormRules = {
  tableName: {
    required: true,
    trigger: ['input'],
    message: '请输入表名'
  },
  comment: {
    required: true,
    trigger: ['input'],
    message: '请输入注释'
  },
  sql: {
    required: true,
    trigger: ['input'],
    message: '请输入建表SQL'
  }
}

onMounted(() => {
  tableDataInit()
})

const tableDataInit = (searchValue?: string) => {
  isLoading.value = true
  get_table_sql({
    tableName: searchValue || '',
    comment: searchValue || '',
    sql: searchValue || ''
  }).then((res) => {
    tableDataRef.value = res
  }).finally(() => isLoading.value = false)
}

const createColumns = (): DataTableColumns<TableSql> => {
  return [
    {
      title: '表名简称',
      key: 'tableName',
      width: '10%',
      align: 'center',
    },
    {
      title: '表名注释',
      key: 'comment',
      width: '30%'
    },
    {
      title: 'SQL',
      key: 'sql',
      width: '30%',
      ellipsis: true
    }, {
      title: '操作',
      key: 'actions',
      width: '15%',
      align: 'center',
      render(row) {
        return h(
            NButton,
            {
              size: 'small',
              onClick: () => {
                showModalRef.value = true
                modalTitle = `${row.tableName}(${row.comment})`
                modalFormModel.value.tableName = row.tableName
                modalFormModel.value.comment = row.comment
                modalFormModel.value.sql = row.sql
                modalFormModel.value.id = row.id
              }
            },
            {default: () => '查看'}
        )
      }
    }
  ]
}

const columnsRef = ref(createColumns())

const paginationReactive = reactive({
  page: 1,
  pageSize: 9,
  showSizePicker: true,
  pageSizes: [9, 20, 50],
  onChange: async (page: number) => {
    paginationReactive.page = page
    tableDataInit(searchValue.value)
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    tableDataInit(searchValue.value)
  }
})

const isSaving = ref(false)
const onPositiveClick = () => {
  isSaving.value = true

  modalFormRef.value?.validate((errors) => {
    if (!errors) {
      modalFormModel.value.tableName = modalFormModel.value.tableName.toUpperCase()
      update_table_sql(modalFormModel.value).then(() => {
        window.$message.success('保存成功')
        tableDataInit(searchValue.value)
        showModalRef.value = false;
      })
    } else {
      console.error(errors)
    }
  }).finally(() => {
    isSaving.value = false
  })
}

const add = () => {
  modalTitle = '新增';
  modalFormModel.value = {
    id: null,
    tableName: '',
    comment: '',
    sql: ''
  }
  showModalRef.value = true
}
</script>

<style scoped>

</style>
