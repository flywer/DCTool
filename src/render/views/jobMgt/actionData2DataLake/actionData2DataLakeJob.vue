<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 95px);" trigger="hover">
    <div class="w-auto h-8 mb-2">
      <n-space inline class="float-right">
        <n-button secondary type="info" @click="saveModalInit">
          创建
          <template #icon>
            <n-icon>
              <Add/>
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
        :scroll-x="1400"
    />
  </n-scrollbar>

  <job-log-drawer v-model:show="showDrawerRef" :job="drawerJobRef"/>

  <n-modal
      v-model:show="showSaveModalRef"
      :mask-closable="true"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="'创建入湖任务'"
      :size="'small'"
  >
    <n-form
        class="mt-4"
        ref="saveModalFormRef"
        :model="saveModalFormModel"
        :rules="saveModalFormRules"
        :size="'small'"
    >
      <n-grid :cols="1" :x-gap="4">
        <n-form-item-gi label="表名" path="tableName">
          <n-select
              v-model:value="saveModalFormModel.tableName"
              placeholder="选择表名"
              :options="tableNameOptions"
              :consistent-menu-width="false"
              filterable
          />
        </n-form-item-gi>
        <n-form-item-gi label="责任人" path="personId">
          <n-select
              v-model:value="saveModalFormModel.personId"
              placeholder="选择责任人"
              :options="personIdOptions"
              :consistent-menu-width="false"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #action>
      <n-button type="primary" :size="'small'" @click="handleModalFormSave" :loading="isSaving">保存</n-button>
      <n-button :size="'small'" @click="showSaveModalRef=false">返回</n-button>
    </template>
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
import {Job, JobType} from "@common/types/jobMgt";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {get_job_project_by_id, get_workflow_list_by_project_id} from "@render/api/datacenter.api";
import WorkflowConfigModal from "@render/components/datacenter/workflowConfigModal.vue";
import {personIdOptions} from "@render/typings/datacenterOptions";
import {actionTableNames} from "@render/utils/datacenter/constants";
import {workflowJobNameExist} from "@render/utils/datacenter/jobNameExist";
import {
  getWorkflowJobStatus,
  renderWorkflowActionButton,
  setJobStatus,
  showButton,
  workflowJobGetLastExecTime,
  workflowJobGetNextExecTime,
} from "@render/utils/datacenter/jobTabUtil";
import {RkJobSaveModel} from "@render/utils/datacenter/workflow/RkJobSaveModel";
import JobLogDrawer from "@render/views/jobMgt/components/jobLogDrawer.vue";
import {Add, Refresh} from '@vicons/ionicons5'
import {VNode} from "@vue/runtime-core";
import {DataTableColumns, FormInst, NButton, NIcon, NSpace, SelectOption} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

const tableDataRef = ref([])
const isTableLoading = ref(false)

// 数据湖行政行为数据归集
const projectId = '39'
// 当前项目示例，数据中台信息
const datacenterProjectRef = ref(null)

const queryParam = ref('')

onMounted(async () => {
  tableNameOptionsInit()
  await tableDataInit()
  datacenterProjectRef.value = await get_job_project_by_id(projectId)
})

// region 表格
const tableDataInit = async () => {
  isTableLoading.value = true

  // 工作流任务
  const allActionRkJobs: Workflow[] = (await get_workflow_list_by_project_id(projectId)).data

  const actionRkJobs: Workflow[] = allActionRkJobs.filter(job => job.procName.includes('rk_lake_'))

  let newJobs = []

  for (const v of actionRkJobs) {
    const job: Job = {
      id: v.id,
      jobName: v.procName,
      type: JobType.rk,
      status: getWorkflowJobStatus(v),
      schedMode: parseInt(v.schedulingMode) == 1 ? 1 : 2,
      cron: v.crontab == '' ? null : v.crontab,
      lastExecTime: await workflowJobGetLastExecTime(v),
      nextExecTime: workflowJobGetNextExecTime(v),
      createBy: v.createBy,
      code: v.procCode,
      comment: await getTableComment(v.procName),
      createTime: v.createTime,
      updateTime: v.updateTime,
      jobRerunType: v.editModel == 1 ? 2 : 1,
      project: await find_by_project_id(projectId)
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
      width: '24%',
      align: 'center',
      fixed: 'right',
      render(row) {

        let container = h(NSpace, {
          justify: 'center'
        })

        let children: VNode[] = renderWorkflowActionButton(row, tableDataInit)

        if (![0, -1].includes(row.status)) {
          children.push(showButton('日志', () => showJobLogDrawer(row)))
          children.push(showButton('任务配置', () => showWorkflowConfigModal(row)))
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
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
  }
})
// endregion

// region 日志
const showDrawerRef = ref(false)
const drawerJobRef = ref<Job>(null)

const showJobLogDrawer = (v: Job) => {
  drawerJobRef.value = v
  showDrawerRef.value = true
}
//endregion

// region 创建Modal
const showSaveModalRef = ref(false)

const saveModalFormRef = ref<FormInst | null>(null)
const saveModalFormModel = ref({
  tableName: null,
  personId: null,
  projectId: projectId
})
const saveModalFormRules = {
  tableName: {
    required: true,
    trigger: ['change'],
    message: '请选择表名'
  },
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择负责人'
  },
}

const tableNameOptions = ref<Array<SelectOption>>()

const tableNameOptionsInit = () => {
  tableNameOptions.value = actionTableNames.map((v) => ({
    label: v.toUpperCase(),
    value: v,
  }))
}

const saveModalInit = () => {
  saveModalFormModel.value.tableName = null
  saveModalFormModel.value.personId = datacenterProjectRef.value?.userId || null

  showSaveModalRef.value = true
}

const isSaving = ref(false)
const handleModalFormSave = () => {

  saveModalFormRef.value?.validate(async errors => {
    if (!errors) {
      const model = new RkJobSaveModel({
        name: `rk_lake_${saveModalFormModel.value.tableName}`,
        projectId: projectId,
        personId: saveModalFormModel.value.personId,
        sourceDataSourceId: '6',
        sourceTableName: `df_lake_${saveModalFormModel.value.tableName}_dm`,
        targetDataSourceId: '12',
        targetTableName: `sztk_${saveModalFormModel.value.tableName}`,
      })

      if (!await workflowJobNameExist(model.name)) {
        isSaving.value = true
        model.createJob(true, true)
            .then(() => {
              tableDataInit()
              showSaveModalRef.value = false
            })
            .finally(() => isSaving.value = false)
      } else {
        window.$message.warning('任务已存在')
      }
    }
  })
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
