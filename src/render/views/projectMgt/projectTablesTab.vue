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

  <n-modal
      v-model:show="showPreviewModalRef"
      :mask-closable="true"
      :closable="true"
      preset="card"
      role="card"
      :show-icon="false"
      :title="modalTitle"
      :size="'small'"
      style="width: calc(100vw - 100px);"
  >

    <n-data-table
        style="overflow: auto"
        class="mt-2 mb-2"
        :key="(row) => row.id"
        :columns="previewColsRef"
        :data="previewTableDataRef"
        :bordered="true"
        :size="'small'"
        :striped="true"
        :loading="isPreviewTableLoading"
        :max-height="450"
    />

  </n-modal>


  <n-modal
      v-model:show="showUpdateModalRef"
      :mask-closable="true"
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
          <n-input v-model:value="modalFormModel.tableName" placeholder=""
                   @keydown.enter.prevent
                   readonly
          />
        </n-form-item-gi>
        <n-form-item-gi label="注释" path="tableComment">
          <n-input ref="commentInputRef" v-model:value="modalFormModel.tableComment" placeholder="输入注释"
                   @keydown.enter.prevent
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
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {exec_sql, get_tables_info, table_delete, table_preview} from "@render/api/datacenter";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {showButton, showConfirmation} from "@render/utils/datacenter/jobTabUtil";
import {Refresh} from '@vicons/ionicons5'
import {DataTableColumns, FormInst, NButton, NSpace, NPopconfirm} from "naive-ui";
import {h, onMounted, reactive, ref, watch, computed} from "vue";

const queryParam = ref('')

const projectTree = useProjectTreeStore()

// 创建计算属性来获取 Pinia 存储中的值
const defaultSelectedKeys = computed(() => projectTree.defaultSelectedKeys)

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
  const segments = useProjectTreeStore().defaultSelectedKeys[0].split('-');
  const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
  if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
    const projectId = segments[segments.length - 2]
    const project = (await find_by_project_id(projectId))
    queryParam.value = `${project.tableAbbr}_${segments[segments.length - 1].toLowerCase()}`
    await tableDataInit()
  }
})

const isTableLoading = ref(false)

const tableDataRef = ref([])

const tableDataInit = async () => {
  isTableLoading.value = true

  if (queryParam.value.length > 0) {
    tableDataRef.value = (await get_tables_info({
      size: 10000,
      page: 1,
      sourceId: 6,
      likeValue: queryParam.value
    })).data?.records || []
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
const showPreviewModalRef = ref(false)

let modalTitle = '';

const previewColsRef = ref([])

const tableHeadCol = ref([])

const tableRows = ref([])

const previewTableDataRef = ref([])

const isPreviewTableLoading = ref(false)
const tablePreview = (row) => {
  previewColsRef.value = []
  previewTableDataRef.value = []

  isPreviewTableLoading.value = true
  modalTitle = row.tableName

  table_preview(6, row.tableName).then(res => {
    if (res.code == 200) {
      if (res.data && res.data.length != 0) {

        tableHeadCol.value = res.data[0]
        tableRows.value = res.data.slice(1)

        // 创建表头
        previewColsRef.value = res.data[0].map((col) => ({
          title: col,
          key: col,
          // fixed: key.split('.')[1] === 'id' ? 'left' : false
          width: '200px',
          ellipsis: {
            tooltip: true
          }
        }));

        // 处理数据
        previewTableDataRef.value = res.data.slice(1).map((item) =>
            Object.values(item).map(
                (value) => (value === null ? 'null' : value.toString())
            )
        )

        previewTableDataRef.value = transform(previewColsRef.value, res.data.slice(1).map((item) =>
            Object.values(item).map(
                (value) => (value === null ? 'null' : value.toString())
            )
        ));
      }
    } else {
      window.$message.error(res.message)
    }
  }).finally(() => isPreviewTableLoading.value = false)

  showPreviewModalRef.value = true
}

interface ObjA {
  title: string;
  key: string
}

type ObjB = Array<string[]>;

const transform = (objA: ObjA[], objB: ObjB): Record<string, string>[] => {
  const transformed: Record<string, string>[] = [];
  for (const row of objB) {
    const obj: Record<string, string> = {};
    for (let i = 0; i < row.length && i < objA.length; i++) {
      obj[objA[i].key] = row[i];
    }
    transformed.push(obj);
  }
  return transformed;
}
// endregion

//region 修改表注解
const showUpdateModalRef = ref(false)

const commentInputRef = ref(null)

const updateTableComment = (row: Table) => {
  modalFormModel.value.id = row.id
  modalFormModel.value.tableName = row.tableName
  modalFormModel.value.tableComment = row.tableComment

  commentInputRef.value?.focus()

  showUpdateModalRef.value = true
}

const modalFormRef = ref<FormInst | null>(null);

const modalFormModel = ref({
  id: null,
  tableName: '',
  tableComment: ''
})

const modalFormRules = {
  tableName: {
    required: true
  },
  tableComment: {
    required: true,
    trigger: ['input'],
    message: '请输入注释'
  }
}

const onNegativeClick = () => {
  showUpdateModalRef.value = false
}

const isSaving = ref(false)

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

const onPositiveClick = () => {
  isSaving.value = true

  modalFormRef.value?.validate(async (errors) => {
    if (!errors) {

      paramModel.ddlSql = `ALTER TABLE ${modalFormModel.value.tableName} SET TBLPROPERTIES ('comment' = '${modalFormModel.value.tableComment}')`

      await exec_sql(paramModel).then((res) => {
        if ((res.code == 500 && res.message === '服务器内部错误') || (res.code == 200 && res.success)) {
          window.$message.success('执行成功')
          showUpdateModalRef.value = false
          tableDataInit()
        } else {
          window.$message.error(`执行失败,${res.message.replace(/建表失败，/g, '')}`)
        }
      }).finally(() => {
        isSaving.value = false
      })
    } else {
      console.error(errors)
    }
  })

}

//endregion

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
const tableTruncate = async (row: Table) => {

  paramModel.ddlSql = `TRUNCATE TABLE ${row.tableName}`

  await exec_sql(paramModel).then((res) => {
    if ((res.code == 500 && res.message === '服务器内部错误') || (res.code == 200 && res.success)) {
      window.$message.success('执行成功')
      showUpdateModalRef.value = false
    } else {
      window.$message.error(`执行失败,${res.message.replace(/建表失败，/g, '')}`)
    }
  })
}

//endregion
</script>

<style scoped>

</style>
