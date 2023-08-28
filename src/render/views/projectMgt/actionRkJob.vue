<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 95px);" trigger="hover">
    <div class="w-auto h-8 mb-2">
      <n-space inline class="float-right">
        <n-input-group>
          <n-input
              v-model:value="queryParam"
              placeholder="搜索"
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

  <job-log-drawer v-model:show="showDrawerRef" :job="drawerJobRef"/>
</template>

<script setup lang="ts">
import {WorkflowType} from "@common/types";
import {get_table_sql} from "@render/api/auxiliaryDb.api";
import {get_workflow_list_by_project_id} from "@render/api/datacenter.api";
import {
  getWorkflowJobStatus,
  Job, renderWorkflowActionButton,
  setJobStatus,
  showButton,
  workflowJobGetLastExecTime,
  workflowJobGetNextExecTime,
} from "@render/utils/datacenter/jobTabUtil";
import JobLogDrawer from "@render/views/projectMgt/components/jobLogDrawer.vue";
import {Refresh, Search} from '@vicons/ionicons5'
import {VNode} from "@vue/runtime-core";
import {DataTableColumns, NButton, NSpace} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

const tableDataRef = ref([])
const isTableLoading = ref(false)

const projectId = '26'

const queryParam = ref('')

onMounted(() => {
  tableDataInit()
})

const tableDataInit = async () => {
  isTableLoading.value = true

  // 工作流任务
  const allActionRkJobs: WorkflowType[] = (await get_workflow_list_by_project_id(projectId)).data

  const actionRkJobs: WorkflowType[] = allActionRkJobs.filter(job => job.procName.includes(queryParam.value))

  let newJobs = []

  for (const v of actionRkJobs) {
    const job: Job = {
      id: v.id,
      jobName: v.procName,
      type: '数据入库任务',
      status: getWorkflowJobStatus(v),
      schedMode: parseInt(v.schedulingMode),
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
      width: '9%'
    },
    {
      title: '数据类型',
      key: 'comment',
      width: '11%'
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

        let children: VNode[] = renderWorkflowActionButton(row, tableDataInit)

        if (![0, -1].includes(row.status)) {
          children.push(showButton('日志', () => showJobLogDrawer(row)))
        }

        container.children = children

        return container
      }
    }
  ]
}

const columnsRef = ref(createColumns())

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: false,
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

// region 日志
const showDrawerRef = ref(false)
const drawerJobRef = ref<Job>(null)

const showJobLogDrawer = (v: Job) => {
  drawerJobRef.value = v
  showDrawerRef.value = true
}
//endregion

</script>

<style scoped>

</style>
