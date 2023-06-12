<template>
  <n-space justify="end" class="mt-2">
    <n-input
        placeholder="搜索"
        @update:value="search"
    >
      <template #prefix>
        <n-icon :component="Search"/>
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
import {isBasicTable} from "@render/utils/common/isBasicTable";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {Refresh, Add, Search} from '@vicons/ionicons5'
import {get_zj_json, update_zj_json} from "@render/api/auxiliaryDb";
import {DataTableColumns, FormInst, NButton, useMessage} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

type ZjJson = {
  id: number
  tableName: string
  json: string
}

const createColumns = (): DataTableColumns<ZjJson> => {
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
                modalTitle = `${row.tableName}`
                modalFormModel.value.tableName = row.tableName
                modalFormModel.value.json = row.json
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

const message = useMessage()

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

onMounted(() => {
  tableDataInit()
})

const tableDataInit = () => {
  isLoading.value = true
  get_zj_json().then((res) => {
    tableDataRef.value = res.map(
        (v => ({
          id: v.id,
          tableName: v.tableName,
          json: v.zjJson
        })))
    console.log(tableDataRef.value)
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
      jobJson.name = ''
      jobJson.email = ''
      jobJson.description = ''
      jobJson.personId = ''
      jobJson.personName = ''
      jobJson.projectId = ''
      jobJson.projectName = ''
      jobJson.dependencyProjectName = null
      jobJson.dependencyWorkflowName = null
      jobJson.schedulingMode = 0
      jobJson.crontab = ''
      jobJson = JSON.parse(updateSjkUUID(removeIds(jobJson)))

      const oldTableAbbr = jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName.split('_')[1]

      jobJson.modelJson = jobJson.modelJson.replaceAll(oldTableAbbr, 'depart')

      const newSourceTableName = `di_depart_${modalFormModel.value.tableName.toLowerCase()}_temp_ods`
      const newAimTableName = `di_depart_${modalFormModel.value.tableName.toLowerCase()}_right_dwd`
      const newWrongTableName = `di_depart_${modalFormModel.value.tableName.toLowerCase()}_error_dwd`

      jobJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList = jobJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.map(obj => {
            obj.field = obj.field.replace(jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName, newSourceTableName);
            return obj
          }
      )

      jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName = newSourceTableName
      jobJson.dataDevBizVo.qualityInspectionDtoList[0].aimTableName = newAimTableName
      jobJson.dataDevBizVo.qualityInspectionDtoList[0].wrongTableName = newWrongTableName

      //替换关联表里的表名，但关联的是基础数据的不用替换
      jobJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.forEach((field: any) => {
        field.ruleList.forEach((rule: any) => {
          if (rule.customSqlKey != undefined) {
            rule.customSqlKey = rule.customSqlKey.replaceAll(oldTableAbbr, 'depart');
          }
          if (rule.fromTableDataTable != undefined && !isBasicTable(rule.fromTableDataTable)) {
            rule.fromTableDataTable = rule.fromTableDataTable.replaceAll(oldTableAbbr, 'depart');
            rule.fromTableField = rule.fromTableField.replaceAll(oldTableAbbr, 'depart');
          }
        });
      });

      modalFormModel.value.json = JSON.stringify(jobJson, null, 2)

      modalFormModel.value.tableName = modalFormModel.value.tableName.toUpperCase()

      update_zj_json(modalFormModel.value).then(() => {
        message.success('保存成功')
        tableDataInit()
        showModalRef.value = false;
      })
    } else {
      console.log(errors)
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
    json: ''
  }

  showModalRef.value = true
}

const search = (v) => {
  get_zj_json(v).then((res) => {
    tableDataRef.value = res.map(
        (v => ({
          id: v.id,
          tableName: v.tableName,
          json: v.zjJson
        })))
  })
}

</script>

<style scoped>

</style>
