<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <div class="float-left leading-8 font-bold text-base" style="max-width: 30%">
          <n-skeleton v-if="isTableLoading" :width="200" size="small"/>
          <n-ellipsis style="max-width: 100%" v-else>
            {{ queryParam }}
          </n-ellipsis>
        </div>
        <n-space inline class="float-right">
          <n-date-picker v-model:value="formModel.timeRange" type="datetimerange" clearable
                         @update:value="tableDataInit"
          />
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
          :striped="false"
          :scroll-x="1000"
      >
        <template #empty>
          <span style="color: rgba(194, 194, 194, 1)">暂无质检记录</span>
        </template>
      </n-data-table>
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {open_default_browser} from "@render/api/app.api";
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {get_inps_record_page} from "@render/api/datacenter";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {getDateStringByDate} from "@render/utils/common/dateUtils";
import {getFirstDayOfMonth} from "@render/utils/common/getFirstDayOfMonth";
import {showButton} from "@render/utils/datacenter/jobTabUtil";
import {DataTableColumns, NSpace} from "naive-ui";
import {computed, onMounted, ref, watch, reactive, h} from "vue";

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
  const segments = useProjectTreeStore().defaultSelectedKeys[0].split('-');
  const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
  if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
    const projectId = segments[segments.length - 2]
    const project = (await find_by_project_id(projectId))
    queryParam.value = `di_${project.tableAbbr}_${segments[segments.length - 1].toLowerCase()}_temp_ods`
    await tableDataInit()
  }
})

const formModel = ref({
  timeRange: [getFirstDayOfMonth(), new Date()]
})

const tableDataInit = async () => {
  isTableLoading.value = true

  const records = (await get_inps_record_page({
    page: paginationReactive.page,
    size: paginationReactive.pageSize,
    orgIds: [],
    inspTime: timeRangeConvert(formModel.value.timeRange),
    likeName: queryParam.value
  })).data?.records || []

  if (records.length > 0) {
    tableDataRef.value = records.map((v => ({
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
        res.push(getDateStringByDate(time))
      } else {
        res.push(getDateStringByDate(new Date(time)))
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
      width: '9%'
    },
    {
      title: '校验通过数量',
      key: 'aimRecordSum',
      width: '9%'
    },
    {
      title: '校验失败数量',
      key: 'wrongRecordSum',
      width: '9%',
      className: 'error-bg'
    },
    {
      title: '已修复数量',
      key: 'repairRecordSum',
      width: '9%'
    },
    {
      title: '未修复数量',
      key: 'unRepairRecordSum',
      width: '9%'
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
            const link = `http://19.15.97.242:19080/szrzyt/data_center/qaportal/#/qualityDetail?id=${row.id}&dbid=6&name=${queryParam.value}`
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
  showSizePicker: true,
  pageSizes: [10, 20, 50],
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
