<template>
  <n-layout>
    <n-scrollbar class="pr-2" :style="{height: inpsTableName?'590px':'calc(100vh - 170px)'}" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <div class="float-left leading-8 font-bold text-base" style="max-width: 30%">
          <n-skeleton v-if="isTableLoading" :width="200" size="small"/>
          <n-ellipsis style="max-width: 100%" v-else>
            {{ queryParam }}
          </n-ellipsis>
        </div>
        <n-space inline class="float-right">
          <n-form-item label="质检时间:" label-placement="left">
            <n-date-picker v-model:value="formModel.timeRange" type="datetimerange" clearable
                           @update:value="tableDataInit"
                           :size="'small'"
            />
          </n-form-item>
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
          :striped="false"
          :scroll-x="1000"
      >
        <template #empty>
          <span style="color: rgba(194, 194, 194, 1)">暂无质检记录</span>
        </template>
      </n-data-table>
      <n-space justify="end">
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
</template>

<script setup lang="ts">
import {InspectionRecord} from "@common/types";
import {open_default_browser} from "@render/api/app.api";
import {get_inps_record_page} from "@render/api/datacenter.api";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {formatDate} from "@render/utils/common/dateUtils";
import {showButton} from "@render/utils/datacenter/jobTabUtil";
import {DataTableColumns, NSpace, NNumberAnimation} from "naive-ui";
import {computed, onMounted, ref, watch, reactive, h} from "vue";

// 当组件使用时，供其他页面使用
const props = defineProps({
  inpsTableName: String,
  inpsTableDbId: String
})

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
      queryParam.value = `di_${project.tableAbbr}_${segments[segments.length - 1].toLowerCase()}_temp_ods`

      await tableDataInit()
    }

  }
})

onMounted(async () => {
  if (props.inpsTableName == undefined) {
    const segments = useProjectTreeStore().defaultSelectedKeys[0].split('-');
    const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
    if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
      const projectId = segments[segments.length - 2]
      const project = (await find_by_project_id(projectId))
      queryParam.value = `di_${project.tableAbbr}_${segments[segments.length - 1].toLowerCase()}_temp_ods`
      await tableDataInit()
    }
  } else {
    queryParam.value = props.inpsTableName
    await tableDataInit()
  }
})

const formModel = ref({
  timeRange: null
})

const tableDataInit = async () => {
  isTableLoading.value = true

  const data = (await get_inps_record_page({
    page: paginationReactive.page,
    size: paginationReactive.pageSize,
    orgIds: [],
    inspTime: timeRangeConvert(formModel.value.timeRange),
    likeName: queryParam.value
  })).data

  const records = data?.records || []

  paginationReactive.itemCount = data.total || 0

  if (records.length > 0) {
    tableDataRef.value = records.map(((v: InspectionRecord) => ({
      id: v.inspectionRecordId,
      inspectionTime: v.inspectionTime,
      orgName: v.orgName,
      sourceTableName: v.sourceTableName,
      totalRecordSum: v.totalRecordSum,
      aimRecordSum: v.aimRecordSum,
      wrongRecordSum: v.wrongRecordSum,
      repairRecordSum: v.repairRecordSum,
      unRepairRecordSum: v.unRepairRecordSum
    })))
  } else {
    tableDataRef.value = []
  }

  isTableLoading.value = false
}

const timeRangeConvert = (timeRange: (number | Date)[]) => {
  let res: string[] = []

  if (timeRange != null) {
    timeRange.forEach(time => {
      if (time instanceof Date) {
        res.push(formatDate(time))
      } else if (time == null) {
        res.push(null)
      } else {
        res.push(formatDate(new Date(time)))
      }
    })
  }

  return res
}

const tableDataRef = ref<InspectionItem[]>([])

const isTableLoading = ref(false)

type InspectionItem = {
  id: string
  // 质检时间
  inspectionTime: string
  // 所属单位
  orgName: string
  // 质检对象表名称
  sourceTableName: string
  // 质检数据总量
  totalRecordSum: number
  // 校验通过数量
  aimRecordSum: number
  // 校验失败数量
  wrongRecordSum: number
  // 已修复数量
  repairRecordSum: number
  // 未修复数量
  unRepairRecordSum: number
}

const createColumns = (): DataTableColumns<InspectionItem> => {
  return [
    {
      title: '质检时间',
      key: 'inspectionTime',
      width: '13%',
    },
    {
      title: '质检数据总量',
      key: 'totalRecordSum',
      width: '9%',
      render(row) {
        return h(NNumberAnimation, {
          from: row.totalRecordSum,
          to: row.totalRecordSum,
          showSeparator: true
        })
      }
    },
    {
      title: '校验通过数量',
      key: 'aimRecordSum',
      width: '9%',
      render(row) {
        return h(NNumberAnimation, {
          from: row.aimRecordSum,
          to: row.aimRecordSum,
          showSeparator: true
        })
      }
    },
    {
      title: '校验失败数量',
      key: 'wrongRecordSum',
      width: '9%',
      className: 'error-bg',
      render(row) {
        return h(NNumberAnimation, {
          from: row.wrongRecordSum,
          to: row.wrongRecordSum,
          showSeparator: true
        })
      }
    },
    {
      title: '已修复数量',
      key: 'repairRecordSum',
      width: '9%',
      render(row) {
        return h(NNumberAnimation, {
          from: row.repairRecordSum,
          to: row.repairRecordSum,
          showSeparator: true
        })
      }
    },
    {
      title: '未修复数量',
      key: 'unRepairRecordSum',
      width: '9%',
      render(row) {
        return h(NNumberAnimation, {
          from: row.unRepairRecordSum,
          to: row.unRepairRecordSum,
          showSeparator: true
        })
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: '7%',
      align: 'center',
      fixed: 'right',
      render(row) {
        return h(NSpace, {
          justify: 'center'
        }, [
          showButton('查看', () => {
            const link = `http://19.15.97.242:19080/szrzyt/data_center/qaportal/#/qualityDetail?id=${row.id}&dbid=${props.inpsTableDbId || 6}&name=${queryParam.value}`
            open_default_browser(link)
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

</script>

<style scoped>
:deep(.error-bg) {
  background: rgba(255, 100, 0, 0.1);
  color: rgb(255, 100, 0);
}
</style>
