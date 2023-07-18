<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <div class="float-left leading-8 font-bold text-base" style="max-width: 40%">
          <n-skeleton v-if="isTableLoading" :width="360" size="small"/>
          <n-ellipsis style="max-width: 100%" v-else>
            {{ title }}
          </n-ellipsis>
        </div>
        <n-space inline class="float-right" style="max-width: 60%">

          <!--          <n-button secondary type="info" @click="">
                      已融合
                      <template #icon>
                        <n-icon>
                          <AddSquareMultiple16Regular/>
                        </n-icon>
                      </template>
                    </n-button>-->

          <n-button secondary type="info" @click="quickCreateModalInit">
            快捷创建
            <template #icon>
              <n-icon>
                <AddSquareMultiple16Regular/>
              </n-icon>
            </template>
          </n-button>

          <n-button secondary color="#8a2be2" @click="validConfigModalInit">
            配置管理{{ isValidConfigRef ? '（已配置）' : '（未配置）' }}
            <template #icon>
              <n-icon>
                <Options16Regular/>
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
      style="width: 566px"
  >
    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
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

      <n-form
          v-if="formSelect.createRh2Job"
          class="mt-4"
          ref="rh2JobModalFormRef"
          :model="rh2JobModalFormModel"
          :rules="rh2JobModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="表名" path="tableName">
            <n-input
                v-model:value="rh2JobModalFormModel.tableName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="项目" path="projectName">
            <n-input
                v-model:value="rh2JobModalFormModel.projectName"
                readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="责任人" path="personId">
            <n-select
                v-model:value="rh2JobModalFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <n-form
          v-if="formSelect.quickCreate"
          class="mt-4"
          ref="quickCreateModalFormRef"
          :model="quickCreateModalFormModel"
          :rules="quickCreateModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">

          <n-form-item-gi :span="4" label="项目" path="projectName">
            <n-input
                v-model:value="quickCreateModalFormModel.projectName"
                readonly
            />
          </n-form-item-gi>

          <n-form-item-gi :span="4" label="任务选择" path="jobSelect">
            <n-tree-select
                v-model:value="quickCreateModalFormModel.jobSelect"
                multiple
                cascade
                checkable
                :check-strategy="'child'"
                :options="jobTypeTreeOptionsRef"
                @update:value="handleJobTreeUpdateValue"
            />
          </n-form-item-gi>

          <n-gi v-if="quickCreateModalFormModel.jobSelect.includes('cj')" :span="4">
            <n-divider style="margin: 0">
              数据采集任务
            </n-divider>
          </n-gi>

          <n-form-item-gi v-if="quickCreateModalFormModel.jobSelect.includes('cj')" :span="4" label="采集来源表"
                          path="sourceTableName"
          >
            <n-select :size="'small'"
                      v-model:value="quickCreateModalFormModel.sourceTableName"
                      :options="sourceTableOptions"
                      filterable
                      remote
                      @search="handleSourceTableSearch"
                      @update:value="handleSourceTableUpdate"
                      :consistent-menu-width="false"
            />
          </n-form-item-gi>

          <n-form-item-gi v-if="quickCreateModalFormModel.jobSelect.includes('cj')" :span="4" label="采集目标表"
                          path="targetTableName"
          >
            <n-input :size="'small'"
                     v-model:value="quickCreateModalFormModel.targetTableName"
                     readonly
            />
          </n-form-item-gi>

          <n-gi v-if="quickCreateModalFormModel.jobSelect.includes('cj')" :span="4">
            <n-divider style="margin-top: 0"/>
          </n-gi>

          <n-form-item-gi :span="4" label="责任人" path="personId">
            <n-select
                v-model:value="quickCreateModalFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>

        </n-grid>
      </n-form>


      <n-alert v-if="formSelect.validConfig && isValidConfigRef" class="mt-4" type="default" :show-icon="false">
        一旦创建无法修改，只可删除
      </n-alert>

      <n-form
          v-if="formSelect.validConfig"
          class="mt-4"
          ref="validConfigModalFormRef"
          :model="validConfigModalFormModel"
          :rules="validConfigModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="表名" path="tableName">
            <n-input
                v-model:value="validConfigModalFormModel.tableName"
                readonly
            />
          </n-form-item-gi>

          <n-form-item-gi :span="2" label="主键字段" path="pkeyName">
            <n-input
                v-model:value="validConfigModalFormModel.pkeyName"
                :readonly="isValidConfigRef"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="2" label="批次号字段" path="cdBatchName">
            <n-input
                v-model:value="validConfigModalFormModel.cdBatchName"
                :readonly="isValidConfigRef"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="4" label="组织机构" path="mechanismId">
            <n-select
                v-model:value="validConfigModalFormModel.mechanismId"
                placeholder="选择组织机构"
                :options="mechanismOptions"
                :consistent-menu-width="false"
                filterable
                :disabled="isValidConfigRef"
                @update:value="handlemechanismIdUpdate"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="onPositiveClick" :loading="isSaving">{{
          confirmBtnText
        }}
      </n-button>
      <n-button :size="'small'" @click="onNegativeClick">返回</n-button>
    </template>

  </n-modal>

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
import {find_by_project_id, get_project_by_pro_abbr, get_table_sql} from "@render/api/auxiliaryDb";
import {create_cron_job} from "@render/api/cron";
import {
  add_sched_task,
  cj_job_delete,
  cj_job_run,
  cj_job_start,
  cj_job_stop, create_valid_config,
  get_cj_job_page, get_columns, get_datax_job_log,
  get_valid_config_page, get_workflow_log,
  get_workflow_page, gte_usrc_org_tree,
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
import {
  convertToSixFields, getDataXJobStatus, getDataXJobType,
  getIsValidConfig,
  getSchedJob, getWorkflowJobStatus, getWorkflowJobType,
  jobNameCompare, pushUnExistJobs,
  showButton,
  showConfirmation, workflowJobGetLastExecTime, workflowJobGetNextExecTime
} from "@render/utils/datacenter/jobTabUtil";
import {createQcJob} from "@render/utils/datacenter/qcJob";
import {createRhJob} from "@render/utils/datacenter/rhJob";
import {createRkJob} from "@render/utils/datacenter/rkJob";
import {createZjJob} from "@render/utils/datacenter/zjJob";
import {Refresh} from '@vicons/ionicons5'
import {AddSquareMultiple16Regular, Options16Regular} from '@vicons/fluent'
import {parseExpression} from 'cron-parser';
import {cloneDeep, isEmpty} from "lodash-es";
import {
  DataTableColumns,
  FormInst,
  NButton,
  NSpace,
  NTag,
  SelectOption,
  SelectGroupOption,
  TreeSelectOption,
  TimelineItemProps
} from "naive-ui";
import {computed, h, onMounted, reactive, ref, watch} from "vue";
import {uuid} from "vue3-uuid";

const projectTree = useProjectTreeStore()

// 创建计算属性来获取 Pinia 存储中的值
const defaultSelectedKeys = computed(() => projectTree.defaultSelectedKeys)

// 当前项目示例
const projectRef = ref(null)

// 此项目中的质检任务是否已配置组织机构
const isValidConfigRef = ref(false)

watch(defaultSelectedKeys, async (newValue) => {
  if (newValue[0] != null) {
    const segments = newValue[0].split('-');

    projectTree.isBasicData = segments[0] === '0'

    const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
    if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
      queryParam.value.projectId = segments[segments.length - 2]
      queryParam.value.tableAbbr = segments[segments.length - 1]
      projectRef.value = await find_by_project_id(queryParam.value.projectId)

      isValidConfigRef.value = await getIsValidConfig(projectRef.value.tableAbbr, queryParam.value.tableAbbr)

      tableDataInit()
    }
  }
})

// region 数据表

const queryParam = ref({
  projectId: null,
  tableAbbr: null as string //此为表名的最简化，比如di_ssft_z2010_temp_ods 则为z2010
})

const title = ref('')

onMounted(async () => {
  const segments = useProjectTreeStore().defaultSelectedKeys[0].split('-');
  const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
  if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
    queryParam.value.projectId = segments[segments.length - 2]
    queryParam.value.tableAbbr = segments[segments.length - 1]
    projectRef.value = await find_by_project_id(queryParam.value.projectId)

    isValidConfigRef.value = await getIsValidConfig(projectRef.value.tableAbbr, queryParam.value.tableAbbr)

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

  setTitle(project)

  const projectAbbr = project?.projectAbbr || '';
  if (projectAbbr !== '') {
    // 采集任务
    let dataXJobs = (await get_cj_job_page({
      current: 1,
      size: 10000,
      blurry: `${projectAbbr}_${queryParam.value.tableAbbr}`,
      subsystemName: "采集"
    })).data.records

    let newDataXJobs = []

    for (const v of dataXJobs) {
      const schedJob = await getSchedJob(v.jobDesc)

      const job: Job = {
        id: v.id,
        jobName: v.jobDesc,
        status: await getDataXJobStatus(v, schedJob),
        type: getDataXJobType(v),
        schedMode: 2,
        cron: schedJob?.jobCron || null,
        lastExecTime: v.triggerLastTime || '--',
        nextExecTime: cjJobGetNextExecTime(schedJob),
        createBy: null
      }

      newDataXJobs.push(job)
    }

    // 若不存在采集任务
    if (!newDataXJobs.some(job => job.type === '数据采集任务')) {
      newDataXJobs.push({
        id: null,
        jobName: `cj_${projectAbbr}_${queryParam.value.tableAbbr.toString().toLowerCase()}`,
        status: -1,
        type: '数据采集任务',
        schedMode: 2,
        cron: null,
        lastExecTime: '--',
        nextExecTime: '未配置调度任务',
        createBy: null
      })
    }

    // 若不存在共享任务
    if (!newDataXJobs.some(job => job.type === '数据共享任务')) {
      newDataXJobs.push({
        id: null,
        jobName: `gx_${projectAbbr}_${queryParam.value.tableAbbr.toString().toLowerCase()}`,
        status: -1,
        type: '数据共享任务',
        schedMode: 2,
        cron: null,
        lastExecTime: '--',
        nextExecTime: '未配置调度任务',
        createBy: null
      })
    }

    // 行为数据的共享任务不显示
    if (!projectTree.isBasicData) {
      newDataXJobs = newDataXJobs.filter(job => job.type !== '数据共享任务')
    }

    //工作流任务
    const workflowJobs = (await get_workflow_page({
      page: 1,
      size: 10000,
      status: null,
      procName: `${projectAbbr}_${queryParam.value.tableAbbr}`
    })).data.records

    let newWorkflowJobs = []

    for (const v of workflowJobs) {
      const job = {
        id: v.id,
        jobName: v.procName,
        type: getWorkflowJobType(v),
        status: getWorkflowJobStatus(v),
        schedMode: v.schedulingMode,
        cron: v.crontab == '' ? null : v.crontab,
        lastExecTime: await workflowJobGetLastExecTime(v),
        nextExecTime: workflowJobGetNextExecTime(v),
        createBy: v.createBy,
        code: v.procCode
      }

      newWorkflowJobs.push(job)
    }

    // 添加未创建的任务
    newWorkflowJobs = pushUnExistJobs(newWorkflowJobs, projectAbbr, queryParam.value.tableAbbr, projectTree.isBasicData)

    // 行为数据的共享任务不显示
    if (!projectTree.isBasicData) {
      newWorkflowJobs = newWorkflowJobs.filter(job => job.type !== '数据入库任务')
    }

    jobs.push(...newDataXJobs, ...newWorkflowJobs)
  } else {
    tableDataRef.value = []
  }

  tableDataRef.value = jobs.sort(jobNameCompare)

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
                    break
                  case '数据质检任务':
                    await createZjJobModalInit(project)
                    break
                  case '数据融合任务':
                    await createRhJobModalInit(project)
                    showModalRef.value = true
                    modalTitle = '创建融合任务'
                    formSelect.value.createRhJob = true
                    break
                  case '单表融合任务':
                    await createRhJobModalInit(project)
                    showModalRef.value = true
                    modalTitle = '创建单表融合任务'
                    formSelect.value.createRhJob = true
                    break
                  case '多表融合任务':
                    await createRh2JobModalInit(project)
                    showModalRef.value = true
                    modalTitle = '创建多表融合任务'
                    formSelect.value.createRh2Job = true
                    break
                  case '数据备份任务':
                    await createBfJobModalInit(project)
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
              }),
              showConfirmation('删除', async () => {
                await dataXJobDelete(row)
              }),
            ]
            break
          case  1: // 任务停用
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {
              container.children = [
                showButton('启用', () => {
                  dataXJobStart(row)
                }),
                showConfirmation('执行', () => {
                  dataXJobRun(row)
                }),
                showConfirmation('删除', async () => {
                  await dataXJobDelete(row)
                }),
                showButton('日志', () => {
                  showDataXJobLog(row)
                }),
              ]
            } else {
              container.children = [
                showButton('启用', () => {
                  workflowActive(row.id, '01')
                }),
                showConfirmation('执行', async () => {
                  await workflowActive(row.id, '01')
                  await workflowRun(row)
                }),
                showConfirmation('删除', async () => {
                  await workflowDelete(row.id)
                }),
                showButton('日志', () => {
                  showWorkflowLog(row)
                }),
              ]
            }
            break
          case 2:// 任务启用
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {
              container.children = [
                showButton('停用', () => {
                  cjJobStop(row)
                }),
                showConfirmation('执行', () => {
                  dataXJobRun(row)
                }),
                showConfirmation('删除', async () => {
                  await cjJobStop(row)
                  await dataXJobDelete(row)
                }),
                showButton('日志', () => {
                  showDataXJobLog(row)
                }),
              ]
            } else {
              container.children = [
                showButton('停用', () => {
                  workflowActive(row.id, '02')
                }),
                showConfirmation('执行', () => {
                  workflowRun(row)
                }),
                showConfirmation('删除', async () => {
                  await workflowActive(row.id, '02')
                  await workflowDelete(row.id)
                }),
                showButton('日志', () => {
                  showWorkflowLog(row)
                }),
              ]
            }
            break
          case 3:// 任务运行中
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {
              container.children = [
                showButton('日志', () => {
                  showDataXJobLog(row)
                }),
              ]
            } else {
              container.children = [
                showButton('日志', () => {
                  showWorkflowLog(row)
                }),
              ]
            }
            break
          case 4:// 任务异常
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {
              container.children = [
                showButton('日志', () => {
                  showDataXJobLog(row)
                }),
              ]
            } else {
              container.children = [
                showConfirmation('重跑', async () => {
                  workflowReRun(row)
                }),
                showConfirmation('删除', async () => {
                  await workflowDelete(row.id)
                }),
                showButton('日志', () => {
                  showWorkflowLog(row)
                }),
              ]
            }
            break
          case 5:
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {
              container.children = [
                showButton('日志', () => {
                  showDataXJobLog(row)
                }),
              ]
            } else {
              container.children = [
                showConfirmation('重跑', async () => {
                  workflowReRun(row)
                }),
                showConfirmation('删除', async () => {
                  await workflowDelete(row.id)
                }),
                showButton('日志', () => {
                  showWorkflowLog(row)
                }),
              ]
            }
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

/**
 * @param id: 任务ID
 * @param type: 01：启用， 02：停用
 **/
const workflowActive = async (id: string, type: '01' | '02') => {
  await workflow_active({
    id: id,
    type: type
  }).then((res) => {
    if (res.code == 200) {
      window.$message.success(type == '01' ? '启用成功' : '停用成功')
      tableDataInit()
    } else {
      window.$message.error(res.msg, res.message)
    }
  })
}

const workflowRun = async (v: Job) => {

  if (v.type === '数据质检任务') {
    if (!isValidConfigRef.value) {
      const tableName = `di_${projectRef.value.tableAbbr}_${queryParam.value.tableAbbr.toString().toLowerCase()}_temp_ods`
      window.$dialog.warning({
        title: '警告',
        content: `检测到未在【质量门户】对[${tableName}]进行配置，是否继续执行质检？`,
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
      window.$message.success(res.message)
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  }).then(() => {
    create_cron_job(v.jobName)
  })
}

const workflowReRun = (v: Job) => {
  workflow_rerun(v.id, 2).then(res => {
    if (res.code == 200) {
      window.$message.success(res.message)
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  }).then(() => {
    create_cron_job(v.jobName)
  })
}

const workflowDelete = (id) => {
  workflow_delete(id).then(res => {
    if (res.code == 200) {
      window.$message.success(res.data)
      tableDataInit()
    } else {
      window.$message.error("删除失败")
    }
  })
}

const dataXJobStart = async (row: Job) => {
  const schedJobId = (await getSchedJob(row.jobName)).id
  cj_job_start(schedJobId).then(res => {
    if (res.data == 'success') {
      window.$message.success('启用成功')
      tableDataInit()
    } else {
      window.$message.error(res.msg)
    }
  })
}

const cjJobStop = async (row: Job) => {
  const schedJobId = (await getSchedJob(row.jobName)).id
  cj_job_stop(schedJobId).then(res => {
    if (res.data == 'success') {
      window.$message.success('停用成功')
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  })
}

const dataXJobRun = async (row: Job) => {
  const schedJobId = (await getSchedJob(row.jobName)).id
  cj_job_run({
    jobId: schedJobId,
    subsystemName: "采集"
  }).then(res => {
    if (res.data == 'success') {
      window.$message.success('执行成功')
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  })
}

const dataXJobDelete = async (row: Job) => {
  const schedJobId = (await getSchedJob(row.jobName))?.id || null
  if (schedJobId != null) {
    sched_job_delete(schedJobId).then(res => {
      if (res.code == 0) {
        window.$message.success('调度任务删除成功')
        cj_job_delete(row.id).then(res1 => {
          if (res1.code == 0) {
            window.$message.success('采集任务删除成功')
            tableDataInit()
          } else {
            window.$message.error(res1.msg)
          }
        })
      } else {
        window.$message.error(res.msg)
      }
    })
  } else {
    cj_job_delete(row.id).then(res1 => {
      if (res1.code == 0) {
        window.$message.success('采集任务删除成功')
        tableDataInit()
      } else {
        window.$message.error(res1.msg)
      }
    })
  }

}

// endregion

const showModalRef = ref(false)

let modalTitle = '';
let confirmBtnText = '创建'

const formSelect = ref({
  addSchedJob: false,
  createCjJob: false,
  createZjJob: false,
  createBfJob: false,
  createRhJob: false,
  createRh2Job: false,
  createQcJob: false,
  quickCreate: false,
  validConfig: false,
})

const onModelAfterLeave = () => {
  formSelect.value = {
    addSchedJob: false,
    createCjJob: false,
    createZjJob: false,
    createBfJob: false,
    createRhJob: false,
    createRh2Job: false,
    createQcJob: false,
    quickCreate: false,
    validConfig: false,
  }
}

const onNegativeClick = () => {
  showModalRef.value = false
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
            window.$message.success('调度任务创建成功')
            tableDataInit()
          } else {
            window.$notification.create({
              title: '调度任务创建失败',
              content: res.msg + '，请重新配置CRON表达式',
              type: "warning"
            })
          }
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.addSchedJob = false
        })
      } else {
        console.error(errors)
      }
    })
  }

  if (formSelect.value.createCjJob) {
    targetTableColumnsRef.value = (await get_columns(cjJobModalFormModel.value.targetDataSourceId, cjJobModalFormModel.value.targetTableName))

    if (!isEmpty(targetTableColumnsRef.value)) {
      cjJobModalFormRef.value?.validate(async (errors) => {
        if (!errors) {
          createCjJob({
            name: cjJobModalFormModel.value.name,
            sourceTableName: cjJobModalFormModel.value.sourceTableName,
            targetTableName: cjJobModalFormModel.value.targetTableName,
            projectId: cjJobModalFormModel.value.projectId,
            sourceDataSourceId: '7',
            targetDataSourceId: '6'
          }, sourceTableColumnsRef.value, targetTableColumnsRef.value).finally(() => {
            isSaving.value = false
            showModalRef.value = false
            formSelect.value.createCjJob = false
            tableDataInit()
          })
        } else {
          console.error(errors)
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
        }).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createZjJob = false
        })
      } else {
        console.error(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createBfJob) {
    bfJobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createBfJob(bfJobModalFormModel.value).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createBfJob = false
        })
      } else {
        console.error(errors)
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
        }, projectTree.isBasicData, false).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createRhJob = false
        })
      } else {
        console.error(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createRh2Job) {
    rh2JobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createRhJob({
          projectId: rh2JobModalFormModel.value.projectId,
          personId: rh2JobModalFormModel.value.personId,
          tableName: rh2JobModalFormModel.value.tableName
        }, projectTree.isBasicData, true).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createRh2Job = false
        })
      } else {
        console.error(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.createQcJob) {
    qcJobModalFormRef.value?.validate((errors) => {
      if (!errors) {
        createQcJob(qcJobModalFormModel.value).then(() => {
          tableDataInit()
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
          formSelect.value.createQcJob = false
        })
      } else {
        console.error(errors)
        isSaving.value = false
      }
    })
  }

  if (formSelect.value.quickCreate) {
    if (!isEmpty(quickCreateModalFormModel.value.jobSelect)) {
      quickCreateModalFormRef.value?.validate(async (errors) => {
        if (!errors) {
          quickCreate().then(() => {
            tableDataInit()
          }).finally(() => {
            isSaving.value = false
            showModalRef.value = false
            formSelect.value.quickCreate = false
          })
        } else {
          console.error(errors)
        }
      })
    } else {
      window.$message.warning("未选择任务")
    }
  }

  if (formSelect.value.validConfig) {
    validConfigModalFormRef.value?.validate(async (errors) => {
      if (!errors) {
        if (!isValidConfigRef.value) {
          create_valid_config(validConfigModalFormModel.value).then(async res => {
            if (res.code == 200) {
              window.$message.success('配置成功')
              isValidConfigRef.value = await getIsValidConfig(projectRef.value.tableAbbr, queryParam.value.tableAbbr)
            } else {
              window.$message.error(res.message)
            }
          }).finally(() => {
            isSaving.value = false
            showModalRef.value = false
            formSelect.value.validConfig = false
          })
        }

      } else {
        console.error(errors)
      }
    })
  }
}

const quickCreate = async () => {
  const project = (await find_by_project_id(queryParam.value.projectId))

  if (quickCreateModalFormModel.value.jobSelect.includes('cj')) {
    const targetTableColumns = (await get_columns('6', quickCreateModalFormModel.value.targetTableName))
    if (!isEmpty(targetTableColumns)) {
      createCjJob({
        name: `cj_${project.projectAbbr}_${quickCreateModalFormModel.value.tableName}`,
        sourceTableName: quickCreateModalFormModel.value.sourceTableName,
        targetTableName: quickCreateModalFormModel.value.targetTableName,
        projectId: quickCreateModalFormModel.value.projectId,
        sourceDataSourceId: '7',
        targetDataSourceId: '6'
      }, sourceTableColumnsRef.value, targetTableColumns)
    } else {
      window.$message.warning('采集目标表不存在')
    }
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('zj')) {
    await createZjJob({
      projectId: quickCreateModalFormModel.value.projectId,
      personId: quickCreateModalFormModel.value.personId,
      tableName: quickCreateModalFormModel.value.tableName
    })
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('bf')) {
    await createBfJob(quickCreateModalFormModel.value)
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('rh') || quickCreateModalFormModel.value.jobSelect.includes('rh1')) {
    await createRhJob({
      projectId: quickCreateModalFormModel.value.projectId,
      personId: quickCreateModalFormModel.value.personId,
      tableName: quickCreateModalFormModel.value.tableName
    }, projectTree.isBasicData, false)
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('rh2')) {
    await createRhJob({
      projectId: quickCreateModalFormModel.value.projectId,
      personId: quickCreateModalFormModel.value.personId,
      tableName: quickCreateModalFormModel.value.tableName
    }, projectTree.isBasicData, true)
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('qc')) {
    await createQcJob(quickCreateModalFormModel.value)
  }

  if (quickCreateModalFormModel.value.jobSelect.includes('rk')) {
    await createRkJob({
      name: `rk_${project.projectAbbr}_${quickCreateModalFormModel.value.tableName}`,
      sourceDataSourceId: '6',
      sourceTableName: `df_${project?.tableAbbr || ''}_${quickCreateModalFormModel.value.tableName}_dwb`,
      targetDataSourceId: '8',
      targetTableName: `sztk_${quickCreateModalFormModel.value.tableName}`,
      projectId: quickCreateModalFormModel.value.projectId,
      personId: quickCreateModalFormModel.value.personId
    }, true, true)

  }

  if (quickCreateModalFormModel.value.jobSelect.includes('gx')) {
    await createGxJob({
      name: `gx_${project.projectAbbr}_${quickCreateModalFormModel.value.tableName}`,
      sourceTableName: `sztk_${quickCreateModalFormModel.value.tableName}`,
      targetTableName: `gdsztk_${quickCreateModalFormModel.value.tableName}`,
      projectId: project.projectId
    })
  }

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

  showModalRef.value = true
  modalTitle = '创建调度任务'
  confirmBtnText = '创建'
  formSelect.value.addSchedJob = true
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
let targetTableColumnsRef = ref([])

const createCjJobModalInit = async (project, row: Job) => {
  sourceTableOptions.value = await getTablesOptions(cjJobModalFormModel.value.sourceDataSourceId)
  cjJobModalFormModel.value.name = row.jobName
  cjJobModalFormModel.value.targetTableName = `di_${project.tableAbbr}_${queryParam.value.tableAbbr.toLowerCase()}_temp_ods`
  cjJobModalFormModel.value.projectId = project.projectId

  showModalRef.value = true
  modalTitle = '创建采集任务'
  confirmBtnText = '创建'
  formSelect.value.createCjJob = true
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

  showModalRef.value = true
  modalTitle = '创建质检任务'
  confirmBtnText = '创建'
  formSelect.value.createZjJob = true
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

  showModalRef.value = true
  modalTitle = '创建备份任务'
  confirmBtnText = '创建'
  formSelect.value.createBfJob = true
}

//endregion

//region 创建单表融合任务
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

  confirmBtnText = '创建'
}
//endregion

//region 创建单表融合任务
const rh2JobModalFormRef = ref<FormInst | null>(null);

const rh2JobModalFormModel = ref({
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})
const rh2JobModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const createRh2JobModalInit = (project) => {
  rh2JobModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toUpperCase()
  rh2JobModalFormModel.value.projectId = queryParam.value.projectId
  rh2JobModalFormModel.value.projectName = project.projectName

  confirmBtnText = '创建'
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

  confirmBtnText = '创建'
}

//endregion

//region 快捷创建
const quickCreateModalFormRef = ref<FormInst | null>(null);

const quickCreateModalFormModel = ref({
  jobSelect: [],
  sourceDataSourceId: '7',
  sourceTableName: '',
  targetTableName: '',
  tableName: '',
  projectId: '',
  projectName: '',
  personId: ''
})

const quickCreateModalFormRules = {
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  },
  sourceTableName: {
    required: true,
    trigger: ['change'],
    message: '选择来源表'
  },
}

const jobTypeTreeOptionsRef = ref<TreeSelectOption[]>([])

const jobTypeTreeOptionsInit = () => {
  jobTypeTreeOptionsRef.value = cloneDeep([
    {
      label: 'DataX任务',
      key: '0',
      children: [
        {
          label: '数据采集任务',
          key: 'cj',
        },
        {
          label: '数据共享任务',
          key: 'gx',
          disabled: !projectTree.isBasicData
        }
      ]
    },
    {
      label: '工作流任务',
      key: '1',
      children: [
        {
          label: '数据质检任务',
          key: 'zj',
        },
        {
          label: '数据备份任务',
          key: 'bf',
        },
        {
          label: '数据清除任务',
          key: 'qc',
        },
        {
          label: '数据融合任务',
          key: 'rh',
          disabled: !projectTree.isBasicData
        },
        {
          label: '单表融合任务',
          key: 'rh1',
          disabled: projectTree.isBasicData
        },
        {
          label: '多表融合任务',
          key: 'rh2',
          disabled: projectTree.isBasicData
        },
        {
          label: '数据入库任务',
          key: 'rk',
          disabled: !projectTree.isBasicData
        }
      ]
    }
  ])
}

const quickCreateModalInit = async () => {
  modalTitle = '快捷创建任务'
  formSelect.value.quickCreate = true
  const project = (await find_by_project_id(queryParam.value.projectId))
  quickCreateModalFormModel.value.jobSelect = []
  quickCreateModalFormModel.value.tableName = queryParam.value.tableAbbr.toString().toLowerCase()
  quickCreateModalFormModel.value.projectId = queryParam.value.projectId
  quickCreateModalFormModel.value.projectName = project.projectName

  handleJobTreeOptionsUpdate()

  confirmBtnText = '创建'

  showModalRef.value = true
}

const handleJobTreeOptionsUpdate = () => {

  //先获取已创建的任务名
  const disabledJobs = tableDataRef.value.filter(job => job.status != -1).map((
      v => (v.jobName.split('_')[0])
  ))

  jobTypeTreeOptionsInit()

  jobTypeTreeOptionsRef.value = updateTreeOptionDisabledByKey(jobTypeTreeOptionsRef.value, disabledJobs)

  if (!jobTypeTreeOptionsRef.value[0].children.some((child) => !child.disabled)) {
    jobTypeTreeOptionsRef.value[0].disabled = true
  }

  if (!jobTypeTreeOptionsRef.value[1].children.some((child) => !child.disabled)) {
    jobTypeTreeOptionsRef.value[1].disabled = true
  }
}

const updateTreeOptionDisabledByKey = (treeOptions: TreeSelectOption[], disableKeys: string[]) => {
  for (const option of treeOptions) {
    if (disableKeys.includes(option.key as string)) {
      // 找到了指定的节点，更新其 disabled 属性
      option.disabled = true;
      // 检查是否需要更新父节点的 disabled 属性
      // checkParentNodeDisabled(treeOptions, option.key as string);
    }
    if (option.children) {
      // 继续递归查找子节点
      updateTreeOptionDisabledByKey(option.children, disableKeys);
    }
  }
  return treeOptions
}

const handleJobTreeUpdateValue = async (v) => {
  if (v.includes('cj')) {
    const project = (await find_by_project_id(queryParam.value.projectId))
    sourceTableOptions.value = await getTablesOptions(cjJobModalFormModel.value.sourceDataSourceId)
    quickCreateModalFormModel.value.targetTableName = `di_${project.tableAbbr}_${quickCreateModalFormModel.value.tableName}_temp_ods`
  }
}
//endregion

//region 质检配置管理

// 组织机构下拉值
const mechanismOptions = ref<Array<SelectOption | SelectGroupOption>>()

const validConfigModalFormRef = ref<FormInst | null>(null);

const validConfigModalFormModel = ref({
  dbId: '6',
  dbName: "数据中台（TBDS）",
  mechanismId: '',
  mechanismName: '',
  pkeyName: '',
  cdBatchName: 'cd_batch',
  tableName: ''
})

const validConfigModalFormRules = {
  mechanismId: {
    required: true,
    trigger: ['change'],
    message: '请选择组织机构'
  },
  pkeyName: {
    required: true,
    trigger: ['input'],
    message: '请输入主键字段'
  },
  cdBatchName: {
    required: true,
    trigger: ['input'],
    message: '请输入批次号字段'
  }
}

const validConfigModalInit = async () => {

  const validTableName = `di_${projectRef.value.tableAbbr}_${queryParam.value.tableAbbr.toString().toLowerCase()}_temp_ods`

  if (isValidConfigRef.value) {
    // 若已配置
    get_valid_config_page(validTableName).then(res => {
      const data = res.data.records[0]
      validConfigModalFormModel.value.dbId = data.dbId
      validConfigModalFormModel.value.dbName = data.dbName
      validConfigModalFormModel.value.mechanismId = data.mechanismId
      validConfigModalFormModel.value.mechanismName = data.mechanismName
      validConfigModalFormModel.value.pkeyName = data.pkeyName
      validConfigModalFormModel.value.cdBatchName = data.cdBatchName
      validConfigModalFormModel.value.tableName = data.tableName
    })

    confirmBtnText = '确定'
  } else {
    validConfigModalFormModel.value.tableName = validTableName
    validConfigModalFormModel.value.mechanismId = ''
    validConfigModalFormModel.value.mechanismName = ''
    validConfigModalFormModel.value.pkeyName = (await get_table_sql({tableName: queryParam.value.tableAbbr.toString()}))[0].pColName.toLowerCase()
    validConfigModalFormModel.value.cdBatchName = 'cd_batch'

    confirmBtnText = '保存'
  }

  mechanismOptions.value = (await gte_usrc_org_tree()).data.sort(customSort).map((v => ({
    label: `${v.name}`,
    value: v.id
  })))

  modalTitle = '质检配置管理'

  formSelect.value.validConfig = true
  showModalRef.value = true
}

const customSort = (a: any, b: any) => {
  // Check if both strings start with '广东省'
  const startsWithGuangDongA = a.name.startsWith('广东省');
  const startsWithGuangDongB = b.name.startsWith('广东省');

  if (startsWithGuangDongA && !startsWithGuangDongB) {
    return -1; // Move `a` before `b`
  } else if (!startsWithGuangDongA && startsWithGuangDongB) {
    return 1; // Move `b` before `a`
  } else {
    // Both start with '广东省' or don't start with it
    return a.name.localeCompare(b.name);
  }
};

const handlemechanismIdUpdate = () => {
  validConfigModalFormModel.value.mechanismName = mechanismOptions.value.filter(item => item.value == validConfigModalFormModel.value.mechanismId)[0].label as string
}

//endregion

// region 日志
const showDrawerRef = ref(false)
const logItemsRef = ref<TimelineItemProps[]>([])
const showTipRef = ref(false)

const showDataXJobLog = async (v) => {
  const logs = (await get_datax_job_log({
    current: 1,
    size: 100,
    blurry: v.jobName
  })).data.records

  showTipRef.value = logs.length >= 100;

  logItemsRef.value = []

  logs.forEach(log => {
    let type
    let title
    let content
    let time

    if (log.handleCode == 0) {
      title = '运行中'
      type = 'info'
    } else if (log.handleCode == 200) {
      title = '执行成功'
      type = 'success'
    } else if (log.handleCode == 500) {
      title = '执行失败'
      type = 'error'
    } else {
      title = '未知'
      type = 'warning'
    }

    time = log.handleTime
    content = ''

    logItemsRef.value.push({
      type: type,
      title: title,
      content: content,
      time: time
    })
  })

  showDrawerRef.value = true
}

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
