<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <div class="float-left leading-8 font-bold text-base" style="max-width: 40%">
          <n-skeleton v-if="isTableLoading" :width="300" size="small"/>
          <n-ellipsis style="max-width: 100%" v-else>无用任务</n-ellipsis>
        </div>
        <n-space inline class="float-right" style="max-width: 60%">

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
          :scroll-x="1200"
      >
        <template #empty>
          <span style="color: rgba(194, 194, 194, 1)">未选择项目对应表</span>
        </template>
      </n-data-table>
    </n-scrollbar>
  </n-layout>


  <job-log-drawer v-model:show="showDrawerRef" :job="drawerJobRef"/>

  <n-modal
      v-model:show="showPreviewModalRef"
      :mask-closable="true"
      :closable="true"
      preset="card"
      role="card"
      :show-icon="false"
      :title="previewModalTitle"
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

  <workflow-config-modal
      v-model:show="workflowModalConfig.show"
      :job-id="workflowModalConfig.workflowId"
      :editable="workflowModalConfig.editable"
      @onAfterLeave="tableDataInit"
  />

</template>

<script setup lang="ts">
import {Workflow} from "@common/types/datacenter/workflow";
import {getJobTypeComment, Job, JobType} from "@common/types/jobMgt";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_cj_job_page, get_dataXJob, get_job_project_by_id, get_workflow_page} from "@render/api/datacenter.api";
import {get_table_data} from "@render/api/front.api";
import WorkflowConfigModal from "@render/components/datacenter/workflowConfigModal.vue";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {calculateDaysDifferenceFromNow, formatDate} from "@render/utils/common/dateUtils";
import {createGxJob} from "@render/utils/datacenter/gxJob";
import {
  dataXJobGetNextExecTime,
  dataXJobRun,
  dataXJobStart,
  dataXJobStop,
  getDataXJobStatus,
  getJobType,
  getSchedJob, getWorkflowJobStatus,
  jobNameCompare, renderDataXJobActionButton, renderWorkflowActionButton,
  setJobStatus,
  showButton,
  showButtonPopover,
  showConfirmation,
  showTextButton, workflowJobGetLastExecTime, workflowJobGetNextExecTime,
} from "@render/utils/datacenter/jobTabUtil";
import JobLogDrawer from "@render/views/jobMgt/components/jobLogDrawer.vue";
import {Refresh} from "@vicons/ionicons5";
import {VNode} from "@vue/runtime-core";
import {isEmpty} from "lodash-es";
import {DataTableColumns, NButton, NSpace, NTag} from "naive-ui";
import {computed, h, onMounted, ref, watch} from "vue";

const projectTree = useProjectTreeStore()

// 创建计算属性来获取 Pinia 存储中的值
const defaultSelectedKeys = computed(() => projectTree.selectedKeys)

const projectId = '67'

// 当前项目示例，辅助库信息
const projectRef = ref(null)

// 当前项目示例，数据中台信息
const datacenterProjectRef = ref(null)

watch(defaultSelectedKeys, (newValue, oldValue) => {
  if (newValue.length == 0) {
    newValue = oldValue
    projectTree.selectedKeys = newValue
  }
  if (newValue[0] != null) {
    pageInit()
  }
})

onMounted(() => {
  pageInit()
})

const pageInit = async () => {
  projectRef.value = await find_by_project_id(projectId)
  datacenterProjectRef.value = await get_job_project_by_id(projectId)
  await tableDataInit()
}

// region 数据表

const tableDataRef = ref([])
const isTableLoading = ref(false)

const tableDataInit = async () => {

  isTableLoading.value = true

  // 采集任务
  let dataXJobs = (await get_cj_job_page({
    current: 1,
    size: 10,
    projectName: '无用任务',
    subsystemName: "采集"
  })).data.records

  let jobs = []

  for (const v of dataXJobs) {
    const schedJob = await getSchedJob(v.jobDesc)

    const job: Job = {
      id: v.id,
      jobName: v.jobDesc,
      status: await getDataXJobStatus(v, schedJob),
      type: getJobType(v.jobDesc),
      schedMode: 2,
      cron: schedJob?.jobCron || null,
      lastExecTime: v.triggerLastTime || '--',
      nextExecTime: dataXJobGetNextExecTime(schedJob),
      createBy: null,
      createTime: schedJob?.addTime || '--',
      updateTime: schedJob?.updateTime || '--',
      jobRerunType: v.editModel == 1 ? 2 : 1,
      project: projectRef.value
    }

    jobs.push(job)
  }

  const workflowJobs: Workflow[] = (await get_workflow_page({
    page: 1,
    size: 10000,
    status: null,
    procName: '_junk\\_'
  })).data?.records || []

  for (const v of workflowJobs) {
    const job: Job = {
      id: v.id,
      jobName: v.procName,
      type: getJobType(v.procName),
      status: getWorkflowJobStatus(v),
      schedMode: parseInt(v.schedulingMode) == 1 ? 1 : 2,
      cron: v.crontab == '' ? null : v.crontab,
      lastExecTime: await workflowJobGetLastExecTime(v),
      nextExecTime: workflowJobGetNextExecTime(v),
      createBy: v.createBy,
      code: v.procCode,
      createTime: v.createTime,
      updateTime: v.updateTime,
      jobRerunType: v.editModel == 1 ? 2 : 1,
      project: projectRef.value
    }

    jobs.push(job)
  }

  tableDataRef.value = jobs.sort(jobNameCompare)

  isTableLoading.value = false
}

const createColumns = (): DataTableColumns<Job> => {
  return [
    {
      title: '任务名',
      key: 'jobName',
      width: '8%'
    },
    {
      title: '任务类型',
      key: 'type',
      width: '5%',
      render(row) {
        return getJobTypeComment(row.type)
      }
    },
    {
      title: '状态',
      key: 'status',
      width: '3%',
      align: 'center',
      render(row) {
        return setJobStatus(row)
      }
    },
    {
      title: '上次执行时间',
      key: 'lastExecTime',
      width: '8%',
      render(row) {
        if (row.lastExecTime != '-') {
          if (calculateDaysDifferenceFromNow(row.lastExecTime) <= -7) {
            return h(NTag, {
              bordered: false,
              type: 'warning'
            }, row.lastExecTime)
          } else {
            return row.lastExecTime
          }
        } else {
          return row.lastExecTime
        }
      }
    },
    {
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '8%'
    },
    {
      title: '任务创建时间',
      key: 'createTime',
      width: '8%'
    },
    {
      title: '任务更新时间',
      key: 'updateTime',
      width: '8%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '12%',
      align: 'center',
      fixed: 'right',
      render(row) {

        let container = h(NSpace, {
          justify: 'center'
        })

        let children: VNode[] = []

        // 未创建的任务
        if (row.status == -1) {

        } else {
          if (row.type === JobType.cj || row.type === JobType.gx) {
            children = renderDataXJobActionButton(row, () => {
            }, tableDataInit)
          } else {
            children = renderWorkflowActionButton(row, tableDataInit)
          }
        }

        if (children.length == 3) {
          // '更多'按钮的子组件
          let moreBtnPopoverChildren: VNode[] = []

          moreBtnPopoverChildrenPush(row, moreBtnPopoverChildren)

          // 若只有一个则直接添加到children里
          if (moreBtnPopoverChildren.length == 1) {
            childrenPushMoreBtn(row, children)
          } else {
            if (!isEmpty(moreBtnPopoverChildren)) {
              children.push(showButtonPopover('更多', moreBtnPopoverChildren))
            }
          }

        } else {
          childrenPushMoreBtn(row, children)
        }

        container.children = children

        return container
      }
    }
  ]
}

const moreBtnPopoverChildrenPush = (row: Job, moreBtnChildren: VNode[]) => {
  if ((row.type === JobType.cj || row.type === JobType.gx) && ![0, -1].includes(row.status)) {
    moreBtnChildren.push(showTextButton('日志', () => showJobLogDrawer(row)))
  }

  if ((row.type === JobType.cj) && ![0, -1, 3].includes(row.status)) {
    //moreBtnChildren.push(showTextButton('任务配置', () => showDataXJobSetupModal(row)))
  }

  if (!(row.type === JobType.cj || row.type === JobType.gx) && ![0, -1].includes(row.status)) {
    moreBtnChildren.push(showTextButton('日志', () => showJobLogDrawer(row)))
    moreBtnChildren.push(showTextButton('任务配置', () => showWorkflowConfigModal(row)))
  }

  if (row.type.includes('zj') && ![-1, 2, 3].includes(row.status)) {
    //moreBtnChildren.push(showTextButton('更新规则', () => showZjJobUpdateModal(row)))
  }

  if (row.type.includes('zj') && ![-1].includes(row.status)) {
    // moreBtnChildren.push(showTextButton('质检配置', () => zjJobInspConfigModalInit(row)))
    // moreBtnChildren.push(showTextButton('质检情况', () => zjJobInspSituationModalInt(row)))
  }

  if (row.type === JobType.cj && row.status != -1) {
    moreBtnChildren.push(showTextButton('源表预览', () => tablePreview(row)))
  }

  if ((row.type === JobType.rh) && ![-1, 2, 3].includes(row.status)) {
    // moreBtnChildren.push(showTextButton('更新任务配置', () => showUpdateRhJobDialog(row)))
  }
}

// children直接添加更多中的组件
const childrenPushMoreBtn = (row: Job, children: VNode[]) => {

  if ((row.type === JobType.cj || row.type === JobType.gx) && ![0, -1].includes(row.status)) {
    children.push(showButton('日志', () => showJobLogDrawer(row)))
  }

  if ((row.type === JobType.cj) && ![0, -1, 3].includes(row.status)) {
    // children.push(showButton('任务配置', () => showDataXJobSetupModal(row)))
  }

  if (!(row.type === JobType.cj || row.type === JobType.gx) && ![0, -1].includes(row.status)) {
    children.push(showButton('日志', () => showJobLogDrawer(row)))
    children.push(showButton('任务配置', () => showWorkflowConfigModal(row)))
  }

  if (row.type.includes('zj') && ![-1, 2, 3].includes(row.status)) {
    //  children.push(showButton('更新规则', () => showZjJobUpdateModal(row)))
  }

  if (row.type.includes('zj') && ![-1].includes(row.status)) {
    // children.push(showButton('质检配置', () => zjJobInspConfigModalInit(row)))
    //  children.push(showButton('质检情况', () => zjJobInspSituationModalInt(row)))
  }

  if (row.type === JobType.cj && row.status != -1) {
    children.push(showButton('源表预览', () => tablePreview(row)))
  }

  if (row.type === JobType.rh && ![-1, 2, 3].includes(row.status)) {
    //  children.push(showButton('更新任务配置', () => showUpdateRhJobDialog(row)))
  }
}

const columnsRef = ref(createColumns())

// endregion

// region 日志
const showDrawerRef = ref(false)
const drawerJobRef = ref<Job>(null)

const showJobLogDrawer = (v: Job) => {
  drawerJobRef.value = v
  showDrawerRef.value = true
}
//endregion

//region 预览
const showPreviewModalRef = ref(false)

let previewModalTitle = '';

const previewColsRef = ref([])

const tableHeadCol = ref([])

const tableRows = ref([])

const previewTableDataRef = ref([])

const isPreviewTableLoading = ref(false)
const tablePreview = async (row: Job) => {
  previewColsRef.value = []
  previewTableDataRef.value = []

  isPreviewTableLoading.value = true

  const jobInfo = await get_dataXJob(row.id)
  const tableName = jobInfo.data.jobTemplate.readerTable

  previewModalTitle = tableName

  get_table_data(tableName, 10, false)
      .then(res => {
        tableHeadCol.value = res[0]
        tableRows.value = res.slice(1)

        // 创建表头
        previewColsRef.value = res[0].map((col: string) => ({
          title: col,
          key: col,
          fixed: col === 'cd_time' ? 'right' : false,
          width: '200px',
          ellipsis: {
            tooltip: true
          }
        }));

        // 处理数据
        previewTableDataRef.value = transform(previewColsRef.value, res.slice(1).map((item: {
              [s: string]: unknown;
            } | ArrayLike<unknown>) =>
                Object.values(item).map(
                    (value) => {
                      if (value === null) {
                        return 'null'
                      } else if (value instanceof Date) {
                        return formatDate(value)
                      } else {
                        return value.toString()
                      }
                    }
                )
        ));
      })
      .catch(error => {
        console.error(error)
      })
      .finally(() => isPreviewTableLoading.value = false)

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

// region 工作流任务配置
const workflowModalConfig = ref({
  show: false,
  workflowId: null,
  editable: true
})

const showWorkflowConfigModal = (row: Job) => {
  workflowModalConfig.value.show = true
  workflowModalConfig.value.workflowId = row.id
  workflowModalConfig.value.editable = row.status != 3;
}
// endregion
</script>

<style scoped>

</style>
