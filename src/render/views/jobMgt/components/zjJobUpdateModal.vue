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
      style="width: 370px"
  >
    <n-form
        class="mt-4"
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        :size="'small'"
    >
      <n-grid :cols="1">
        <n-form-item-gi :span="1" label="表名" path="tableName">
          <n-input
              v-model:value="formModel.tableName"
              readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="1" label="质检模板" path="structTableId">
          <n-select
              v-model:value="formModel.structTableId"
              placeholder="选择质检模板"
              :options="jobTemplateOptions"
              :consistent-menu-width="false"
              filterable
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #action>
      <n-button type="primary" :size="'small'" @click="onUpdateZjJob" :loading="isSaving">更新</n-button>
      <n-button :size="'small'" @click="_show=false">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {find_job_template} from "@render/api/auxiliaryDb/jobTemplate.api";
import {find_template_struct_table} from "@render/api/auxiliaryDb/templateStructTable.api";
import {ZjJobSaveModel} from "@render/utils/datacenter/workflow/ZjJobSaveModel";
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
    default: '质检规则更新'
  },
  jobId: {
    type: String,
    required: true,
    default: null
  },
  tableAbbr: {
    type: String,
    required: true,
    default: null
  },
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

const formRef = ref<FormInst | null>(null);
const formModel = ref({
  tableName: '',
  jobId: '',
  structTableId: null
})

const formRules = ref({
  structTableId: {
    required: true,
    trigger: ['change'],
    message: '请选择质检模板'
  },
})

const formModelInit = () => {
  formModel.value.jobId = props.jobId
  formModel.value.tableName = props.tableAbbr.toUpperCase()
  formModel.value.structTableId = null

  jobTemplateOptionsInit(formModel.value.tableName)
}

const modalReset = () => {

}

const jobTemplateOptions = ref<Array<SelectOption>>()

const jobTemplateOptionsInit = async (tableName: string) => {

  jobTemplateOptions.value = []

  const tables = await find_template_struct_table({
    tableName: tableName
  })

  for (const table of tables) {
    const template = (await find_job_template({id: table.templateId}))[0]
    jobTemplateOptions.value.push({
      label: `${template.templateName}-${tableName}`,
      value: table.id.toString()
    })
  }
}

const isSaving = ref(false)

const onUpdateZjJob = () => {
  formRef.value?.validate(errors => {
    if (!errors) {
      isSaving.value = true
      const model = new ZjJobSaveModel()
      model.updateJobFieldInspRules(formModel.value.jobId, formModel.value.structTableId).then(() => {
        _show.value = false
        emit('onAfterLeave')
      }).finally(() => isSaving.value = false)
    }
  })
}

</script>

<style scoped>

</style>
