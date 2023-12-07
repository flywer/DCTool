<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <n-space inline class="float-right">
          <n-button secondary strong @click="tableDataInit">
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
          :pagination="paginationReactive"
          :bordered="true"
          :size="'small'"
          :loading="isTableLoading"
          :striped="true"
      >
      </n-data-table>

    </n-scrollbar>
  </n-layout>

  <table-preview-modal
      v-model:show="tablePreviewConfig.show"
      :datasource-id="tablePreviewConfig.datasourceId"
      :table-name="tablePreviewConfig.tableName"
  />

</template>

<script setup lang="ts">
import {DC_Datasource} from "@common/types/datacenter/common";
import {exec_sql, get_tables_info_page, table_delete} from "@render/api/datacenter.api";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {showButton, showConfirmation} from "@render/utils/datacenter/jobTabUtil";
import TablePreviewModal from "@render/views/jobMgt/components/tablePreviewModal.vue";
import {Refresh} from '@vicons/ionicons5'
import {DataTableColumns, NButton, NSpace, NPopconfirm} from "naive-ui";
import {h, onMounted, reactive, ref, watch, computed} from "vue";

const queryParam = ref('')

const projectTree = useProjectTreeStore()

// 创建计算属性来获取 Pinia 存储中的值
const defaultSelectedKeys = computed(() => projectTree.selectedKeys)

watch(defaultSelectedKeys, async (newValue) => {
  if (newValue[0] != null) {
    const segments = newValue[0].split('-');
    const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
    if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
      const projectId = segments[segments.length - 2]
      const project = (await find_by_project_id(projectId))
      queryParam.value = `${project.tableAbbr}_${segments[segments.length - 1].toLowerCase()}`

      await tableDataInit()
    }

  }
})

type Table = {
  id: string
  tableName: string
  tableComment: string
  createTime: string
}

onMounted(async () => {
  queryParam.value = `df_lake_`
  await tableDataInit()
})

const isTableLoading = ref(false)

const tableDataRef = ref([])

const tableDataInit = async () => {
  isTableLoading.value = true

  if (queryParam.value.length > 0) {
    const data = (await get_tables_info_page({
      size: 100,
      page: 1,
      sourceId: 6,
      likeValue: queryParam.value
    })).data?.records || []

    tableDataRef.value = data.filter(table => !table.tableName.includes('_error_') && table.tableName.endsWith('_dm'))
  }

  isTableLoading.value = false
}

const createColumns = (): DataTableColumns<Table> => {
  return [
    {
      title: '表名称',
      key: 'tableName',
      width: '25%'
    },
    {
      title: '表描述',
      key: 'tableComment',
      width: '25%'
    },
    {
      title: '创建时间',
      key: 'createTime',
      width: '15%',
    },
    {
      title: '操作',
      key: 'actions',
      width: '18%',
      align: 'center',
      render(row) {
        return h(NSpace, {
          justify: 'center'
        }, [
          showButton('预览', () => {
            tablePreview(row)
          }),
          /*  h(NButton, {
             size: 'small',
             onClick: () => {
               updateTableComment(row)
             }
           }, {default: () => '修改表注解'}), */
          h(NPopconfirm, {
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: async () => {
              await tableTruncate(row)
            },
          }, {
            trigger: () => {
              return h(NButton, {size: 'small'}, {default: () => '清空'})
            },
            default: () => `确定要使用[TRUNCATE]命令清空吗？`
          }),
          showConfirmation('删除', () => {
            tableDelete(row)
          })
        ],)
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

//region 预览
const tablePreviewConfig = ref({
  show: false,
  tableName: null,
  datasourceId: null
})

const tablePreview = (row: Table) => {
  tablePreviewConfig.value.show = true
  tablePreviewConfig.value.tableName = row.tableName
  tablePreviewConfig.value.datasourceId = DC_Datasource.tbds
}

// endregion

// region 删除
const tableDelete = (row: Table) => {
  table_delete(row.id).then(res => {
    if (res.code == 200 && res.success) {
      window.$message.success("删除成功")
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  })
}
//endregion

//region  清空表
let paramModel = {
  sourceId: '6',
  dbType: 'tbds-hive',
  sourceName: '',
  dataTierCode: '',
  dataTierName: '',
  namedJson: '',
  datamodelTableFieldsVoList: [],
  lifeCycle: '1',
  ddlSql: '',
  tableName: 'execSql'
}

const tableTruncate = async (row: Table) => {

  paramModel.ddlSql = `TRUNCATE TABLE ${row.tableName}`

  await exec_sql(paramModel).then((res) => {
    if ((res.code == 500 && res.message === '服务器内部错误') || (res.code == 200 && res.success)) {
      window.$message.success('执行成功')

    } else {
      window.$message.error(`执行失败,${res.message.replace(/建表失败，/g, '')}`)
    }
  })
}

//endregion
</script>

<style scoped>

</style>
