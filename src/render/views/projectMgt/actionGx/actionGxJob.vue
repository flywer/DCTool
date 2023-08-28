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

  <n-modal
      v-model:show="showModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="modalTitle"
      :size="'small'"
  >

    <n-alert type="warning" :show-icon="false" v-if="showCronUnConfigAlert">
      此项目未进行调度配置，可能会与其他项目执行时间产生冲突，前往<b>调度管理</b>进行配置
    </n-alert>

    <n-form
        class="mt-4"
        ref="addSchedJobModalFormRef"
        :model="addSchedJobModalFormModel"
        :rules="addSchedJobModalFormRules"
        :size="'small'"
    >
      <n-grid :cols="14" :x-gap="4">
        <n-form-item-gi :span="7" label="调度任务名" path="jobContent">
          <n-input
              v-model:value="addSchedJobModalFormModel.jobContent"
              placeholder=""
              readonly
              @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="7" label="项目名" path="projectName">
          <n-input
              v-model:value="addSchedJobModalFormModel.projectName"
              placeholder=""
              readonly
              @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="7" label="是否重试" path="retry">
          <n-radio-group v-model:value="addSchedJobModalFormModel.retry">
            <n-radio-button
                :key="1"
                :value="'1'"
                label="是"
            />
            <n-radio-button
                :key="0"
                :value="'0'"
                label="否"
            />
          </n-radio-group>
        </n-form-item-gi>
        <n-form-item-gi :span="7" label="重试次数" path="executorFailRetryCount">
          <n-input-number v-model:value="addSchedJobModalFormModel.executorFailRetryCount" button-placement="both"/>
        </n-form-item-gi>

        <n-form-item-gi :span="1" label="秒" path="sec" :label-style="{margin:'0 auto'}">
          <n-input class="text-center"
                   v-model:value="addSchedJobModalFormModel.sec"
                   placeholder=""
                   @keydown.enter.prevent
                   readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="3" label="分" path="min" :label-style="{margin:'0 auto'}">
          <n-input-number class="text-center" v-model:value="addSchedJobModalFormModel.min" placeholder=""
                          :min="schedMinRange.startMin" :max="schedMinRange.endMIn"
                          @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="时" path="hour" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.hour" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="日" path="day" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.day" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="月" path="month" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.month" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="周" path="week" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.week" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="年" path="year" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.year" placeholder=""
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

  <job-log-drawer v-model:show="showDrawerRef" :job="drawerJobRef"/>

  <n-modal
      v-model:show="showDataXJobSetupModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="dataXJobSetupModalTitle"
      :size="'small'"
      style="width: 566px"
  >
    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
      <n-layout class="m-2">
        <n-form
            ref="dataXJobSetupFormRef"
            class="mt-4"
            :model="dataXJobSetupModelRef"
            :rules="dataXJobSetupModelRules"
            :size="'small'"
        >
          <n-grid :cols="17" :x-gap="4">
            <n-form-item-gi :span="7" label="是否重试" path="retry">
              <n-radio-group v-model:value="dataXJobSetupModelRef.retry">
                <n-radio-button
                    :key="1"
                    :value="'1'"
                    label="是"
                />
                <n-radio-button
                    :key="0"
                    :value="'0'"
                    label="否"
                />
              </n-radio-group>
            </n-form-item-gi>
            <n-form-item-gi :span="10" label="重试次数" path="executorFailRetryCount">
              <n-input-number v-model:value="dataXJobSetupModelRef.executorFailRetryCount"
                              button-placement="both"
              />
            </n-form-item-gi>

            <n-form-item-gi :span="3" label="秒" path="sec" :label-style="{margin:'0 auto'}">
              <n-input class="text-center"
                       v-model:value="dataXJobSetupModelRef.sec"
                       placeholder=""
                       @keydown.enter.prevent
                       readonly
              />
            </n-form-item-gi>
            <n-form-item-gi :span="3" label="分" path="min" :label-style="{margin:'0 auto'}">
              <n-input-number class="text-center" v-model:value="dataXJobSetupModelRef.min"
                              :min="schedMinRange.startMin" :max="schedMinRange.endMIn" placeholder=""
                              @keydown.enter.prevent
              />
            </n-form-item-gi>
            <n-form-item-gi :span="3" label="时" path="hour" :label-style="{margin:'0 auto'}">
              <n-input class="text-center" v-model:value="dataXJobSetupModelRef.hour" placeholder=""
                       @keydown.enter.prevent
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="日" path="day" :label-style="{margin:'0 auto'}">
              <n-input class="text-center" v-model:value="dataXJobSetupModelRef.day" placeholder=""
                       @keydown.enter.prevent
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="月" path="month" :label-style="{margin:'0 auto'}">
              <n-input class="text-center" v-model:value="dataXJobSetupModelRef.month" placeholder=""
                       @keydown.enter.prevent
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="周" path="week" :label-style="{margin:'0 auto'}">
              <n-input class="text-center" v-model:value="dataXJobSetupModelRef.week" placeholder=""
                       @keydown.enter.prevent
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="年" path="year" :label-style="{margin:'0 auto'}">
              <n-input class="text-center" v-model:value="dataXJobSetupModelRef.year" placeholder=""
                       @keydown.enter.prevent
              />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-layout>
    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="handleDataXJobSetupSave" :loading="isDataXJobSetupSaving">保存
      </n-button>
      <n-button :size="'small'" @click="showDataXJobSetupModalRef=!showDataXJobSetupModalRef">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {
  find_by_project_id,
  get_cj_cron_by_project_id,
  get_project_by_pro_abbr,
  get_table_sql
} from "@render/api/auxiliaryDb.api";
import {
  get_cj_job_page, update_sched_job,
} from "@render/api/datacenter.api";
import {convertCronExpression} from "@render/utils/common/cronUtils";
import {formatDate} from "@render/utils/common/dateUtils";
import {createSchedJob} from "@render/utils/datacenter/cjJob";
import {
  getDataXJobStatus,
  getSchedJob,
  Job, renderDataXJobActionButton,
  setJobStatus,
  showButton, showButtonPopover,
  showTextButton
} from "@render/utils/datacenter/jobTabUtil";
import JobLogDrawer from "@render/views/projectMgt/components/jobLogDrawer.vue";
import {Refresh, Search} from '@vicons/ionicons5'
import {VNode} from "@vue/runtime-core";
import {parseExpression} from "cron-parser";
import {isEmpty} from "lodash-es";
import {DataTableColumns, FormInst, NButton, NSpace} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

const tableDataRef = ref([])
const isTableLoading = ref(false)

const projectId = '27'

const queryParam = ref('')

onMounted(() => {
  tableDataInit()
})

const tableDataInit = async () => {
  isTableLoading.value = true

  const project = (await find_by_project_id(projectId))

  // 共享任务
  const allGxJobs = (await get_cj_job_page({
    current: 1,
    size: 10000,
    projectName: project.projectName,
    subsystemName: "采集"
  })).data.records

  const filterJobs = allGxJobs.filter((job: { jobDesc: string; }) => job.jobDesc.includes(queryParam.value))

  let newJobs = []

  for (const v of filterJobs) {
    const schedJob = await getSchedJob(v.jobDesc)

    const job: Job = {
      id: v.id,
      jobName: v.jobDesc,
      type: '数据共享任务',
      status: await getDataXJobStatus(v, schedJob),
      schedMode: 2,
      cron: schedJob?.jobCron || null,
      lastExecTime: v.triggerLastTime || '--',
      nextExecTime: cjJobGetNextExecTime(schedJob),
      createBy: null,
      comment: await getTableComment(v.jobDesc),
      createTime: schedJob?.addTime || '--',
      updateTime: schedJob?.updateTime || '--',
      project: project
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

const cjJobGetNextExecTime = (schedJob: any) => {
  const jobCron = schedJob?.jobCron || null
  if (jobCron != null) {
    const interval = parseExpression(convertToSixFields(jobCron));
    return formatDate(interval.next().toDate())
  } else {
    return '未配置调度任务'
  }
}

const convertToSixFields = (cron: string): string => {
  const fields = cron.split(' ');
  return `${fields[0]} ${fields[1]} ${fields[2]} ${fields[3]} ${fields[4]} ${fields[5]}`;
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
      width: '6%'
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
        let children: VNode[] = renderDataXJobActionButton(row, () => addSchedJobModalFormModelInit(row), tableDataInit)

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
  if (row.type === '数据共享任务' && ![0, -1].includes(row.status)) {
    moreBtnChildren.push(showTextButton('日志', () => showJobLogDrawer(row)))
    moreBtnChildren.push(showTextButton('调度配置', () => showDataXJobSetupModal(row)))
  }
}

// children直接添加更多中的组件
const childrenPushMoreBtn = (row: Job, children: VNode[]) => {
  if (row.type === '数据共享任务' && ![0, -1].includes(row.status)) {
    children.push(showButton('日志', () => showJobLogDrawer(row)))
    children.push(showButton('调度配置', () => showDataXJobSetupModal(row)))
  }

}

const columnsRef = ref(createColumns())

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
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

// region 新增调度任务
const showModalRef = ref(false)

let modalTitle = '';

const onNegativeClick = () => {
  showModalRef.value = false
}

const isSaving = ref(false)

const onPositiveClick = async () => {
  isSaving.value = true
  addSchedJobModalFormRef.value?.validate(async (errors) => {
    if (!errors) {
      createSchedJob(addSchedJobModalFormModel.value).then(() => {
        tableDataInit()
        showModalRef.value = false
      }).finally(() => {
        isSaving.value = false
      })
    } else {
      isSaving.value = false
      console.error(errors)
    }
  })
}

const addSchedJobModalFormRef = ref<FormInst | null>(null);

const addSchedJobModalFormModel = ref({
  jobType: "大数据采集",
  jobContent: '',
  glueType: "DATAX",
  projectId: '',
  projectName: '',
  jobCron: '',
  jobDesc: '',
  jobGroup: 2,
  retry: '0',
  executorFailRetryCount: 0,
  jobTemplateId: '',
  subsystemName: "采集",
  sec: '*',
  min: 0,
  hour: '0,12',
  day: '?',
  month: '*',
  week: '*',
  year: '*'
})

const addSchedJobModalFormRules = {
  jobContent: {
    required: true
  },
  projectName: {
    required: true
  },
  retry: {
    required: true,
    trigger: ['change']
  },
  sec: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  min: {
    type: 'number',
    required: true,
    trigger: ['input'],
    message: ''
  },
  hour: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  day: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  month: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  week: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  year: {
    required: true,
    trigger: ['input'],
    message: ''
  }
}

const showCronUnConfigAlert = ref(false)

let schedMinRange = {
  startMin: 0,
  endMIn: 59
}

const addSchedJobModalFormModelInit = async (v: Job) => {
  addSchedJobModalFormModel.value.jobContent = v.jobName
  addSchedJobModalFormModel.value.jobDesc = v.jobName
  addSchedJobModalFormModel.value.jobTemplateId = v.id
  addSchedJobModalFormModel.value.projectName = (await get_project_by_pro_abbr(v.jobName.split("_")[1]))?.projectName || '未知项目'

  const cron = (await get_cj_cron_by_project_id(projectId))?.cjCron || null
  if (cron != null) {
    showCronUnConfigAlert.value = false

    const minRange = cron.split(' ')[1]
    schedMinRange = {
      startMin: parseInt(minRange.split('-')[0]),
      endMIn: parseInt(minRange.split('-')[1]),
    }
    addSchedJobModalFormModel.value.min = schedMinRange.startMin
    addSchedJobModalFormModel.value.hour = cron.split(' ')[2]
  } else {
    showCronUnConfigAlert.value = true

    schedMinRange = {
      startMin: 0,
      endMIn: 59
    }
    addSchedJobModalFormModel.value.min = 0
    addSchedJobModalFormModel.value.hour = '0,12'
  }

  showModalRef.value = true
  modalTitle = '创建调度任务'
}

// endregion

// region 日志
const showDrawerRef = ref(false)
const drawerJobRef = ref<Job>(null)

const showJobLogDrawer = (v: Job) => {
  drawerJobRef.value = v
  showDrawerRef.value = true
}
//endregion

// region dataX任务配置
const showDataXJobSetupModalRef = ref(false)

const dataXJobSetupModalTitle = '调度配置';
const isDataXJobSetupSaving = ref(false)
const dataXJobSetupFormRef = ref<FormInst | null>(null);
const dataXJobSetupModelRef = ref({
  jobName: '',
  retry: '0',
  executorFailRetryCount: 0,
  sec: '*',
  min: 0,
  hour: '0,12',
  day: '?',
  month: '*',
  week: '*',
  year: '*'
})

const dataXJobSetupModelRules = {
  retry: {
    required: true,
    trigger: ['change']
  },
  sec: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  min: {
    type: 'number',
    required: true,
    trigger: ['change']
  },
  hour: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  day: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  month: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  week: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  year: {
    required: true,
    trigger: ['input'],
    message: ''
  }
}

const showDataXJobSetupModal = async (row: Job) => {
  showDataXJobSetupModalRef.value = true
  const schedJob = await getSchedJob(row.jobName)
  const cronItems = convertCronExpression(schedJob.jobCron)
  dataXJobSetupModelRef.value.jobName = row.jobName
  dataXJobSetupModelRef.value.retry = schedJob?.retry || '0'
  dataXJobSetupModelRef.value.executorFailRetryCount = schedJob.executorFailRetryCount
  dataXJobSetupModelRef.value.sec = cronItems.seconds
  dataXJobSetupModelRef.value.min = parseInt(cronItems.minutes)
  dataXJobSetupModelRef.value.hour = cronItems.hours
  dataXJobSetupModelRef.value.day = cronItems.dayOfMonth
  dataXJobSetupModelRef.value.month = cronItems.month
  dataXJobSetupModelRef.value.week = cronItems.dayOfWeek
  dataXJobSetupModelRef.value.year = cronItems.year
}

const handleDataXJobSetupSave = async () => {
  isDataXJobSetupSaving.value = true

  dataXJobSetupFormRef.value?.validate(async errors => {
    if (!errors) {

      const schedJob = await getSchedJob(dataXJobSetupModelRef.value.jobName)

      schedJob.retry = dataXJobSetupModelRef.value.retry
      schedJob.executorFailRetryCount = dataXJobSetupModelRef.value.executorFailRetryCount
      schedJob.jobCron = `${dataXJobSetupModelRef.value.sec} ${dataXJobSetupModelRef.value.min} ${dataXJobSetupModelRef.value.hour} ${dataXJobSetupModelRef.value.day} ${dataXJobSetupModelRef.value.month} ${dataXJobSetupModelRef.value.week} ${dataXJobSetupModelRef.value.year}`

      await update_sched_job(schedJob).then(res => {
        if (res.data == 'success') {
          window.$message.success('调度任务更新成功')
          tableDataInit()
          showDataXJobSetupModalRef.value = false
        } else {
          window.$message.error(res.msg)
          console.error(res)
        }
      })

    } else {
      console.error(errors)
    }
  })

  isDataXJobSetupSaving.value = false
}

//endregion
</script>

<style scoped>

</style>
