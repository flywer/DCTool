<template>
  <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
    <n-form
        ref="formRef"
        class="mt-2"
        :model="formModel"
        :rules="formRules"
        :size="'small'"
    >
      <n-card :content-style="{paddingBottom:0}">
        <n-grid :cols="12" :x-gap="12">
          <n-gi :span="14">
            <n-radio-group v-model:value="formModel.schedulingMode" :size="'small'"
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

          <template v-if="formModel.schedulingMode == 1">
            <n-form-item-gi
                :span="14"
                label="依赖任务"
                path="dependencyWorkflowId"
            >
              <n-select
                  v-model:value="formModel.dependencyWorkflowId"
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

          <template v-if="formModel.schedulingMode == 2">
            <n-form-item-gi :span="2" label="秒" path="schedulingTime.sec" :label-style="{margin:'0 auto'}">
              <n-input
                  class="text-center"
                  v-model:value="formModel.schedulingTime.sec"
                  placeholder=""
              >
              </n-input>
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="分" path="schedulingTime.min" :label-style="{margin:'0 auto'}">
              <n-input
                  class="text-center"
                  v-model:value="formModel.schedulingTime.min"
                  placeholder=""
              >
              </n-input>
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="时" path="schedulingTime.hour" :label-style="{margin:'0 auto'}">
              <n-input
                  class="text-center"
                  v-model:value="formModel.schedulingTime.hour"
                  placeholder=""
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="日" path="schedulingTime.day" :label-style="{margin:'0 auto'}">
              <n-input
                  class="text-center"
                  v-model:value="formModel.schedulingTime.day"
                  placeholder=""
                  @keydown.enter.prevent
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="月" path="schedulingTime.month" :label-style="{margin:'0 auto'}">
              <n-input
                  class="text-center"
                  v-model:value="formModel.schedulingTime.month"
                  placeholder=""
                  @keydown.enter.prevent
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="周" path="schedulingTime.week" :label-style="{margin:'0 auto'}">
              <n-input
                  class="text-center"
                  v-model:value="formModel.schedulingTime.week"
                  placeholder=""
                  @keydown.enter.prevent
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="年" path="schedulingTime.year" :label-style="{margin:'0 auto'}">
              <n-input
                  class="text-center"
                  v-model:value="formModel.schedulingTime.year"
                  placeholder=""
                  @keydown.enter.prevent
              />
            </n-form-item-gi>

          </template>

        </n-grid>
      </n-card>
    </n-form>
    <n-space justify="end" class="mt-2">
      <n-button
          type="primary"
          :size="'small'"
          @click="handleSave"
          :loading="isSaving"
          :disabled="!editable"
      >
        保存
      </n-button>
    </n-space>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {Workflow} from "@common/types/datacenter/workflow";
import {get_workflow, get_workflow_page, update_workflow, workflow_active} from "@render/api/datacenter.api";
import {convertCronExpression, generateCronExpression, isDCCronExpressionValid} from "@render/utils/common/cronUtils";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {isEmpty} from "lodash-es";
import {FormInst, NButton, SelectOption} from "naive-ui";
import {onMounted, reactive, ref, watch} from "vue";

const props = defineProps({
  workflow: {
    type: Object as () => Workflow,
    required: true,
    default: null
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:workflow'])

onMounted(() => {
  formInit()
})

watch(() => props.workflow, () => {
  formInit()
})

const formRef = ref<FormInst | null>(null)
const formModel = reactive({
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
const formRules = reactive({
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

const formInit = async () => {
  if (props.workflow) {
    formModel.schedulingMode = parseInt(props.workflow.schedulingMode)
    formModel.dependencyWorkflowId = props.workflow.dependencyWorkflowId
    formModel.dependencyWorkflowName = props.workflow.dependencyWorkflowName

    await workflowOptionsInit()
    const cron = convertCronExpression(props.workflow.crontab)
    if (cron != null) {
      formModel.schedulingTime = {
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
}

const workflowOptions = ref<Array<SelectOption>>()
const workflowSelectQuery = ref('')

const workflowOptionsInit = async () => {

  workflowOptions.value = []

  // 工作流任务
  const workflowJobs: Workflow[] = (await get_workflow_page({
    page: 1,
    size: 10,
    status: null,
    procName: ``
  })).data?.records || []

  if (!isEmpty(formModel.dependencyWorkflowId)) {
    // 当前若已有依赖，查看此依赖是否存在于前十条
    const dependencyWorkflow = (await get_workflow(formModel.dependencyWorkflowId)).data
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

  if (!isEmpty(formModel.dependencyWorkflowId)) {
    // 当前若已有依赖，查看此依赖是否存在于前十条
    const dependencyWorkflow = (await get_workflow(formModel.dependencyWorkflowId)).data
    if (!workflowJobs.some(workflow => workflow.id === dependencyWorkflow.id)) {
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

  formModel.dependencyWorkflowName = dependencyWorkflow.procName
  formModel.dependencyProjectId = dependencyWorkflow.projectId
  formModel.dependencyProjectName = dependencyWorkflow.projectName
}

const isSaving = ref(false)

const handleSave = () => {
  formRef.value?.validate(async errors => {
    if (!errors) {
      isSaving.value = true
      if (schedulingTimeValid()) {
        const workflowStatus = props.workflow.status

        // 停用工作流
        await workflow_active({
          id: props.workflow.id,
          type: '02'
        })

        updateWorkflow()
            .then(async res => {
              if (res.success) {
                if (workflowStatus == '1') {
                  // 再启用工作流
                  await workflow_active({
                    id: props.workflow.id,
                    type: '01'
                  })
                }

                const newWorkflow: Workflow = (await get_workflow(props.workflow.id)).data

                emit('update:workflow', newWorkflow)

                window.$message.success(res.message)
              } else {
                window.$message.error(res.message)
              }
            })
            .finally(() => isSaving.value = false)
      }

    }
  })
}

const schedulingTimeValid = () => {
  if (formModel.schedulingMode == 2) {
    const cron = generateCronExpression(formModel.schedulingTime)
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
  const oldConfig: Workflow = JSON.parse(updateSjkUUID(props.workflow))

  let paramsJson = {
    name: oldConfig.procName,
    email: oldConfig.email,
    description: oldConfig.description,
    personId: oldConfig.personId,
    personName: oldConfig.personName,
    projectId: oldConfig.projectId,
    projectName: oldConfig.projectName,
    dependencyProjectId: formModel.dependencyProjectId,
    dependencyProjectName: formModel.dependencyProjectName,
    dependencyWorkflowId: formModel.dependencyWorkflowId,
    dependencyWorkflowName: formModel.dependencyWorkflowName,
    schedulingMode: formModel.schedulingMode,
    crontab: generateCronExpression(formModel.schedulingTime),
    type: "流程",
    code: oldConfig.procCode,
    modelXml: oldConfig.modelXml,
    modelJson: oldConfig.modelJson,
    dataDevBizVo: JSON.parse(oldConfig.businessParamsJson)
  }

  return update_workflow(props.workflow.id, paramsJson)
}
</script>

<style scoped>

</style>
