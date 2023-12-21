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
          <n-form-item-gi :span="12" label="质检规则模板" path="structTableId">
            <n-select
                v-model:value="formModel.structTableId"
                placeholder="选择质检模板"
                :options="jobTemplateOptions"
                :consistent-menu-width="false"
                filterable
            />
          </n-form-item-gi>
        </n-grid>
      </n-card>
    </n-form>
    <n-space justify="end" class="mt-2">
      <n-button
          :size="'small'"
          @click="handleUpdateRules"
          :loading="isUpdating"
          :disabled="!formModel.structTableId"
      >
        更新规则
      </n-button>
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
import {find_job_template} from "@render/api/auxiliaryDb/jobTemplate.api";
import {
  find_job_rel_by_job_id,
  find_template_struct_table,
  save_struct_table_job_rel
} from "@render/api/auxiliaryDb/templateStructTable.api";
import {get_workflow, workflow_active} from "@render/api/datacenter.api";
import {ZjJobSaveModel} from "@render/utils/datacenter/workflow/ZjJobSaveModel";
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
  structTableId: null
})
const formRules = reactive({
  structTableId: {
    required: true,
    trigger: ['change'],
    message: '请选择质检规则模板'
  }
})

const hasTemplate = ref(false)

const formInit = async () => {
  const tableRel = await find_job_rel_by_job_id(props.workflow.id)
  hasTemplate.value = !!tableRel
  formModel.structTableId = tableRel?.structTableId.toString() || null

  await jobTemplateOptionsInit(props.workflow.procName.split('_')[2].toUpperCase())
}

const jobTemplateOptions = ref<Array<SelectOption>>()

const jobTemplateOptionsInit = async (tableName: string) => {

  jobTemplateOptions.value = []

  const tables = await find_template_struct_table({
    tableName: tableName
  })

  for (const table of tables) {
    const template = (await find_job_template({id: table.templateId}))[0]
    if (template) {
      jobTemplateOptions.value.push({
        label: `${template.templateName}-${tableName}`,
        value: table.id.toString()
      })
    }
  }
  jobTemplateOptions.value = jobTemplateOptions.value.sort((a, b) => {
    return a.label.toString().localeCompare(b.label.toString())
  })

}

const isSaving = ref(false)
const handleSave = () => {
  isSaving.value = true
  save_struct_table_job_rel(formModel.structTableId, props.workflow.id)
      .catch((error) => {
        console.error(error)
      })
      .finally(() => isSaving.value = false)
}

const isUpdating = ref(false)
const handleUpdateRules = () => {
  formRef.value?.validate(async errors => {
    if (!errors) {
      isUpdating.value = true

      const workflowStatus = props.workflow.status

      // 停用工作流
      await workflow_active({
        id: props.workflow.id,
        type: '02'
      })

      const model = new ZjJobSaveModel()
      model.updateJobFieldInspRules(props.workflow.id, formModel.structTableId, true, false)
          .then(async () => {
            if (workflowStatus == '1') {
              // 再启用工作流
              await workflow_active({
                id: props.workflow.id,
                type: '01'
              })
            }

            const newWorkflow: Workflow = (await get_workflow(props.workflow.id)).data
            emit('update:workflow', newWorkflow)
          })
          .finally(() => isUpdating.value = false)
    }
  })
}
</script>

<style scoped>

</style>
