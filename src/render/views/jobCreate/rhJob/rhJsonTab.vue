<template>
  <n-space justify="end">
    <n-input
        v-model:value="searchValueRef"
        placeholder="搜索"
        @update:value="search"
        clearable
    >
      <template #prefix>
        <n-icon>
          <Search/>
        </n-icon>
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
        <n-form-item-gi :span="12" label="任务JSON" path="rh1Json">
          <n-input
              class="mt-2"
              v-model:value="modalFormModel.rh1Json"
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
import {JobJson} from "@main/entity/JobJson";
import {get_rh_json, update_rh1_json} from "@render/api/auxiliaryDb/jobJson.api";
import {copyText} from "@render/utils/common/clipboard";
import {formatDate} from "@render/utils/common/dateUtils";
import {isBasicTable} from "@render/utils/common/isBasicTable";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {Refresh, Search} from '@vicons/ionicons5'
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
                      modalFormModel.value.rh1Json = row.rh1Json
                      modalFormModel.value.id = row.id
                    }
                  },
                  {default: () => '编辑'}
              ), h(
                NButton,
                {
                  size: 'small',
                  onClick: () => {
                    copyText(row.rh1Json)
                  }
                },
                {default: () => '复制JSON'}
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

const modalFormModel = ref<Partial<JobJson>>({
  id: null,
  tableName: '',
  rh1Json: ''
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
  rh1Json: {
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
          updateTime: v.rh1UpdateTime == null ? '--' : formatDate(v.rh1UpdateTime)
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
      let jobJson = JSON.parse(modalFormModel.value.rh1Json)
      jobJson.name = ''
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

      for (let i = 0; i < jobJson.dataDevBizVo.sparkSqlDtoList[0].sourceTable.length; i++) {

        const tableName = jobJson.dataDevBizVo.sparkSqlDtoList[0].sourceTable[i] as string
        // 若表名包含depart，则说明不是原始JSON，可以直接存储
        if (tableName.includes('depart')) {
          break
        }

        if (!isBasicTable(tableName)) {
          // 若不为基础数据表
          const splitArray = tableName.split('_')
          splitArray[1] = 'depart'
          const newTableName = splitArray.join('_');
          jobJson.modelJson = jobJson.modelJson.replaceAll(tableName, newTableName)
          jobJson.dataDevBizVo.sparkSqlDtoList[0].sql = jobJson.dataDevBizVo.sparkSqlDtoList[0].sql.replaceAll(tableName, newTableName)
          jobJson.dataDevBizVo.sparkSqlDtoList[0].sourceTable[i] = newTableName
        }

      }
      if (!isBasicTable(jobJson.dataDevBizVo.sparkSqlDtoList[0].targetTable)) {
        const splitArray = jobJson.dataDevBizVo.sparkSqlDtoList[0].targetTable.split('_')
        splitArray[1] = 'depart'
        jobJson.dataDevBizVo.sparkSqlDtoList[0].targetTable = splitArray.join('_');

        jobJson.dataDevBizVo.sparkSqlDtoList[0].sql = updateOptSubjectId(jobJson.dataDevBizVo.sparkSqlDtoList[0].sql, '{PROJECT_ID}')
      }

      modalFormModel.value.rh1Json = JSON.stringify(jobJson, null, 2)

      modalFormModel.value.tableName = modalFormModel.value.tableName.toUpperCase()

      update_rh1_json(modalFormModel.value).then(() => {
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

function updateOptSubjectId(query: string, newValue: string): string {
  const regex = /'.*?'(\s+AS\s+)?OPT_SUBJECT_ID/;
  return query.replace(regex, `'${newValue}' AS OPT_SUBJECT_ID`);
}

const search = (v: string) => {
  get_rh_json(v).then((res) => {
    tableDataRef.value = res.map(
        (v => ({
          id: v.id,
          tableName: v.tableName,
          rh1Json: v.rh1Json,
          updateTime: v.rh1UpdateTime == null ? '--' : formatDate(v.rh1UpdateTime)
        })))
  })
}

</script>

<style scoped>

</style>
