<template>
  <n-space justify="end" class="mt-2">
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
    <!--    <n-button secondary strong @click="add">
          新增
          <template #icon>
            <n-icon>
              <Add/>
            </n-icon>
          </template>
        </n-button>-->
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
</template>

<script setup lang="ts">
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {Refresh, Search} from '@vicons/ionicons5'
import {get_rh_json, update_rh1_json, update_rh2_json} from "@render/api/auxiliaryDb";
import {DataTableColumns, FormInst, NButton, NSpace} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

const searchValueRef = ref('')

type RhJson = {
  id: number
  tableName: string
  rh1Json: string
  rh2Json: string
}

const createColumns = (): DataTableColumns<RhJson> => {
  return [
    {
      title: '表名简称',
      key: 'tableName',
      width: '10%',
      align: 'center',
      sortOrder: 'ascend'
    },
    {
      title: '单表融合JSON',
      key: 'rh1Json',
      width: '25%',
      ellipsis: true
    },
    {
      title: '多表融合JSON',
      key: 'rh2Json',
      width: '25%',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'actions',
      width: '30%',
      align: 'center',
      render(row) {
        return h(NSpace, {
              justify: 'center'
            },
            [h(
                NButton,
                {
                  size: 'small',
                  onClick: () => {
                    showModalRef.value = true
                    modalTitle = `${row.tableName}`
                    modalFormModel.value.tableName = row.tableName
                    modalFormModel.value.json = row.rh1Json
                    modalFormModel.value.id = row.id
                    modalFormModel.value.type = 1
                  }
                },
                {default: () => '查看单表融合JSON'}
            ),
              h(
                  NButton,
                  {
                    size: 'small',
                    onClick: () => {
                      showModalRef.value = true
                      modalTitle = `${row.tableName}`
                      modalFormModel.value.tableName = row.tableName
                      modalFormModel.value.json = row.rh2Json
                      modalFormModel.value.id = row.id
                      modalFormModel.value.type = 2
                    }
                  },
                  {default: () => '查看多表融合JSON'}
              )
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
  json: '',
  // 1为单表 2为多表
  type: 1 | 2
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

onMounted(() => {
  tableDataInit()
})

const tableDataInit = () => {
  isLoading.value = true
  get_rh_json(searchValueRef.value).then((res) => {
    tableDataRef.value = res.map(
        (v => ({
          id: v.id,
          tableName: v.tableName,
          rh1Json: v.rh1Json,
          rh2Json: v.rh2Json
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
      let jobJson = JSON.parse(modalFormModel.value.json)
      jobJson.email = ''
      jobJson.description = ''
      jobJson.personId = ''
      jobJson.personName = ''
      jobJson.projectId = ''
      jobJson.projectName = ''
      jobJson.dependencyProjectName = ""
      jobJson.dependencyProjectId = null
      jobJson.dependencyWorkflowName = ""
      jobJson.dependencyWorkflowId = null
      jobJson.schedulingMode = 0
      jobJson = JSON.parse(updateSjkUUID(removeIds(jobJson)))

      // 表名中的项目缩写
      const tableAbbr = jobJson.name.split('_')[1]
      jobJson.name = ''

      if (tableAbbr !== 'depart') {
        modalFormModel.value.json = JSON.stringify(jobJson, null, 2).replaceAll(tableAbbr, 'depart')
      } else {
        modalFormModel.value.json = JSON.stringify(jobJson, null, 2)
      }

      modalFormModel.value.tableName = modalFormModel.value.tableName.toUpperCase()

      if (modalFormModel.value.type == 1) {
        update_rh1_json(modalFormModel.value).then(() => {
          window.$message.success('保存成功')
          tableDataInit()
          showModalRef.value = false;
        })
      } else {
        update_rh2_json(modalFormModel.value).then(() => {
          window.$message.success('保存成功')
          tableDataInit()
          showModalRef.value = false;
        })
      }

    } else {
      console.log(errors)
    }
  }).finally(() => {
    isSaving.value = false
  })

}

/* const add = () => {

  modalTitle = '新增';

  modalFormModel.value = {
    id: null,
    tableName: '',
    json: ''
  }

  showModalRef.value = true
} */

const search = (v) => {
  get_rh_json(v).then((res) => {
    tableDataRef.value = res.map(
        (v => ({
          id: v.id,
          tableName: v.tableName,
          rh1Json: v.rh1Json,
          rh2Json: v.rh2Json
        })))
  })
}

</script>

<style scoped>

</style>
