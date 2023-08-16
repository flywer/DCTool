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
        :scroll-x="1200"
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


</template>

<script setup lang="ts">
import {
  find_by_project_id,
  get_cj_cron_by_project_id,
  get_project_by_pro_abbr,
  get_table_sql
} from "@render/api/auxiliaryDb";
import {
  get_cj_job_page,
  get_sched_job_page,
} from "@render/api/datacenter";
import {formatDate} from "@render/utils/common/dateUtils";
import {createSchedJob} from "@render/utils/datacenter/cjJob";
import {
  dataXJobDelete, dataXJobRun,
  dataXJobStart, dataXJobStop,
  Job,
  setJobStatus,
  showButton,
  showConfirmation
} from "@render/utils/datacenter/jobTabUtil";
import {Refresh} from '@vicons/ionicons5'
import {parseExpression} from "cron-parser";
import {DataTableColumns, FormInst, NButton, NSpace} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

const tableDataRef = ref([])
const isTableLoading = ref(false)

const projectId = '27'

onMounted(() => {
  tableDataInit()
})

const tableDataInit = async () => {
  isTableLoading.value = true

  const project = (await find_by_project_id(projectId))

  // 共享任务
  let dataXJobs = (await get_cj_job_page({
    current: 1,
    size: 10000,
    projectName: project.projectName,
    subsystemName: "采集"
  })).data.records

  let newJobs = []

  for (const v of dataXJobs) {
    const schedJob = await getSchedJob(v)

    const job: Job = {
      id: v.id,
      jobName: v.jobDesc,
      type: '数据共享任务',
      status: (() => {
        if (v.configuration == 0) {
          return 0
        } else {
          if (schedJob?.triggerStatus == 1) {
            return 2
          } else {
            return 1
          }
        }
      })(),
      schedMode: 2,
      cron: schedJob?.jobCron || null,
      lastExecTime: v.triggerLastTime || '--',
      nextExecTime: cjJobGetNextExecTime(schedJob),
      createBy: null,
      comment: await getTableComment(v.jobDesc),
      createTime: schedJob?.addTime || '--',
      updateTime: schedJob?.updateTime || '--'
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

const getSchedJob = async (v) => {
  return (await get_sched_job_page({
    current: 1,
    size: 10000,
    jobContent: v.jobDesc
  })).data.records[0] || null
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
      width: '10%'
    },
    {
      title: '数据类型',
      key: 'comment',
      width: '14%'
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
      width: '13%'
    },
    {
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '13%'
    },
    {
      title: '任务创建时间',
      key: 'createTime',
      width: '13%'
    },
    {
      title: '任务更新时间',
      key: 'updateTime',
      width: '13%'
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
          case 0:// 未配置调度任务的采集任务
            container.children = [
              showButton('配置', async () => {
                await addSchedJobModalFormModelInit(row)
              }),
              showConfirmation('删除', async () => {
                await dataXJobDelete(row, () => tableDataInit())
              })
            ]
            break
          case  1: // 任务停用
            container.children = [
              showButton('启用', () => {
                dataXJobStart(row, () => tableDataInit())
              }),
              showConfirmation('执行', () => {
                dataXJobRun(row, () => tableDataInit())
              }),
              showConfirmation('删除', async () => {
                await dataXJobDelete(row, () => tableDataInit())
              }),
            ]
            break
          case 2:// 任务启用
            container.children = [
              showButton('停用', () => {
                dataXJobStop(row, () => tableDataInit())
              }),
              showConfirmation('执行', () => {
                dataXJobRun(row, () => tableDataInit())
              }),
              showConfirmation('删除', async () => {
                await dataXJobStop(row, () => {
                  dataXJobDelete(row, () => tableDataInit())
                })
              }),
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

const addSchedJobModalFormModelInit = async (v) => {
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
</script>

<style scoped>

</style>
