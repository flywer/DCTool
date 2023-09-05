<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 165px);" trigger="hover">
    <n-space justify="end">
      <n-input
          v-model:value="searchValueRef"
          placeholder="搜索"
          @update:value="search"
          clearable
          :readonly="isLoading"
          @keydown.enter="search(searchValueRef)"
      >
        <template #prefix>
          <n-icon>
            <Search/>
          </n-icon>
        </template>
      </n-input>
      <n-button secondary strong @click="search(searchValueRef)">
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
        :data="jsonData"
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
      <n-button :size="'small'" @click="showModalRef = false">返回</n-button>
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
import {CommonJsonDataType} from "@common/types";
import {copyText} from "@render/utils/common/clipboard";
import ZjRulesTable from "@render/views/zjJob/components/zjRulesTable.vue";
import {Refresh, Search} from '@vicons/ionicons5'
import {DataTableColumns, FormInst, NButton, NSpace} from "naive-ui";
import {h, reactive, ref} from "vue";

const props = defineProps({
  jsonData: {
    type: Object as () => CommonJsonDataType[],
    default: []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  jsonType: {
    type: Number,
    default: 1,
    validator(value) {
      // 1：质检任务JSON；2：单表融合任务JSON
      return value === 1 || value === 2;
    }
  },
})

const emit = defineEmits(['search', 'save'])

const createColumns = (): DataTableColumns<CommonJsonDataType> => {
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

const curJob = ref<CommonJsonDataType>(null)

const searchValueRef = ref('')

const search = (v: string) => {
  emit('search', v)
}

// region 编辑
const showModalRef = ref(false)

let modalTitle = '';

const modalFormRef = ref<FormInst | null>(null);

const modalFormModel = ref<CommonJsonDataType>({
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

const isSaving = ref(false)
const onPositiveClick = () => {
  modalFormRef.value?.validate((errors) => {
    isSaving.value = true
    if (!errors) {
      emit('save', modalFormModel.value, searchValueRef.value)
      showModalRef.value = false;
    } else {
      console.error(errors)
    }
  }).finally(() => {
    isSaving.value = false
  })
}

// endregion

const showRulesModalRef = ref(false)
</script>

<style scoped>

</style>
