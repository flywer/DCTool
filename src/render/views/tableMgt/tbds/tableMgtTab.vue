<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
    <div class="w-auto h-8 mb-2">
      <n-space inline class="float-right">
        <n-input-group>
          <n-input
              v-model:value="queryParam"
              placeholder="搜索"
              clearable
              :readonly="isTableLoading"
              @keydown.enter="handleSearch"
          >
            <template #prefix>
              <n-icon>
                <Search/>
              </n-icon>
            </template>
          </n-input>
          <n-button type="primary" ghost @click="handleSearch">
            搜索
          </n-button>
        </n-input-group>
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
        :bordered="true"
        :size="'small'"
        :loading="isTableLoading"
        :striped="true"
    />

    <n-space class="mt-2" justify="end">
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

  <table-edit-modal
      v-model:show="showEditModalRef"
      :table-id="editModalModelRef.tableId"
      :title="editModalTitle"
      @onAfterLeave="tableDataInit"
  />

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

</template>

<script setup lang="ts">
import {PageTableType} from "@common/types/datacenter/visualTable";
import {get_tables_info_page, table_delete, table_preview} from "@render/api/datacenter.api";
import {showButton, showConfirmation} from "@render/utils/datacenter/jobTabUtil";
import TableEditModal from "@render/views/tableMgt/tbds/components/tableEditModal.vue";
import {Refresh, Search} from "@vicons/ionicons5";
import {DataTableColumns, NButton, NIcon, NSpace, NInput} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

onMounted(() => {
  tableDataInit()
})

const sourceId = 6

const queryParam = ref('')

const tableDataRef = ref<PageTableType[]>([])
const isTableLoading = ref(false)
const createColumns = (): DataTableColumns<PageTableType> => {
  return [
    {
      title: '表名称',
      key: 'tableName',
    },
    {
      title: '表描述',
      key: 'tableComment',
    },
    {
      title: '存储格式',
      key: 'storageFormat'
    },
    {
      title: '创建时间',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      render(row) {
        return h(NSpace, {
          justify: 'center'
        }, [
          showButton('预览', () => {
            tablePreview(row)
          }),
          showButton('编辑', () => {
            editModalInit(row)
          }),
          showConfirmation('删除', () => {
            tableDelete(row)
          })
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
    tableDataInit()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    tableDataInit()
  }
})

const tableDataInit = async () => {
  isTableLoading.value = true

  const result = await get_tables_info_page({
    size: paginationReactive.pageSize,
    page: paginationReactive.page,
    likeValue: queryParam.value,
    sourceId: sourceId
  })

  tableDataRef.value = result.data.records || []
  paginationReactive.itemCount = result.data.total || 0

  isTableLoading.value = false
}

const handleSearch = () => {
  paginationReactive.page = 1
  tableDataInit()
}

// region 编辑
const showEditModalRef = ref(false)
const editModalTitle = ref('')
const editModalModelRef = ref({
  tableId: null
})

const editModalInit = (row: PageTableType) => {

  editModalTitle.value = '编辑'

  showEditModalRef.value = true

  editModalModelRef.value.tableId = row.id
}

const tableDelete = (row: PageTableType) => {
  table_delete(row.id).then(res => {
    if (res.code == 200 && res.success) {
      window.$message.success("删除成功")
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  })
}

//region 预览
const showPreviewModalRef = ref(false)

let modalTitle = '';

const previewColsRef = ref([])

const tableHeadCol = ref([])

const tableRows = ref([])

const previewTableDataRef = ref([])

const isPreviewTableLoading = ref(false)
const tablePreview = (row: {
  id?: string;
  tableName: any;
  tableComment?: string;
  createTime?: string;
}) => {
  previewColsRef.value = []
  previewTableDataRef.value = []

  isPreviewTableLoading.value = true
  modalTitle = row.tableName

  table_preview(6, row.tableName).then(res => {
    if (res.code == 200) {
      if (res.data.length != 0) {

        tableHeadCol.value = res.data[0]
        tableRows.value = res.data.slice(1)

        // 创建表头
        previewColsRef.value = res.data[0].map((col: any) => ({
          title: col,
          key: col,
          // fixed: key.split('.')[1] === 'id' ? 'left' : false
          width: '200px',
          ellipsis: {
            tooltip: true
          }
        }));

        // 处理数据
        previewTableDataRef.value = res.data.slice(1).map((item: {
              [s: string]: unknown;
            } | ArrayLike<unknown>) =>
                Object.values(item).map(
                    (value) => (value === null ? 'null' : value.toString())
                )
        )

        previewTableDataRef.value = transform(previewColsRef.value, res.data.slice(1).map((item: ArrayLike<unknown> | {
              [s: string]: unknown;
            }) =>
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

// endregion

</script>

<style scoped>

</style>
