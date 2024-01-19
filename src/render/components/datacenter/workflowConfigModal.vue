<template>
  <n-modal
      v-model:show="_show"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="title"
      :size="'small'"
      style="width: 560px"
  >
    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
      <n-layout class="m-2">
        <n-form
            ref="configFormRef"
            class="mt-2"
            :model="configModelRef"
            :rules="configModelRules"
            :size="'small'"
        >
          <n-card :content-style="{paddingBottom:0}">
            <n-grid :cols="12" :x-gap="12">
              <n-gi :span="12">
                <n-h6 prefix="bar" align-text>
                  基础配置
                </n-h6>
              </n-gi>
              <n-form-item-gi :span="12" label="工作流名称" path="procName">
                <n-input v-model:value="configModelRef.procName"/>
              </n-form-item-gi>
              <n-form-item-gi :span="6" label="项目" path="projectId">
                <n-select
                    v-model:value="configModelRef.projectId"
                    placeholder="选择项目"
                    :options="projectIdOptions"
                    :consistent-menu-width="false"
                    filterable
                />
              </n-form-item-gi>
              <n-form-item-gi :span="6" label="责任人" path="personId">
                <n-select
                    v-model:value="configModelRef.personId"
                    placeholder="选择责任人"
                    :options="personIdOptions"
                    :consistent-menu-width="false"
                />
              </n-form-item-gi>

              <n-form-item-gi :span="6" label="告警邮箱">
                <n-input v-model:value="configModelRef.email" placeholder="输入告警邮箱" @keydown.enter.prevent/>
              </n-form-item-gi>
              <n-form-item-gi :span="6" label="描述">
                <n-input v-model:value="configModelRef.description" placeholder="输入描述"
                         @keydown.enter.prevent
                />
              </n-form-item-gi>
            </n-grid>
          </n-card>

          <n-card class="mt-2" :content-style="{paddingBottom:0}">
            <n-grid :cols="14" :x-gap="12">
              <n-gi :span="14">
                <n-h6 prefix="bar" align-text>
                  调度配置
                </n-h6>
              </n-gi>

              <n-gi :span="14">
                <n-radio-group v-model:value="configModelRef.schedulingMode" :size="'small'"
                               style="margin-bottom: 24px"
                >
                  <n-radio-button
                      :key="0"
                      :value="0"
                      label="无"
                  />
                  <n-radio-button
                      :key="1"
                      :value="1"
                      label="依赖调度"
                  />
                  <n-radio-button
                      :key="2"
                      :value="2"
                      label="定时调度"
                  />
                </n-radio-group>
              </n-gi>

              <template v-if="configModelRef.schedulingMode == 1">
                <n-form-item-gi
                    :span="14"
                    label="依赖任务"
                    path="dependencyWorkflowId"
                >
                  <n-select
                      v-model:value="configModelRef.dependencyWorkflowId"
                      placeholder="选择工作流任务"
                      :options="workflowOptions"
                      :consistent-menu-width="false"
                      filterable
                      @search="handleWorkflowSelectSearch"
                      @scroll="handleWorkflowSelectScroll"
                      @update:value="handleDependencyWorkflowUpdate"
                  />
                </n-form-item-gi>
              </template>

              <template v-if="configModelRef.schedulingMode == 2">
                <n-form-item-gi :span="2" label="秒" path="schedulingTime.sec" :label-style="{margin:'0 auto'}">
                  <n-input
                      class="text-center"
                      v-model:value="configModelRef.schedulingTime.sec"
                      placeholder=""
                  >
                  </n-input>
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="分" path="schedulingTime.min" :label-style="{margin:'0 auto'}">
                  <n-input
                      class="text-center"
                      v-model:value="configModelRef.schedulingTime.min"
                      placeholder=""
                  >
                  </n-input>
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="时" path="schedulingTime.hour" :label-style="{margin:'0 auto'}">
                  <n-input
                      class="text-center"
                      v-model:value="configModelRef.schedulingTime.hour"
                      placeholder=""
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="日" path="schedulingTime.day" :label-style="{margin:'0 auto'}">
                  <n-input
                      class="text-center"
                      v-model:value="configModelRef.schedulingTime.day"
                      placeholder=""
                      @keydown.enter.prevent
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="月" path="schedulingTime.month" :label-style="{margin:'0 auto'}">
                  <n-input
                      class="text-center"
                      v-model:value="configModelRef.schedulingTime.month"
                      placeholder=""
                      @keydown.enter.prevent
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="周" path="schedulingTime.week" :label-style="{margin:'0 auto'}">
                  <n-input
                      class="text-center"
                      v-model:value="configModelRef.schedulingTime.week"
                      placeholder=""
                      @keydown.enter.prevent
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="年" path="schedulingTime.year" :label-style="{margin:'0 auto'}">
                  <n-input
                      class="text-center"
                      v-model:value="configModelRef.schedulingTime.year"
                      placeholder=""
                      @keydown.enter.prevent
                  />
                </n-form-item-gi>

              </template>

            </n-grid>
          </n-card>

        </n-form>

      </n-layout>

    </n-scrollbar>

    <template #action>
      <n-button type="primary" :size="'small'" @click="handleSave" :loading="isSaving" :disabled="!editable">保存
      </n-button>
      <n-button :size="'small'" @click="_show=false">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {Workflow} from "@common/types/datacenter/workflow";
import {get_workflow, get_workflow_page, update_workflow, workflow_active} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {convertCronExpression, generateCronExpression, isDCCronExpressionValid} from "@render/utils/common/cronUtils";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {isEmpty} from "lodash-es";
import {FormInst, NButton, SelectOption} from "naive-ui";
import {ref, watch} from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  },
  title: {
    type: String,
    default: '配置编辑'
  },
  jobId: {
    type: String,
    required: true,
    default: null
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:show', 'onAfterLeave'])

const _show = ref(false)

watch(() => props.show, (v) => {
  _show.value = v
})
watch(_show, (v) => {
  if (v) {
    formModelInit()
  } else {
    modalReset()
  }
  emit('update:show', v)
})

const modalReset = () => {

}

// region 表单
let workflow: Workflow
const configFormRef = ref<FormInst | null>(null);
const configModelRef = ref({
  procName: null,
  projectId: null,
  personId: null,
  email: null,
  description: null,
  schedulingMode: 0, // 调度类型 1:依赖调度 2:定时调度
  dependencyProjectId: null,
  dependencyProjectName: null,
  dependencyWorkflowId: null,
  dependencyWorkflowName: null,
  schedulingTime: {
    sec: '0',
    min: '0',
    hour: '0,12',
    day: '?',
    month: '*',
    week: '*',
    year: '*'
  }
})
const configModelRules = ref({
  procName: {
    required: true,
    trigger: ['input'],
    message: '请输入工作流名称'
  },
  dependencyWorkflowId: {
    required: true,
    trigger: ['change', 'blur'],
    message: '请选择所依赖任务'
  },
  schedulingTime: {
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

})

const workflowOptions = ref<Array<SelectOption>>()
const workflowSelectQuery = ref('')
const formModelInit = async () => {

  workflow = (await get_workflow(props.jobId)).data

  configModelRef.value.procName = workflow.procName
  configModelRef.value.projectId = workflow.projectId
  configModelRef.value.personId = workflow.personId

  configModelRef.value.email = workflow.email
  configModelRef.value.description = workflow.description

  configModelRef.value.schedulingMode = parseInt(workflow.schedulingMode)

  configModelRef.value.dependencyWorkflowId = workflow.dependencyWorkflowId
  configModelRef.value.dependencyWorkflowName = workflow.dependencyWorkflowName

  await workflowOptionsInit()

  const cron = convertCronExpression(workflow.crontab)
  if (cron != null) {
    configModelRef.value.schedulingTime = {
      sec: cron.seconds,
      min: cron.minutes,
      hour: cron.hours,
      day: cron.dayOfMonth,
      month: cron.month,
      week: cron.dayOfWeek,
      year: cron.year,
    }
  }

}

const workflowOptionsInit = async () => {

  workflowOptions.value = []

  // 工作流任务
  const workflowJobs: Workflow[] = (await get_workflow_page({
    page: 1,
    size: 10,
    status: null,
    procName: ``
  })).data?.records || []

  if (!isEmpty(configModelRef.value.dependencyWorkflowId)) {
    // 当前若已有依赖，查看此依赖是否存在于前十条
    const dependencyWorkflow = (await get_workflow(configModelRef.value.dependencyWorkflowId)).data
    if (dependencyWorkflow && !workflowJobs.some(workflow => workflow.id === dependencyWorkflow.id)) {
      // 不存在则添加
      workflowOptions.value.push({
        label: dependencyWorkflow.procName,
        value: dependencyWorkflow.id
      })
    }
  }

  workflowOptions.value.push(...workflowJobs.map((v) => ({
    label: v.procName,
    value: v.id
  })))

}
const handleWorkflowSelectScroll = async (e: Event) => {
  const currentTarget = e.currentTarget as HTMLElement
  if (
      currentTarget.scrollTop + currentTarget.offsetHeight >=
      currentTarget.scrollHeight
  ) {
    // 工作流任务
    const workflowJobs: Workflow[] = (await get_workflow_page({
      page: (workflowOptions.value.length / 10) + 1,
      size: 10,
      status: null,
      procName: workflowSelectQuery.value
    })).data?.records || []

    workflowOptions.value.push(...workflowJobs.map((v) => ({
      label: v.procName,
      value: v.id
    })))

  }
}
const handleWorkflowSelectSearch = async (query: string) => {

  workflowSelectQuery.value = query

  workflowOptions.value = []

  // 工作流任务
  const workflowJobs: Workflow[] = (await get_workflow_page({
    page: 1,
    size: 10,
    status: null,
    procName: query
  })).data?.records || []

  if (!isEmpty(configModelRef.value.dependencyWorkflowId)) {
    // 当前若已有依赖，查看此依赖是否存在于前十条
    const dependencyWorkflow = (await get_workflow(configModelRef.value.dependencyWorkflowId)).data
    if (dependencyWorkflow && !workflowJobs.some(workflow => workflow.id === dependencyWorkflow.id)) {
      // 不存在则添加
      workflowOptions.value.push({
        label: dependencyWorkflow.procName,
        value: dependencyWorkflow.id
      })
    }
  }

  workflowOptions.value.push(...workflowJobs.map((v) => ({
    label: v.procName,
    value: v.id
  })))
}

const handleDependencyWorkflowUpdate = async (id: string) => {
  const dependencyWorkflow = (await get_workflow(id)).data

  configModelRef.value.dependencyWorkflowName = dependencyWorkflow.procName
  configModelRef.value.dependencyProjectId = dependencyWorkflow.projectId
  configModelRef.value.dependencyProjectName = dependencyWorkflow.projectName
}
// endregion

const isSaving = ref(false)
const handleSave = () => {
  configFormRef.value?.validate(async errors => {
    if (!errors) {
      isSaving.value = true
      if (schedulingTimeValid()) {
        const workflow1: Workflow = (await get_workflow(workflow.id)).data
        if (workflow1.status == '1') {
          // 停用
          await workflow_active({
            id: workflow.id,
            type: '02'
          })
          updateWorkflow().then(async res => {
            if (res.success) {
              await workflow_active({
                id: workflow.id,
                type: '01'
              })
              window.$message.success(res.message)
              _show.value = false
              emit('onAfterLeave')
            } else {
              window.$message.error(res.message)
            }
          }).finally(() => isSaving.value = false)
        } else {
          updateWorkflow().then(res => {
            if (res.success) {
              window.$message.success(res.message)
              _show.value = false
              emit('onAfterLeave')
            } else {
              window.$message.error(res.message)
            }
          }).finally(() => isSaving.value = false)
        }

      }
    }
  })
}

const schedulingTimeValid = () => {
  if (configModelRef.value.schedulingMode == 2) {
    const cron = generateCronExpression(configModelRef.value.schedulingTime)
    if (!isDCCronExpressionValid(cron)) {
      window.$message.warning('定时调度表达式不正确')
      return false
    } else {
      return true
    }
  } else {
    return true
  }
}

const updateWorkflow = async () => {
  const newJson: Workflow = JSON.parse(updateSjkUUID(workflow))

  let paramsJson = {
    name: configModelRef.value.procName,
    email: configModelRef.value.email,
    description: configModelRef.value.description,
    personId: configModelRef.value.personId,
    personName: personIdOptions.find(option => option.value === configModelRef.value.personId).label,
    projectId: configModelRef.value.projectId,
    projectName: projectIdOptions.find(option => option.value === configModelRef.value.projectId).label as string,
    dependencyProjectId: configModelRef.value.dependencyProjectId,
    dependencyProjectName: configModelRef.value.dependencyProjectName,
    dependencyWorkflowId: configModelRef.value.dependencyWorkflowId,
    dependencyWorkflowName: configModelRef.value.dependencyWorkflowName,
    schedulingMode: configModelRef.value.schedulingMode,
    crontab: generateCronExpression(configModelRef.value.schedulingTime),
    type: "流程",
    code: newJson.procCode,
    modelXml: newJson.modelXml,
    modelJson: newJson.modelJson,
    dataDevBizVo: JSON.parse(newJson.businessParamsJson)
  }

  return update_workflow(workflow.id, paramsJson)
}

</script>

<style scoped>

</style>
