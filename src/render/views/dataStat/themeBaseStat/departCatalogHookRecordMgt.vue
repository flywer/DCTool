<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 160px);" trigger="hover">
    <div class="w-auto h-8 mb-2">
      <n-space inline class="float-right">
        <n-input-group>
          <n-input
              v-model:value="queryParam"
              placeholder="搜索部门名称"
              clearable
              :readonly="isTableLoading"
              @keydown.enter="tableDataInit"
          >
            <template #prefix>
              <n-icon>
                <Search/>
              </n-icon>
            </template>
          </n-input>
          <n-button type="primary" ghost @click="tableDataInit">
            搜索
          </n-button>
        </n-input-group>
        <n-button secondary type="info" @click="updateByExcel" :loading="isImporting">
          导入
          <template #icon>
            <n-icon v-if="!isImporting">
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
        :scroll-x="1400"
    />

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
</template>

<script setup lang="ts">
import {CatalogHookType, DepartCatalogHookRecord} from "@main/entity/DepartCatalogHookRecord";
import {
  delete_catalog_hook_record,
  download_catalog_hook_info_import_template,
  get_depart_catalog_hook_info_by_page,
  update_depart_catalog_hook_info_by_excel
} from "@render/api/auxiliaryDb/departCatalogHookRecord.api";
import {showConfirmation} from "@render/utils/datacenter/jobTabUtil";
import {ArrowDownload20Regular, ArrowUpload20Regular} from "@vicons/fluent"
import {Refresh, Search} from "@vicons/ionicons5"
import {DataTableColumns, NButton, NIcon, NSpace} from "naive-ui"
import {h, onMounted, reactive, ref} from "vue"

const queryParam = ref('')

onMounted(() => {
  tableDataInit()
})

const tableDataRef = ref<DepartCatalogHookRecord[]>([])
const isTableLoading = ref(false)

const tableDataInit = async () => {
  isTableLoading.value = true

  const data = await get_depart_catalog_hook_info_by_page({
    pageNo: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
    searchParam: queryParam.value
  })

  tableDataRef.value = data.records
  paginationReactive.itemCount = data.total || 0
  isTableLoading.value = false
}

const createColumns = (): DataTableColumns<DepartCatalogHookRecord> => {
  return [
    {
      title: '地市名称',
      key: 'cityName',
      width: '6%',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '区县名称',
      key: 'districtName',
      width: '6%',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '镇街名称',
      key: 'townName',
      width: '6%',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '部门名称',
      key: 'departName',
      width: '20%',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '行政许可',
      key: 'AL',
      width: '5%',
      align: 'center',
      render(row) {
        return convertCatalogHookType(row.AL)
      }
    },
    {
      title: '行政征收',
      key: 'AE',
      width: '5%',
      align: 'center',
      render(row) {
        return convertCatalogHookType(row.AE)
      }
    },
    {
      title: '行政检查',
      key: 'AC',
      width: '5%',
      align: 'center',
      render(row) {
        return convertCatalogHookType(row.AC)
      }
    },
    {
      title: '行政处罚',
      key: 'AP',
      width: '5%',
      align: 'center',
      render(row) {
        return convertCatalogHookType(row.AP)
      }
    },
    {
      title: '行政强制',
      key: 'AF',
      width: '5%',
      align: 'center',
      render(row) {
        return convertCatalogHookType(row.AF)
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: '5%',
      align: 'center',
      fixed: 'right',
      render(row) {
        return h(NSpace, {
          justify: 'center'
        }, [
          showConfirmation('删除', () => {
            handleDelete(row)
          }),
        ])
      }
    }
  ]
}

const convertCatalogHookType = (type: number): string => {
  switch (type) {
    case CatalogHookType.noAuthority:
      return '无职权'
    case CatalogHookType.noCatalog:
      return '未编目'
    case CatalogHookType.catalogedNoData:
      return '已编目无数据'
    case CatalogHookType.hooked:
      return '已编目已挂接'
    case CatalogHookType.nationalVertical:
      return '使用国垂系统'
    case CatalogHookType.provincialVertical:
      return '使用省垂系统'
    case CatalogHookType.yzf:
      return '粤执法'
    default:
      return '未限定'
  }
}

const columnsRef = ref(createColumns())

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  onChange: async (page: number) => {
    paginationReactive.page = page
    await tableDataInit()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    tableDataInit()
  }
})

const isImporting = ref(false)

// region 导入
const updateByExcel = () => {
  isImporting.value = true
  update_depart_catalog_hook_info_by_excel()
      .then(res => {
        if (res.success) {
          window.$message.success(res.message)
          tableDataInit()
        } else {
          window.$notification.create({
            title: "文件导入失败",
            content: res.message,
            type: "error"
          })
        }
      })
      .finally(() => isImporting.value = false)
}

const downloadTemplate = () => {
  download_catalog_hook_info_import_template().then(res => {
    if (res.success) {
      window.$message.success(res.message)
    } else {
      window.$message.error(res.message)
    }
  })
}

// endregion

const handleDelete = (row: DepartCatalogHookRecord) => {
  delete_catalog_hook_record(row.id).then(res => {
    if (res.success) {
      window.$message.success(res.message)
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  })
}
</script>

<style scoped>

</style>
