<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <div class="float-left leading-8 font-bold text-base">
          <n-skeleton v-if="isTableLoading" :width="360" size="small"/>
          <span v-else>{{ title }}</span>
        </div>
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
        <template #empty>
          <span style="color: rgba(194, 194, 194, 1)">未选择项目对应表</span>
        </template>
      </n-data-table>
    </n-scrollbar>
  </n-layout>

  <n-modal
      v-model:show="showModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="modalTitle"
      :size="'small'"
      @afterLeave="onModelAfterLeave"
  >

    <n-form
        v-if="formSelect.addSchedJob"
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

        <n-form-item-gi :span="2" label="秒" path="sec" :label-style="{margin:'0 auto'}">
          <n-input class="text-center"
                   v-model:value="addSchedJobModalFormModel.sec"
                   placeholder=""
                   @keydown.enter.prevent
                   readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="分" path="min" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.min" placeholder=""
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

    <n-form
        v-if="formSelect.createCjJob"
        class="mt-4"
        ref="cjJobModalFormRef"
        :model="cjJobModalFormModel"
        :rules="cjJobModalFormRules"
        :size="'small'"
    >
      <n-grid :cols="4" :x-gap="4">
        <n-form-item-gi :span="4" label="工作流名称" path="name">
          <n-input v-model:value="cjJobModalFormModel.name" placeholder=""
                   readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="来源表" path="sourceTableName">
          <n-select :size="'small'"
                    v-model:value="cjJobModalFormModel.sourceTableName"
                    :options="sourceTableOptions"
                    filterable
                    remote
                    @search="handleSourceTableSearch"
                    @update:value="handleSourceTableUpdate"
                    :consistent-menu-width="false"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="目标表" path="targetTableName">
          <n-input :size="'small'"
                   v-model:value="cjJobModalFormModel.targetTableName"
                   readonly
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
        v-if="formSelect.createZjJob"
        class="mt-4"
        ref="zjJobModalFormRef"
        :model="zjJobModalFormModel"
        :rules="zjJobModalFormRules"
        :size="'small'"
    >
      <n-grid :cols="4" :x-gap="4">
        <n-form-item-gi :span="4" label="表名" path="tableName">
          <n-input
              v-model:value="zjJobModalFormModel.tableName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="项目" path="projectName">
          <n-input
              v-model:value="zjJobModalFormModel.projectName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="责任人" path="personId">
          <n-select
              v-model:value="zjJobModalFormModel.personId"
              placeholder="选择责任人"
              :options="personIdOptions"
              :consistent-menu-width="false"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
        v-if="formSelect.createBfJob"
        class="mt-4"
        ref="bfJobModalFormRef"
        :model="bfJobModalFormModel"
        :rules="bfJobModalFormRules"
        :size="'small'"
    >
      <n-grid :cols="4" :x-gap="4">
        <n-form-item-gi :span="4" label="表名" path="tableName">
          <n-input
              v-model:value="bfJobModalFormModel.tableName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="项目" path="projectName">
          <n-input
              v-model:value="bfJobModalFormModel.projectName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="责任人" path="personId">
          <n-select
              v-model:value="bfJobModalFormModel.personId"
              placeholder="选择责任人"
              :options="personIdOptions"
              :consistent-menu-width="false"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
        v-if="formSelect.createRhJob"
        class="mt-4"
        ref="rhJobModalFormRef"
        :model="rhJobModalFormModel"
        :rules="rhJobModalFormRules"
        :size="'small'"
    >
      <n-grid :cols="4" :x-gap="4">
        <n-form-item-gi :span="4" label="表名" path="tableName">
          <n-input
              v-model:value="rhJobModalFormModel.tableName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="项目" path="projectName">
          <n-input
              v-model:value="rhJobModalFormModel.projectName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="责任人" path="personId">
          <n-select
              v-model:value="rhJobModalFormModel.personId"
              placeholder="选择责任人"
              :options="personIdOptions"
              :consistent-menu-width="false"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
        v-if="formSelect.createQcJob"
        class="mt-4"
        ref="qcJobModalFormRef"
        :model="qcJobModalFormModel"
        :rules="qcJobModalFormRules"
        :size="'small'"
    >
      <n-grid :cols="4" :x-gap="4">
        <n-form-item-gi :span="4" label="表名" path="tableName">
          <n-input
              v-model:value="qcJobModalFormModel.tableName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="项目" path="projectName">
          <n-input
              v-model:value="qcJobModalFormModel.projectName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="4" label="责任人" path="personId">
          <n-select
              v-model:value="qcJobModalFormModel.personId"
              placeholder="选择责任人"
              :options="personIdOptions"
              :consistent-menu-width="false"
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
import {find_by_project_id, get_project_by_pro_abbr, get_table_sql} from "@render/api/auxiliaryDb";
import {create_cron_job} from "@render/api/cron";
import {
  add_sched_task,
  cj_job_delete,
  cj_job_run,
  cj_job_start,
  cj_job_stop,
  get_cj_job_page, get_columns,
  get_sched_job_page, get_valid_config_page, get_workflow_log,
  get_workflow_page,
  sched_job_delete,
  workflow_active,
  workflow_delete, workflow_rerun,
  workflow_run
} from "@render/api/datacenter";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {personIdOptions} from "@render/typings/datacenterOptions";
import {formatDate} from "@render/utils/common/formatDate";
import {createBfJob} from "@render/utils/datacenter/bfJob";
import {CjFormModelType, createCjJob} from "@render/utils/datacenter/cjJob";
import {getTablesOptions} from "@render/utils/datacenter/getTablesOptions";
import {createGxJob} from "@render/utils/datacenter/gxJob";
import {createQcJob} from "@render/utils/datacenter/qcJob";
import {createRhJob} from "@render/utils/datacenter/rhJob";
import {createZjJob} from "@render/utils/datacenter/zjJob";
import {Refresh} from '@vicons/ionicons5'
import {parseExpression} from 'cron-parser';
import {isEmpty} from "lodash-es";
import {
  DataTableColumns,
  FormInst,
  NButton,
  NPopconfirm,
  NSpace,
  NTag,
  useMessage,
  useNotification,
  useDialog, SelectOption, SelectGroupOption
} from "naive-ui";
import {computed, h, onMounted, reactive, ref, watch} from "vue";
import {uuid} from "vue3-uuid";

const message = useMessage()
const notification = useNotification()
const dialog = useDialog()

const projectTree = useProjectTreeStore()

// 创建计算属性来获取 Pinia 存储中的值
const defaultSelectedKeys = computed(() => projectTree.defaultSelectedKeys)

watch(defaultSelectedKeys, async (newValue) => {
  if (newValue[0] != null) {
    const segments = newValue[0].split('-');
    const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
    if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
      queryParam.value.projectId = segments[segments.length - 2]
      queryParam.value.tableAbbr = segments[segments.length - 1]
      projectRef.value = await find_by_project_id(queryParam.value.projectId)
      tableDataInit()
    }
  }
})

// region 数据表

const queryParam = ref({
  projectId: null,
  tableAbbr: null //此为表名的最简化，比如di_ssft_z2010_temp_ods 则为z2010
})

const title = ref('')

const allSchedJobInfoRef = ref([])
const getAllSchedJobInfo = async (param?: string) => {
  allSchedJobInfoRef.value = (await get_sched_job_page(1, 10000, param || '')).data.records
}

const projectRef = ref(null)

onMounted(async () => {
  const segments = useProjectTreeStore().defaultSelectedKeys[0].split('-');
  const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
  if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
    queryParam.value.projectId = segments[segments.length - 2]
    queryParam.value.tableAbbr = segments[segments.length - 1]
    projectRef.value = await find_by_project_id(queryParam.value.projectId)
    tableDataInit()
  }

})

type Job = {
  id: string
  type: string
  jobName: string
  // -1:未创建； 0:采集任务未配置； 1:任务停用； 2:任务启用； 3:任务运行中； 4:任务异常； 5:任务未反馈
  status: number
  // 1:依赖调度；2:定时调度
  schedMode: number
  cron: string
  lastExecTime: string
  nextExecTime: string
  createBy: string
  code?: string
}

const tableDataRef = ref([])

const isTableLoading = ref(false)

const setTitle = async (project: any) => {
  const tableComment = (await get_table_sql({
    tableName: queryParam.value.tableAbbr.toString().toUpperCase()
  }))[0]?.comment || '未知信息'

  const projectName = project.projectName.replaceAll('行政行为', '')

  const index = projectName.indexOf('数据归集')

  title.value = projectName.slice(0, index) + '-' + tableComment + '-' + projectName.slice(index)
}

const tableDataInit = async () => {
  isTableLoading.value = true

  let jobs = []

  const project = (await find_by_project_id(queryParam.value.projectId))

  await getAllSchedJobInfo(project.projectAbbr)

  setTitle(project)

  const projectAbbr = project?.projectAbbr || '';
  if (projectAbbr !== '') {
    // 采集任务
    let dataXJobs = (await get_cj_job_page({
      current: 1,
      size: 10000,
      blurry: `cj_${projectAbbr}_${queryParam.value.tableAbbr}`,
      subsystemName: "采集"
    })).data.records
        .map((v): Job => ({
          id: v.id,
          jobName: v.jobDesc,
          status: (() => {
            if (v.configuration == 0) {
              return 0
            } else {
              const triggerStatus = allSchedJobInfoRef.value.find(item => item.jobTemplateId == v.id)?.triggerStatus
              if (triggerStatus == 1) {
                return 2
              } else {
                return 1
              }
            }
          })(),  //
          type: (() => {
            switch (v.jobDesc.split('_')[0]) {
              case 'cj':
                return '数据采集任务'
              case 'gx':
                return '数据共享任务'
              default :
                return '未知任务'
            }
          })(),
          schedMode: 2,
          cron: (() => {
            return allSchedJobInfoRef.value.find(item => item.jobTemplateId == v.id)?.jobCron || null
          })(),
          lastExecTime: v.triggerLastTime || '--',
          nextExecTime: cjJobGetNextExecTime(v.id),
          createBy: null
        }))

    // 若不存在采集任务
    if (!dataXJobs.some(job => job.type === '数据采集任务')) {
      dataXJobs.push({
        id: null,
        jobName: `cj_${projectAbbr}_${queryParam.value.tableAbbr}`,
        status: -1,
        type: '数据采集任务',
        schedMode: 2,
        cron: null,
        lastExecTime: '--',
        nextExecTime: '未配置调度任务',
        createBy: null
      })
    }

    /*     // 若不存在共享任务
        if (!dataXJobs.some(job => job.type === '数据共享任务')) {
          dataXJobs.push({
            id: null,
            jobName: `gx_${projectAbbr}_${queryParam.value.tableAbbr}`,
            status: -1,
            type: '数据共享任务',
            schedMode: 2,
            cron: null,
            lastExecTime: '--',
            nextExecTime: '未配置调度任务',
            createBy: null
          })
        } */

    //工作流任务
    const workflowJobs = (await get_workflow_page({
      page: 1,
      size: 10000,
      status: null,
      procName: `${projectAbbr}_${queryParam.value.tableAbbr}`
    })).data.records

    let newJobs = []

    for (const v of workflowJobs) {
      const job = {
        id: v.id,
        jobName: v.procName,
        type: (() => {
          switch (v.procName.split('_')[0]) {
            case 'zj':
              return '数据质检任务'
            case 'bf':
              return '数据备份任务'
            case 'qc':
              return '数据清除任务'
            case 'rh':
              return '数据融合任务'
            case 'rk':
              return '数据入库任务'
            default :
              return '未知任务'
          }
        })(),
        status: (() => {
          switch (v.status) {
            case '1':// 启用
              return 2
            case '2':// 停用
              return 1
            case '3':// 异常
              return 4
            case '4':// 运行中
              return 3
            case '5':// 未反馈
              return 5
            default :
              return v.status as number
          }
        })(),
        schedMode: v.schedulingMode,
        cron: v.crontab == '' ? null : v.crontab,
        lastExecTime: await workflowJobGetLastExecTime(v),
        nextExecTime: workflowJobGetNextExecTime(v),
        createBy: v.createBy,
        code: v.procCode
      }

      newJobs.push(job)
    }

    // 添加未创建的任务
    newJobs = pushUnExistJobs(newJobs, projectAbbr)

    jobs.push(...dataXJobs, ...newJobs)
  } else {
    tableDataRef.value = []
  }

  tableDataRef.value = jobs.sort(compare)

  isTableLoading.value = false
}

const pushUnExistJobs = (newJobs: any[], projectAbbr: string) => {

  if (!newJobs.some(job => job.type === '数据质检任务')) {
    newJobs.push({
      id: null,
      jobName: `zj_${projectAbbr}_${queryParam.value.tableAbbr}`,
      status: -1,
      type: '数据质检任务',
      schedMode: 0,
      cron: null,
      lastExecTime: '--',
      nextExecTime: '未配置调度任务',
      createBy: null
    })
  }

  if (!newJobs.some(job => job.type === '数据备份任务')) {
    newJobs.push({
      id: null,
      jobName: `bf_${projectAbbr}_${queryParam.value.tableAbbr}`,
      status: -1,
      type: '数据备份任务',
      schedMode: 0,
      cron: null,
      lastExecTime: '--',
      nextExecTime: '未配置调度任务',
      createBy: null
    })
  }

  if (!newJobs.some(job => job.type === '数据清除任务')) {
    newJobs.push({
      id: null,
      jobName: `qc_${projectAbbr}_${queryParam.value.tableAbbr}`,
      status: -1,
      type: '数据清除任务',
      schedMode: 0,
      cron: null,
      lastExecTime: '--',
      nextExecTime: '未配置调度任务',
      createBy: null
    })
  }

  if (!newJobs.some(job => job.type === '数据融合任务')) {
    newJobs.push({
      id: null,
      jobName: `rh_${projectAbbr}_${queryParam.value.tableAbbr}`,
      status: -1,
      type: '数据融合任务',
      schedMode: 0,
      cron: null,
      lastExecTime: '--',
      nextExecTime: '未配置调度任务',
      createBy: null
    })
  }

  if (!newJobs.some(job => job.type === '数据入库任务')) {
    newJobs.push({
      id: null,
      jobName: `rk_${projectAbbr}_${queryParam.value.tableAbbr}`,
      status: -1,
      type: '数据入库任务',
      schedMode: 0,
      cron: null,
      lastExecTime: '--',
      nextExecTime: '未配置调度任务',
      createBy: null
    })
  }

  return newJobs

}

const createColumns = (): DataTableColumns<Job> => {
  return [
    {
      title: '任务名',
      key: 'jobName',
      width: '15%'
    },
    {
      title: '任务类型',
      key: 'type',
      width: '10%'
    },
    {
      title: '状态',
      key: 'status',
      width: '8%',
      align: 'center',
      render(row) {
        switch (row.status) {
          case -1:
            return h(NTag, {
                  size: 'small',
                  bordered: false,
                  color: {
                    color: '#797979',
                    textColor: 'white'
                  }
                },
                {default: () => '未创建'})
          case 0:
            return h(NTag, {
                  size: 'small',
                  bordered: false,
                  color: {
                    color: '#ffc062',
                    textColor: 'white'
                  }
                },
                {default: () => '未配置'})
          case 1:
            return h(NTag, {
                  size: 'small',
                  bordered: false,
                  type: 'default'
                },
                {default: () => '停用'})
          case 2:
            return h(NTag, {
                  size: 'small',
                  bordered: false,
                  type: 'info'
                },
                {default: () => '启用'})
          case 3:
            return h(NTag, {
                  size: 'small',
                  bordered: false,
                  type: 'success'
                },
                {default: () => '运行中'})
          case 4:
            return h(NTag, {
                  size: 'small',
                  bordered: false,
                  type: 'error'
                },
                {default: () => '异常'})
          case 5:
            return h(NTag, {
                  size: 'small',
                  bordered: false,
                  color: {
                    color: '#8eafd3',
                    textColor: 'white'
                  }
                },
                {default: () => '未反馈'})
        }
      }
    },
    {
      title: '上次执行时间',
      key: 'lastExecTime',
      width: '16%'
    },
    {
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '16%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '20%',
      align: 'center',
      render(row) {

        let container = h(NSpace, {
          justify: 'center'
        })

        switch (row.status) {
          case -1:// 未创建的任务
            if (row.type != '数据共享任务') {
              container.children = [showButton('创建', async () => {
                const project = (await find_by_project_id(queryParam.value.projectId))
                switch (row.type) {
                  case '数据采集任务':
                    await createCjJobModalInit(project, row)
                    showModalRef.value = true
                    modalTitle = '创建采集任务'
                    formSelect.value.createCjJob = true
                    break
                  case '数据质检任务':
                    await createZjJobModalInit(project)
                    showModalRef.value = true
                    modalTitle = '创建质检任务'
                    formSelect.value.createZjJob = true
                    break
                  case '数据融合任务':
                    await createRhJobModalInit(project)
                    showModalRef.value = true
                    modalTitle = '创建融合任务'
                    formSelect.value.createRhJob = true
                    break
                  case '数据备份任务':
                    await createBfJobModalInit(project)
                    showModalRef.value = true
                    modalTitle = '创建备份任务'
                    formSelect.value.createBfJob = true
                    break
                  case '数据清除任务':
                    await createQcJobModalInit(project)
                    showModalRef.value = true
                    modalTitle = '创建清除任务'
                    formSelect.value.createQcJob = true
                    break
                  case '数据入库任务':
                    window.$message.info("敬请期待")
                    break
                }
              })]
            } else {
              container.children = [showConfirmation('创建', async () => {
                const project = (await find_by_project_id(queryParam.value.projectId))
                const tableName = queryParam.value.tableAbbr.toString().toLowerCase()

                createGxJob({
                  name: `gx_${project.projectAbbr}_${tableName}`,
                  sourceTableName: `sztk_${tableName}`,
                  targetTableName: `gdsztk_${tableName}`,
                  projectId: project.projectId
                }).then(() => {
                  tableDataInit()
                })

              })]
            }

            break
          case 0:// 未配置调度任务的采集任务
            container.children = [
              showButton('配置', async () => {
                await addSchedJobModalFormModelInit(row)
                showModalRef.value = true
                modalTitle = '创建调度任务'
                formSelect.value.addSchedJob = true
              }),
              showConfirmation('删除', async () => {
                await cjJobDelete(row.id)
              }),
            ]
            break
          case  1: // 任务停用
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {
              container.children = [
                showButton('启用', async () => {
                  cjJobStart(row.id)
                }),
                showConfirmation('执行', async () => {
                  cjJobRun(row)
                }),
                showConfirmation('删除', async () => {
                  await cjJobDelete(row.id)
                }),
              ]
            } else {
              container.children = [
                showButton('启用', async () => {
                  workflowActive(row.id, '01')
                }),
                showConfirmation('执行', async () => {
                  await workflowActive(row.id, '01')
                  await workflowRun(row)
                }),
                showConfirmation('删除', async () => {
                  await workflowDelete(row.id)
                }),
              ]
            }
            break
          case 2:// 任务启用
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {
              container.children = [
                showButton('停用', async () => {
                  cjJobStop(row.id)
                }),
                showConfirmation('执行', async () => {
                  cjJobRun(row)
                }),
                showConfirmation('删除', async () => {
                  await cjJobStop(row.id)
                  await cjJobDelete(row.id)
                }),
              ]
            } else {
              container.children = [
                showButton('停用', async () => {
                  workflowActive(row.id, '02')
                }),
                showConfirmation('执行', async () => {
                  workflowRun(row)
                }),
                showConfirmation('删除', async () => {
                  await workflowActive(row.id, '02')
                  await workflowDelete(row.id)
                }),
              ]
            }
            break
          case 3:// 任务运行中
            break
          case 4:// 任务异常
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {

            } else {
              container.children = [
                showConfirmation('重跑', async () => {
                  workflowReRun(row)
                })
              ]
            }
            break
        }

        return container
      }
    }
  ]
}

const showButton = (text, onClick) => {
  return h(NButton, {
        size: 'small',
        onClick: async () => {
          await onClick()
        }
      },
      {default: () => text})
}

const showConfirmation = (text, onPositiveClick) => {
  return h(NPopconfirm, {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await onPositiveClick();
    },
  }, {
    trigger: () => {
      return h(NButton, {size: 'small'}, {default: () => text})
    },
    default: () => `确定要${text}吗？`
  });
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

// 自定义比较函数
const compare = (a, b) => {
  const jobNameA = a.jobName.slice(0, 2);
  const jobNameB = b.jobName.slice(0, 2);

  if (jobNameA === "cj") return -1;
  if (jobNameB === "cj") return 1;

  if (jobNameA === "zj") return -1;
  if (jobNameB === "zj") return 1;

  if (jobNameA === "bf") return -1;
  if (jobNameB === "bf") return 1;

  if (jobNameA === "rh") return -1;
  if (jobNameB === "rh") return 1;

  if (jobNameA === "rk") return -1;
  if (jobNameB === "rk") return 1;

  if (jobNameA === "qc") return -1;
  if (jobNameB === "qc") return 1;

  if (jobNameA === "gx") return -1;
  if (jobNameB === "gx") return 1;

  return 0;
}

/**
 * @param id: 任务ID
 * @param type: 01：启用， 02：停用
 **/
const workflowActive = (id: string, type: '01' | '02') => {
  workflow_active({
    id: id,
    type: type
  }).then((res) => {
    if (res.code == 200) {
      message.success(type == '01' ? '启用成功' : '停用成功')
      tableDataInit()
    } else {
      message.error(res.msg)
    }
  })
}

const workflowRun = async (v: Job) => {

  if (v.type === '数据质检任务') {
    let configParam = {
      page: 1,
      size: 1,
      likeName: '',
      orders: [
        {
          asc: true,
          column: "table_name"
        }
      ],
      likeType: 0
    }

    const project = await get_project_by_pro_abbr(v.jobName.split("_")[1])

    configParam.likeName = `di_${project.tableAbbr}_${v.jobName.split("_")[2]}_temp_ods`

    const records = (await get_valid_config_page(configParam)).data.records

    if (isEmpty(records) || records[0].tableName != configParam.likeName) {
      dialog.warning({
        title: '警告',
        content: `检测到未在质量门户对[${configParam.likeName}]进行配置，是否继续执行质检？`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          workflowJobStart(v)
        }
      })
    } else {
      workflowJobStart(v)
    }

  } else {
    workflowJobStart(v)
  }

}

const workflowJobStart = (v: Job) => {
  const param = {
    businessKey: uuid.v4(),
    code: v.code,
    createBy: v.createBy,
    creator: v.createBy
  }
  workflow_run(param).then(res => {
    if (res.code == 200) {
      message.success(res.message)
      tableDataInit()
    } else {
      message.error(res.message)
    }
  }).then(() => {
    create_cron_job(v.jobName)
  })
}

const workflowReRun = (v: Job) => {

  workflow_rerun(v.id, 2).then(res => {
    if (res.code == 200) {
      message.success(res.message)
      tableDataInit()
    } else {
      message.error(res.message)
    }
  }).then(() => {
    create_cron_job(v.jobName)
  })
}

const workflowDelete = (id) => {
  workflow_delete(id).then(res => {
    if (res.code == 200) {
      message.success(res.data)
      tableDataInit()
    } else {
      message.success("删除失败")
    }
  })
}

const cjJobStart = (id) => {
  const schedJobId = allSchedJobInfoRef.value.find(item => item.jobTemplateId == id).id
  cj_job_start(schedJobId).then(res => {
    if (res.data == 'success') {
      message.success('启用成功')
      tableDataInit()
    } else {
      message.error(res.msg)
    }
  })
}

const cjJobStop = (id) => {
  const schedJobId = allSchedJobInfoRef.value.find(item => item.jobTemplateId == id).id
  cj_job_stop(schedJobId).then(res => {
    if (res.data == 'success') {
      message.success('停用成功')
      tableDataInit()
    } else {
      message.error(res.message)
    }
  })
}

const cjJobRun = (row: Job) => {
  const schedJobId = allSchedJobInfoRef.value.find(item => item.jobTemplateId == row.id).id
  cj_job_run({
    jobId: schedJobId,
    subsystemName: "采集"
  }).then(res => {
    if (res.data == 'success') {
      message.success('执行成功')
      tableDataInit()
    } else {
      message.error(res.message)
    }
  })
}

const cjJobDelete = (id) => {
  const schedJobId = allSchedJobInfoRef.value.find(item => item.jobTemplateId == id)?.id || null
  if (schedJobId != null) {
    sched_job_delete(schedJobId).then(res => {
      if (res.code == 0) {
        message.success('调度任务删除成功')
        cj_job_delete(id).then(res1 => {
          if (res1.code == 0) {
            message.success('采集任务删除成功')
            tableDataInit()
          } else {
            message.error(res1.msg)
          }
        })
      } else {
        message.error(res.msg)
      }
    })
  } else {
    cj_job_delete(id).then(res1 => {
      if (res1.code == 0) {
        message.success('采集任务删除成功')
        tableDataInit()
      } else {
        message.error(res1.msg)
      }
    })
  }

}

const convertToSixFields = (cron: string): string => {
  const fields = cron.split(' ');
  return `${fields[0]} ${fields[1]} ${fields[2]} ${fields[3]} ${fields[4]} ${fields[5]}`;
}

const cjJobGetNextExecTime = (jobId: any) => {
  const jobCron = allSchedJobInfoRef.value.find(item => item.jobTemplateId == jobId)?.jobCron || null
  if (jobCron != null) {
    const interval = parseExpression(convertToSixFields(jobCron));
    return formatDate(interval.next().toDate())
  } else {
    return '未配置调度任务'
  }
}

const workflowJobGetNextExecTime = (v) => {
  if (v.schedulingMode == 2) {
    const interval = parseExpression(convertToSixFields(v.crontab));
    return formatDate(interval.next().toDate())
  } else if (v.schedulingMode == 1) {
    return `依赖于${v.dependencyWorkflowName}`
  } else {
    return '未配置调度任务'
  }
}

const workflowJobGetLastExecTime = async (v) => {
  const res = await get_workflow_log(v.id, 1, 1);
  if (!isEmpty(res.data.records)) {
    return res.data.records[0].startTime;
  } else {
    return '--';
  }
};

// endregion

const showModalRef = ref(false)

let modalTitle = '';

const formSelect = ref({
  addSchedJob: false,
  createCjJob: false,
  createZjJob: false,
  createBfJob: false,
  createRhJob: false,
  createQcJob: false,
})

const onNegativeClick = () => {
  showModalRef.value = false
}

const onModelAfterLeave = () => {
  formSelect.value = {
    addSchedJob: false,
    createCjJob: false,
    createZjJob: false,
    createBfJob: false,
    createRhJob: false,
    createQcJob: false,
  }
}

const isSaving = ref(false)

const onPositiveClick = async () => {
  isSaving.value = true
  if (formSelect.value.addSchedJob) {
    addSchedJobModalFormRef.value?.validate(async (errors) => {
      if (!errors) {
        const {
          projectName,
          sec,
          min,
          hour,
          day,
          month,
          week,
          year,
          ...newAddSchedJobModalFormModel
        } = {
          ...addSchedJobModalFormModel.value,
          retry: parseInt(addSchedJobModalFormModel.value.retry),
          executorFailRetryCount: addSchedJobModalFormModel.value.executorFailRetryCount.toString(),
          jobCron: `${addSchedJobModalFormModel.value.sec} ${addSchedJobModalFormModel.value.min} ${addSchedJobModalFormModel.value.hour} ${addSchedJobModalFormModel.value.day} ${addSchedJobModalFormModel.value.month} ${addSchedJobModalFormModel.value.week} ${addSchedJobModalFormModel.value.year}`
        };

        await add_sched_task(newAddSchedJobModalFormModel).then(res => {
          if (res.code == 0) {
            message.success('调度任务创建成功')
            showModalRef.value = false
            formSelect.value.addSchedJob = false
            tableDataInit()
          } else {
            notification.create({
              title: '调度任务创建失败',
              content: res.msg + '，请重新配置CRON表达式',
              type: "warning"
            })
            console.log(res)
          }
        })

      } else {
        console.log(errors)
      }
    }).finally(() => isSaving.value = false)
  }

  if (formSelect.value.createCjJob) {
    targetTableColumnsRef.value = (await get_columns(cjJobModalFormModel.value.targetDataSourceId, cjJobModalFormModel.value.targetTableName))

    if (!isEmpty(targetTableColumnsRef.value)) {
      cjJobModalFormRef.value?.validate((errors) => {
        if (!errors) {
          createCjJob({
            name: cjJobModalFormModel.value.name,
            sourceTableName: cjJobModalFormModel.value.sourceTableName,
            targetTableName: cjJobModalFormModel.value.targetTableName,
            projectId: cjJobModalFormModel.value.projectId,
            sourceDataSourceId: '7',
            targetDataSourceId: '6'
          }, sourceTableColumnsRef.value, targetTableColumnsRef.value)
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createCjJob = false
          tableDataInit()
        } else {
          console.log(errors)
          isSaving.value = false
        }
      })
    } else {
      window.$message.warning("目标表不存在")
      isSaving.value = false
    }
  }

  if (formSelect.value.createZjJob) {
    zjJobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createZjJob({
          projectId: zjJobModalFormModel.value.projectId,
          personId: zjJobModalFormModel.value.personId,
          tableName: zjJobModalFormModel.value.tableName
        })

        isSaving.value = false
        showModalRef.value = false
        formSelect.value.createZjJob = false
        tableDataInit()
      } else {
        console.log(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createBfJob) {
    bfJobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createBfJob(bfJobModalFormModel.value).then(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createBfJob = false
          tableDataInit()
        })
      } else {
        console.log(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createRhJob) {
    rhJobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createRhJob({
          projectId: rhJobModalFormModel.value.projectId,
          personId: rhJobModalFormModel.value.personId,
          tableName: rhJobModalFormModel.value.tableName
        }, false, false).then(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createRhJob = false
          tableDataInit()
        })
      } else {
        console.log(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createQcJob) {
    qcJobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createQcJob(qcJobModalFormModel.value).then(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createQcJob = false
          tableDataInit()
        })
      } else {
        console.log(errors)
        isSaving.value = false
      }
    })
  }

  isSaving.value = false
}

// region 新增调度任务

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
  min: '0',
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

const addSchedJobModalFormModelInit = async (v) => {
  addSchedJobModalFormModel.value.jobContent = v.jobName
  addSchedJobModalFormModel.value.jobDesc = v.jobName
  addSchedJobModalFormModel.value.jobTemplateId = v.id
  addSchedJobModalFormModel.value.projectName = (await get_project_by_pro_abbr(v.jobName.split("_")[1]))?.projectName || '未知项目'
}

// endregion

// region 创建采集任务

const cjJobModalFormRef = ref<FormInst | null>(null);
const cjJobModalFormModel = ref<CjFormModelType>({
  name: '',
  sourceDataSourceId: '7',
  sourceTableName: '',
  targetDataSourceId: '6',
  targetTableName: '',
  projectId: ''
})
const cjJobModalFormRules = {
  sourceTableName: {
    required: true,
    trigger: ['change'],
    message: '选择来源表'
  },
}

const sourceTableOptions = ref<Array<SelectOption | SelectGroupOption>>()

const sourceTableColumnsRef = ref([])
const targetTableColumnsRef = ref([])

const createCjJobModalInit = async (project, row: Job) => {
  sourceTableOptions.value = await getTablesOptions(cjJobModalFormModel.value.sourceDataSourceId)
  cjJobModalFormModel.value.name = row.jobName
  cjJobModalFormModel.value.targetTableName = `di_${project.tableAbbr}_${queryParam.value.tableAbbr}_temp_ods`
  cjJobModalFormModel.value.projectId = project.projectId
}

const handleSourceTableSearch = async (query: string) => {
  sourceTableOptions.value = await getTablesOptions(cjJobModalFormModel.value.sourceDataSourceId, query)
}

const handleSourceTableUpdate = async () => {
  sourceTableColumnsRef.value = (await get_columns(cjJobModalFormModel.value.sourceDataSourceId, cjJobModalFormModel.value.sourceTableName))
}

//endregion

//region 创建质检任务

const zjJobModalFormRef = ref<FormInst | null>(null);

const zjJobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})
const zjJobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createZjJobModalInit = (project) => {
  zjJobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  zjJobModalFormModel.value.projectId = queryParam.value.projectId
  zjJobModalFormModel.value.projectName = project.projectName
}

//endregion

//region 创建备份任务

const bfJobModalFormRef = ref<FormInst | null>(null);

const bfJobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})
const bfJobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createBfJobModalInit = (project) => {
  bfJobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  bfJobModalFormModel.value.projectId = queryParam.value.projectId
  bfJobModalFormModel.value.projectName = project.projectName
}

//endregion

//region 创建融合任务
const rhJobModalFormRef = ref<FormInst | null>(null);

const rhJobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})
const rhJobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createRhJobModalInit = (project) => {
  rhJobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  rhJobModalFormModel.value.projectId = queryParam.value.projectId
  rhJobModalFormModel.value.projectName = project.projectName
}
//endregion

//region 创建清除任务
const qcJobModalFormRef = ref<FormInst | null>(null);

const qcJobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})
const qcJobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createQcJobModalInit = (project) => {
  qcJobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  qcJobModalFormModel.value.projectId = queryParam.value.projectId
  qcJobModalFormModel.value.projectName = project.projectName
}

//endregion
</script>

<style scoped>

</style>
