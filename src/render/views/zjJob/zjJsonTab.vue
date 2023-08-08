<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 165px);" trigger="hover">
    <n-space justify="end">
      <n-input
          v-model:value="searchValueRef"
          placeholder="搜索"
          @update:value="search"
          clearable
      >
        <template #prefix>
          <n-icon :component="Search"/>
        </template>
      </n-input>
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
  </n-scrollbar>
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
        <n-form-item-gi span="12" label="表名" path="tableName">
          <n-input
              v-model:value="modalFormModel.tableName"
              placeholder="输入表名"
              @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="任务JSON" path="json">
          <n-input
              class="mt-2"
              v-model:value="modalFormModel.json"
              type="textarea"
              placeholder=""
              :autosize="{ minRows: 7, maxRows: 14 }"
          />
        </n-form-item-gi>

      </n-grid>
    </n-form>
    <template #action>
      <n-button type="primary" :size="'small'" @click="onPositiveClick" :loading="isSaving">保存</n-button>
      <n-button :size="'small'" @click="onNegativeClick">返回</n-button>
    </template>
  </n-modal>

  <n-modal
      v-model:show="showRulesModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      title="质检规则"
      :size="'small'"
      style="width: calc(100vw - 300px);"
  >
    <zj-rules-table :job="curJob"/>
  </n-modal>

</template>

<script setup lang="ts">
import {copyText} from "@render/utils/common/clipboard";
import {formatDate} from "@render/utils/common/dateUtils";
import {convertZjJson} from "@render/utils/datacenter/zjJob";
import ZjRulesTable from "@render/views/zjJob/zjRulesTable.vue";
import {Refresh, Search} from '@vicons/ionicons5'
import {get_zj_json, update_zj_json} from "@render/api/auxiliaryDb";
import {DataTableColumns, FormInst, NButton, NSpace} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

const searchValueRef = ref('')

type ZjJob = {
  id: number
  tableName: string
  json: string
  updateTime: string
}

const createColumns = (): DataTableColumns<ZjJob> => {
  return [
    {
      title: '表名简称',
      key: 'tableName',
      width: '10%',
      align: 'center',
      sortOrder: 'ascend'
    },
    {
      title: 'JSON',
      key: 'json',
      width: '25%',
      ellipsis: true
    },
    {
      title: '变更时间',
      key: 'updateTime',
      width: '10%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '15%',
      align: 'center',
      render(row) {
        return h(NSpace, {
              justify: 'center'
            },
            [
              h(
                  NButton,
                  {
                    size: 'small',
                    onClick: () => {
                      showModalRef.value = true
                      modalTitle = `${row.tableName}`
                      modalFormModel.value.tableName = row.tableName
                      modalFormModel.value.json = row.json
                      modalFormModel.value.id = row.id
                    }
                  },
                  {default: () => '编辑'}
              ),
              h(
                  NButton,
                  {
                    size: 'small',
                    onClick: () => {
                      copyText(row.json)
                    }
                  },
                  {default: () => '复制JSON'}
              ),
              h(
                  NButton,
                  {
                    size: 'small',
                    onClick: () => {
                      curJob.value = row
                      showRulesModalRef.value = true
                    }
                  },
                  {default: () => '规则列表'}
              ),
            ])

      }
    }
  ]
}

const columnsRef = ref(createColumns())

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: async (page: number) => {
    paginationReactive.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
  }
})

const tableDataRef = ref([])

const isLoading = ref(true)

const showModalRef = ref(false)

let modalTitle = '';

const modalFormRef = ref<FormInst | null>(null);

const modalFormModel = ref({
  id: null,
  tableName: '',
  json: ''
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
  json: {
    required: true,
    trigger: ['input'],
    message: '请输入任务JSON'
  }
}

const showRulesModalRef = ref(false)

const curJob = ref<ZjJob>(null)

onMounted(() => {
  tableDataInit()
})

const tableDataInit = () => {
  isLoading.value = true
  get_zj_json(searchValueRef.value).then((res) => {
    tableDataRef.value = res.map(
        (v => ({
          id: v.id,
          tableName: v.tableName,
          json: v.zjJson,
          updateTime: v.zjUpdateTime == null ? '--' : formatDate(v.zjUpdateTime)
        })))
  }).finally(() => isLoading.value = false)
}

const onNegativeClick = () => {
  showModalRef.value = false
}

const isSaving = ref(false)
const onPositiveClick = () => {
  isSaving.value = true

  modalFormRef.value?.validate((errors) => {
    if (!errors) {
      modalFormModel.value.json = convertZjJson(modalFormModel.value.json, modalFormModel.value.tableName)

      modalFormModel.value.tableName = modalFormModel.value.tableName.toUpperCase()

      update_zj_json(modalFormModel.value).then(() => {
        window.$message.success('保存成功')
        tableDataInit()
        showModalRef.value = false;
      })
    } else {
      console.error(errors)
    }
  }).finally(() => {
    isSaving.value = false
  })

}

const search = (v) => {
  get_zj_json(v).then((res) => {
    tableDataRef.value = res.map(
        (v => ({
          id: v.id,
          tableName: v.tableName,
          json: v.zjJson,
          updateTime: v.zjUpdateTime == null ? '--' : formatDate(v.zjUpdateTime)
        })))
  })
}

</script>

<style scoped>

</style>
