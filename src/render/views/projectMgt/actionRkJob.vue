<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 95px);" trigger="hover">
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
        :scroll-x="1400"
    />
  </n-scrollbar>

  <n-drawer
      v-model:show="showDrawerRef"
      :width="220"
  >
    <n-drawer-content title="日志" :native-scrollbar="false" closable>
      <n-timeline v-if="!isEmpty(logItemsRef)">
        <n-timeline-item v-for="item in logItemsRef"
                         :type="item.type"
                         :title="item.title"
                         :content="item.content"
                         :time="item.time"
        />
      </n-timeline>
      <n-empty v-else description="无运行日志"/>
      <n-space v-if="showTipRef" class="mt-4" style="color: #999999" justify="center">仅显示前100条</n-space>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import {find_by_project_id, get_table_sql} from "@render/api/auxiliaryDb";
import {get_workflow_log, get_workflow_page} from "@render/api/datacenter";
import {
  getWorkflowJobStatus,
  Job,
  setJobStatus,
  showButton,
  showConfirmation,
  workflowActive,
  workflowDelete,
  workflowJobGetLastExecTime,
  workflowJobGetNextExecTime,
  workflowReRun, workflowRun,
} from "@render/utils/datacenter/jobTabUtil";
import {Refresh} from '@vicons/ionicons5'
import {isEmpty} from "lodash-es";
import {DataTableColumns, NButton, NSpace, TimelineItemProps} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

const tableDataRef = ref([])
const isTableLoading = ref(false)

const projectId = '26'

onMounted(() => {
  tableDataInit()
})

const tableDataInit = async () => {
  isTableLoading.value = true

  const project = (await find_by_project_id(projectId))
  const projectAbbr = project?.projectAbbr || '';

  //工作流任务
  const actionRkJobs = (await get_workflow_page({
    page: 1,
    size: 10000,
    status: null,
    procName: `rk_${projectAbbr}_`
  })).data.records

  let newJobs = []

  for (const v of actionRkJobs) {
    const job: Job = {
      id: v.id,
      jobName: v.procName,
      type: '数据入库任务',
      status: getWorkflowJobStatus(v),
      schedMode: v.schedulingMode,
      cron: v.crontab == '' ? null : v.crontab,
      lastExecTime: await workflowJobGetLastExecTime(v),
      nextExecTime: workflowJobGetNextExecTime(v),
      createBy: v.createBy,
      code: v.procCode,
      comment: await getTableComment(v.procName),
      createTime: v.createTime,
      updateTime: v.updateTime
    }

    newJobs.push(job)
  }

  tableDataRef.value = newJobs.sort((a, b) => {
    const aSplit = a.jobName.split("_");
    const bSplit = b.jobName.split("_");
    const aSplitValue = aSplit[2];
    const bSplitValue = bSplit[2];
    return aSplitValue.localeCompare(bSplitValue);
  })

  isTableLoading.value = false
}

const getTableComment = async (procName: string) => {
  return (await get_table_sql({
    tableName: procName.split('_')[2]
  }))[0].comment as string
}
const createColumns = (): DataTableColumns<Job> => {
  return [
    {
      title: '任务名',
      key: 'jobName',
      width: '10%'
    },
    {
      title: '数据类型',
      key: 'comment',
      width: '10%'
    },
    {
      title: '状态',
      key: 'status',
      width: '5%',
      align: 'center',
      render(row) {
        return setJobStatus(row)
      }
    },
    {
      title: '上次执行时间',
      key: 'lastExecTime',
      width: '10%'
    },
    {
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '10%'
    },
    {
      title: '任务创建时间',
      key: 'createTime',
      width: '10%'
    },
    {
      title: '任务更新时间',
      key: 'updateTime',
      width: '10%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '15%',
      align: 'center',
      fixed: 'right',
      render(row) {

        let container = h(NSpace, {
          justify: 'center'
        })

        switch (row.status) {
          case  1: // 任务停用
            container.children = [
              showButton('启用', async () => {
                await workflowActive(row.id, '01', () => tableDataInit())
              }),
              showConfirmation('执行', async () => {
                await workflowActive(row.id, '01', () => {
                  workflowRun(row, false, '', () => tableDataInit())
                })

              }),
              showConfirmation('删除', async () => {
                await workflowDelete(row.id, () => tableDataInit())
              }),
              showButton('日志', () => showWorkflowLog(row)),
            ]
            break
          case 2:// 任务启用
            container.children = [
              showButton('停用', async () => {
                await workflowActive(row.id, '02', () => tableDataInit())
              }),
              showConfirmation('执行', () => {
                workflowRun(row, false, '', () => tableDataInit())
              }),
              showConfirmation('删除', async () => {
                await workflowActive(row.id, '02', () => {
                })
                await workflowDelete(row.id, () => tableDataInit())
              }),
              showButton('日志', () => showWorkflowLog(row)),
            ]
            break
          case 3:// 任务运行中
            container.children = [
              showButton('日志', () => showWorkflowLog(row)),
            ]
            break
          case 4:// 任务异常
            container.children = [
              showConfirmation('重跑', async () => {
                workflowReRun(row, () => tableDataInit())
              }),
              showButton('日志', () => showWorkflowLog(row)),
            ]
            break
          case 5:// 任务未反馈
            container.children = [
              showConfirmation('重跑', async () => {
                workflowReRun(row, () => tableDataInit())
              }),
              showConfirmation('删除', async () => {
                await workflowDelete(row.id, () => tableDataInit())
              }),
              showButton('日志', () => showWorkflowLog(row)),
            ]
            break
        }
        return container
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

// region 日志
const showDrawerRef = ref(false)
const logItemsRef = ref<TimelineItemProps[]>([])
const showTipRef = ref(false)
const showWorkflowLog = async (v) => {
  const logs = (await get_workflow_log(v.id, 100, 1)).data.records

  showTipRef.value = logs.length >= 100;

  logItemsRef.value = []

  logs.forEach(log => {
    let type
    let title
    let content
    let time

    if (log.result == null) {
      title = '运行中'
      type = 'info'
    } else if (log.result == 1) {
      title = '执行成功'
      type = 'success'
    } else if (log.result == 2) {
      title = '执行失败'
      type = 'error'
    } else if (log.result == 3) {
      title = '未反馈'
      type = 'warning'
    } else {
      title = '未知'
      type = 'warning'
    }

    time = log.startTime
    content = log.componentName

    logItemsRef.value.push({
      type: type,
      title: title,
      content: content,
      time: time
    })
  })

  showDrawerRef.value = true
}

//endregion

</script>

<style scoped>

</style>
