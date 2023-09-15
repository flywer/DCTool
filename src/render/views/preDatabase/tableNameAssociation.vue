<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <n-space inline class="float-right">
          <n-input
              v-model:value="queryParam"
              placeholder="搜索"
              @update:value="handleSearch"
              clearable
              :readonly="isTableLoading"
          >
            <template #prefix>
              <n-icon>
                <Search/>
              </n-icon>
            </template>
          </n-input>
          <n-button secondary type="info" @click="updateModalInit(1)">
            新增
            <template #icon>
              <n-icon>
                <Add24Regular/>
              </n-icon>
            </template>
          </n-button>
          <n-button secondary type="info" @click="updateByExcel">
            导入
            <template #icon>
              <n-icon>
                <ArrowUpload20Regular/>
              </n-icon>
            </template>
          </n-button>
          <n-button secondary type="info" @click="downloadTemplate">
            下载模板
            <template #icon>
              <n-icon>
                <ArrowDownload20Regular/>
              </n-icon>
            </template>
          </n-button>
          <n-button secondary strong @click="tableDataInit(queryParam)">
            刷新
            <template #icon>
              <n-icon>
                <Refresh/>
              </n-icon>
            </template>
          </n-button>
        </n-space>
      </div>

      <n-data-table
          :key="(row) => row.id"
          class="mt-2 mb-2"
          :columns="columnsRef"
          :data="tableDataRef"
          :bordered="true"
          :size="'small'"
          :loading="isTableLoading"
          :striped="true"
      >
      </n-data-table>

      <n-space class="mt-4" justify="end">
        <n-pagination
            v-model:page="paginationReactive.page"
            v-model:page-size="paginationReactive.pageSize"
            :item-count="paginationReactive.itemCount"
            :page-sizes="[10, 20, 30, 40]"
            show-size-picker
            @update:page="paginationReactive.onChange"
            @update:page-size="paginationReactive.onUpdatePageSize"
        />
      </n-space>
    </n-scrollbar>
  </n-layout>

  <n-modal
      v-model:show="showUpdateModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="modalTitle"
      :size="'small'"
      style="width: 340px"
  >

    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
      <n-form
          class="mt-4"
          ref="tableNameAssocModalFormRef"
          :model="tableNameAssocModelRef"
          :rules="tableNameAssocModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="10" :x-gap="4">
          <n-form-item-gi :span="10" label="数源单位" path="departName">
            <n-input v-model:value="tableNameAssocModelRef.departName"
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="10" label="数据元分类号" path="tableType">
            <n-select
                v-model:value="tableNameAssocModelRef.tableType"
                placeholder="选择数据元分类号"
                :options="tableTypeOptions"
                :consistent-menu-width="false"
                filterable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="10" label="前置机表名" path="tableName">
            <n-input v-model:value="tableNameAssocModelRef.tableName"
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="handleSave" :loading="isSaving">保存
      </n-button>
      <n-button :size="'small'" @click="showUpdateModalRef=!showUpdateModalRef">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {FEDepartTableName} from "@main/entity/FEDepartTableName";
import {
  delete_FE_TableName,
  download_template, get_fe_table_name_by_depart_and_table_type,
  get_fe_table_name_by_page,
  update_fe_table_name_by_excel, update_FE_TableName
} from "@render/api/auxiliaryDb/preDatabase.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {actionTableNames, basicTableNames} from "@render/utils/datacenter/constants";
import {showButton} from "@render/utils/datacenter/jobTabUtil";
import {Refresh, Search} from "@vicons/ionicons5";
import {ArrowDownload20Regular, ArrowUpload20Regular, Add24Regular} from '@vicons/fluent'
import {clone} from "lodash-es";
import {DataTableColumns, FormInst, NButton, NIcon, NSpace, SelectGroupOption, SelectOption} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

onMounted(() => {
  tableCommentMapInit()
  tableDataInit(queryParam.value)
})

const queryParam = ref('')

const tableDataRef = ref<FEDepartTableName[]>([])
const isTableLoading = ref(false)
const tableCommentMap = ref<Map<string, string>>(new Map<string, string>())
const createColumns = (): DataTableColumns<FEDepartTableName> => {
  return [
    {
      title: '数源单位名称',
      key: 'departName',
    },
    {
      title: '表类型',
      key: 'tableType',
    },
    {
      title: '编目名称',
      key: 'tableComment',
      render(row) {
        if (row.tableType == 'DATA_CHECK') {
          return '数据对账批次表'
        } else {
          return tableCommentMap.value.get(row.tableType)
        }
      }
    },
    {
      title: '前置机表名',
      key: 'tableName',
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      render(row) {
        return h(NSpace, {
          justify: 'center'
        }, [
          showButton('编辑', () => {
            updateModalInit(2, row)
          }),
          showButton('删除', () => {
            handleDelete(row)
          }),
        ])
      }
    }
  ]
}
const columnsRef = ref(createColumns())
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  onChange: (page: number) => {
    paginationReactive.page = page
    tableDataInit(queryParam.value)
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    tableDataInit(queryParam.value)
  }
})

const showUpdateModalRef = ref(false)
const modalTitle = ref('')
const modalType = ref(1)
const tableNameAssocModalFormRef = ref<FormInst | null>(null)
const tableNameAssocModelRef = ref({
  id: null,
  departName: null,
  tableType: null,
  tableName: null,
  updateTime: null
})
const tableNameAssocModalFormRules = ref({
  departName: {
    required: true,
    trigger: ['input'],
    message: '请输入数源单位'
  },
  tableType: {
    required: true,
    trigger: ['change'],
    message: '请选择分类号'
  },
  tableName: {
    required: true,
    trigger: ['input'],
    message: '请输入表名'
  },
})
const tableTypeOptions = ref<Array<SelectOption | SelectGroupOption>>([])
const isSaving = ref(false)

const tableDataInit = async (v: string) => {
  isTableLoading.value = true

  const data = await get_fe_table_name_by_page({
    pageNo: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
    searchParam: v
  })

  tableDataRef.value = data.records
  paginationReactive.itemCount = data.total || 0

  isTableLoading.value = false
}

const handleSearch = (v: string) => {
  paginationReactive.page = 1
  tableDataInit(v)
}

const tableCommentMapInit = () => {
  tableCommentMap.value.clear()
  get_table_sql().then(res => {
    res.forEach(table => {
      tableCommentMap.value.set(table.tableName, table.comment)
    })
  })
}

const updateByExcel = () => {
  update_fe_table_name_by_excel().then(res => {
    if (res.success) {
      window.$message.success(res.message)
      tableDataInit(queryParam.value)
    } else {
      window.$notification.create({
        title: "文件导入失败",
        content: res.message,
        type: "error"
      })
    }
  })
}

const downloadTemplate = () => {
  download_template().then(res => {
    if (res.success) {
      window.$message.success(res.message)
    } else {
      window.$message.error(res.message)
    }
  })
}

// 1:新增 2：更新
const updateModalInit = (type: 1 | 2, model?: FEDepartTableName) => {
  modalType.value = type
  if (type == 1) {
    modalTitle.value = '新增'
    tableNameAssocModelRef.value = {
      id: null,
      departName: null,
      tableType: null,
      tableName: null,
      updateTime: null
    }
  } else {
    modalTitle.value = '更新'
    tableNameAssocModelRef.value = clone(model)
  }

  let tableTypes = []
  tableTypes.push(...basicTableNames)
  tableTypes.push(...actionTableNames)
  tableTypes.push('DATA_CHECK')

  tableTypeOptions.value = tableTypes.map((v: string) => ({
    label: v.toUpperCase(),
    value: v.toUpperCase()
  }))

  showUpdateModalRef.value = true
}

const handleSave = () => {
  tableNameAssocModalFormRef.value?.validate(errors => {
    if (!errors) {
      isSaving.value = true

      if (modalType.value == 1) {
        get_fe_table_name_by_depart_and_table_type(
            tableNameAssocModelRef.value.departName,
            tableNameAssocModelRef.value.tableType).then(res => {

          // 当信息已存在，且此时为新增时
          if (res != null) {
            new Promise(resolve => {
              window.$dialog.warning({
                title: '警告',
                content: `检测到${res.departName}的${res.tableType}已存在,为${res.tableName}，是否更新？`,
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: () => {
                  resolve(true)
                },
                onAfterLeave: () => {
                  resolve(false)
                }
              })
            }).then(isPass => {
              if (isPass) {
                tableNameAssocModelRef.value.id = res.id
                updateTableNameAssoc(tableNameAssocModelRef.value).then(isSuccess => {
                  isSaving.value = false
                  showUpdateModalRef.value = !isSuccess
                })
              } else {
                isSaving.value = false
              }
            })

          } else {
            updateTableNameAssoc(tableNameAssocModelRef.value).then(isSuccess => {
              isSaving.value = false
              showUpdateModalRef.value = !isSuccess
            })
          }
        })
      } else {
        updateTableNameAssoc(tableNameAssocModelRef.value).then(isSuccess => {
          isSaving.value = false
          showUpdateModalRef.value = !isSuccess
        })
      }

    }
  })
}

const updateTableNameAssoc = (model: FEDepartTableName) => {
  return new Promise(resolve => {
    update_FE_TableName(model).then(res => {
      if (res.success) {
        window.$message.success(res.message)
        tableDataInit(queryParam.value)
        resolve(true)
      } else {
        window.$message.error(res.message)
        resolve(false)
      }
    })
  })
}

const handleDelete = (model: FEDepartTableName) => {
  delete_FE_TableName(model.id).then(res => {
    if (res.success) {
      window.$message.success(res.message)
      tableDataInit(queryParam.value)
    } else {
      window.$message.error(res.message)
    }
  })
}

</script>

<style scoped>

</style>
