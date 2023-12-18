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
          <n-form-item-gi :span="12" label="工作流名称" path="procName">
            <n-input v-model:value="formModel.procName"/>
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="项目" path="projectId">
            <n-select
                v-model:value="formModel.projectId"
                placeholder="选择项目"
                :options="projectIdOptions"
                :consistent-menu-width="false"
                filterable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="责任人" path="personId">
            <n-select
                v-model:value="formModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="告警邮箱">
            <n-input
                v-model:value="formModel.email"
                placeholder="输入告警邮箱"
                @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="描述">
            <n-input
                v-model:value="formModel.description"
                placeholder="输入描述"
                @keydown.enter.prevent
            />
          </n-form-item-gi>
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
import {get_workflow, update_workflow, workflow_active} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {FormInst, NButton} from "naive-ui";
import {onMounted, ref, reactive, watch} from "vue";

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
  procName: null,
  projectId: null,
  personId: null,
  email: null,
  description: null
})
const formRules = reactive({
  procName: {
    required: true,
    trigger: ['input'],
    message: '请输入工作流名称'
  },
  projectId: {
    required: true,
    trigger: ['change'],
    message: '请选择项目'
  },
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择负责人'
  }
})

const formInit = () => {
  if (props.workflow) {
    formModel.procName = props.workflow.procName
    formModel.projectId = props.workflow.projectId
    formModel.personId = props.workflow.personId
    formModel.email = props.workflow.email
    formModel.description = props.workflow.description
  }
}

const isSaving = ref(false)
const handleSave = () => {
  formRef.value?.validate(async errors => {
    if (!errors) {
      isSaving.value = true

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
  })
}

const updateWorkflow = async () => {
  const oldConfig: Workflow = JSON.parse(updateSjkUUID(props.workflow))

  let paramsJson = {
    name: formModel.procName,
    email: formModel.email,
    description: formModel.description,
    personId: formModel.personId,
    personName: personIdOptions.find(option => option.value === formModel.personId).label,
    projectId: formModel.projectId,
    projectName: projectIdOptions.find(option => option.value === formModel.projectId).label as string,
    dependencyProjectId: oldConfig.dependencyProjectId,
    dependencyProjectName: oldConfig.dependencyProjectName,
    dependencyWorkflowId: oldConfig.dependencyWorkflowId,
    dependencyWorkflowName: oldConfig.dependencyWorkflowName,
    schedulingMode: oldConfig.schedulingMode,
    crontab: oldConfig.crontab,
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
