<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 165px);" trigger="hover">
    <n-card :content-style="{paddingBottom:0}">
      <n-form ref="formRef"
              inline
              :size="'small'"
              :model="formModel"
              :rules="rules"
              label-placement="left"
      >
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi label="质检模板">
            <n-select
                v-model:value="selectedTemplateId"
                placeholder="选择质检模板"
                :options="jobTemplateOptions"
                :consistent-menu-width="false"
                filterable
                @update:value="handleTemplateUpdate"
            />
          </n-form-item-gi>
          <n-form-item-gi label="结构表" path="structTableId">
            <n-select
                :disabled="!selectedTemplateId"
                v-model:value="formModel.structTableId"
                placeholder="选择结构表"
                :options="tableNameOptions"
                :consistent-menu-width="false"
                filterable
                :loading="tableSelectLoading"
            />
          </n-form-item-gi>
          <n-form-item-gi label="项目" path="projectId">
            <n-select
                v-model:value="formModel.projectId"
                placeholder="选择项目"
                :options="projectIdOptions"
                :consistent-menu-width="false"
                filterable
            />
          </n-form-item-gi>
          <n-form-item-gi label="责任人" path="personId">
            <n-select
                v-model:value="formModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" class="w-28" @click="generate" :loading="isGenerating">生成</n-button>
      <n-button :disabled="!saveModel" class="w-28" @click="copyText(JSON.stringify(saveModel))">
        复制结果
      </n-button>
      <n-divider :vertical="true"/>
      <n-button type="primary" :disabled="!saveModel" class="w-28" @click="addWorkFlow"
                :loading="isAdding"
      >
        执行
      </n-button>
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-icon size="16" style="line-height: 32px">
            <QuestionCircleTwotone/>
          </n-icon>
        </template>
        直接在中台创建此任务
      </n-tooltip>
    </n-space>

    <n-scrollbar style="height: calc(100vh - 350px)">
      <code-mirror
          v-model="saveModelJsonStr"
          class="mt-2"
          :wrap="true"
          :extensions="[basicSetup,xcodeLight,json()]"
      />
    </n-scrollbar>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {json} from "@codemirror/lang-json";
import {sql} from "@codemirror/lang-sql";
import {find_job_template} from "@render/api/auxiliaryDb/jobTemplate.api";
import {find_template_struct_table} from "@render/api/auxiliaryDb/templateStructTable.api";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {copyText} from "@render/utils/common/clipboard";
import {workflowJobNameExist} from "@render/utils/datacenter/jobNameExist";
import {ZjJobSaveModel} from "@render/utils/datacenter/workflow/ZjJobSaveModel";
import {xcodeLight} from "@uiw/codemirror-theme-xcode";
import {basicSetup} from "codemirror";
import {FormInst, SelectOption} from "naive-ui";
import {onMounted, ref} from "vue";
import {QuestionCircleTwotone} from '@vicons/antd'
import CodeMirror from "vue-codemirror6";

onMounted(async () => {
  await jobTemplateOptionsInit()
})

const jobTemplateOptions = ref<Array<SelectOption>>()
const selectedTemplateId = ref()

const jobTemplateOptionsInit = async () => {
  jobTemplateOptions.value = (await find_job_template({templateType: 1})).map(v => ({
    label: v.templateName,
    value: v.id.toString()
  }))
}

const tableSelectLoading = ref(false)
const handleTemplateUpdate = async (templateId: string) => {
  formModel.value.structTableId = null
  tableNameOptions.value = []

  tableSelectLoading.value = true

  const tables = await find_template_struct_table({
    templateId: parseInt(templateId)
  })

  tableNameOptions.value = tables.map(v => ({
    label: v.tableName,
    value: v.id.toString()
  }))

  tableSelectLoading.value = false
}

const tableNameOptions = ref<Array<SelectOption>>()

const formRef = ref<FormInst | null>(null);
const formModel = ref({
  structTableId: '',
  personId: '',
  projectId: '',
})
const rules = {
  structTableId: {
    required: true,
    trigger: ['change'],
    message: '请选择结构表'
  },
  projectId: {
    required: true,
    trigger: ['change'],
    message: '请选择项目'
  },
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}
const saveModel = ref<ZjJobSaveModel>()
const saveModelJsonStr = ref('')

const isGenerating = ref(false)
const generate = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      isGenerating.value = true

      // 结构表名
      const tableName = (tableNameOptions.value.find(item => item.value === formModel.value.structTableId).label as string).toLowerCase()

      const {
        projectAbbr,
        tableAbbr
      } = (await find_by_project_id(formModel.value.projectId))

      saveModel.value = new ZjJobSaveModel(`zj_${projectAbbr}_${tableName}`, '', '')
      await saveModel.value.setTableFieldRules(parseInt(formModel.value.structTableId))
      saveModel.value.setPerson(formModel.value.personId)
      saveModel.value.setProject(formModel.value.projectId)
      saveModel.value.setGlobalVariable({
        project: tableAbbr,
        tableName: tableName
      })

      saveModelJsonStr.value = JSON.stringify(saveModel.value, null, 2)

      isGenerating.value = false
    }
  })
}

const isAdding = ref(false)

const addWorkFlow = async () => {
  isAdding.value = true
  if (await workflowJobNameExist(saveModel.value.name)) {
    window.$dialog.warning({
      title: '警告',
      content: `检测到[${saveModel.value.name}]任务名已存在，是否继续创建？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await saveModel.value.createZjJob()
        isAdding.value = false
      },
      onAfterLeave: () => {
        isAdding.value = false
      }
    })
  } else {
    await saveModel.value.createZjJob()
    isAdding.value = false
  }
}

</script>

<style scoped>

</style>
