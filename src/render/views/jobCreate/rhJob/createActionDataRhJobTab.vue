<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
    <n-card :content-style="{paddingBottom:0}">
      <n-form ref="formRef"
              inline
              :size="'small'"
              :model="formModel"
              :rules="rules"
              label-placement="left"
      >
        <n-grid :cols="3" :x-gap="12">
          <n-form-item-gi label="表名" path="jobJsonId">
            <n-select
                v-model:value="formModel.jobJsonId"
                placeholder="选择表名"
                :options="tableNameOptions"
                :consistent-menu-width="false"
                filterable
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
      <n-divider :vertical="true"/>
      <n-button class="w-28"
                type="primary"
                :disabled="singleTableJsonRef === '' && multiTableJsonRef===''"
                @click="addWorkFlow"
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

      <n-checkbox v-model:checked="jobDependencyCheckRef">
        是否将多表融合任务依赖于单表融合任务
      </n-checkbox>

    </n-space>

    <n-divider/>

    <n-grid :cols="2" :x-gap="24">
      <n-gi>
        单表融合JSON：
        <n-button class="w-28 float-right" :disabled="singleTableJsonRef === ''" @click="copyText(singleTableJsonRef)">
          复制结果
        </n-button>
        <n-input
            class="mt-2"
            v-model:value="singleTableJsonRef"
            type="textarea"
            placeholder=""
            :autosize="{ minRows: 6, maxRows: 19 }"
        />
      </n-gi>
      <n-gi>
        多表融合JSON：
        <n-button class="w-28 float-right" :disabled="multiTableJsonRef === ''" @click="copyText(multiTableJsonRef)">
          复制结果
        </n-button>
        <n-input
            class="mt-2"
            v-model:value="multiTableJsonRef"
            type="textarea"
            placeholder=""
            :autosize="{ minRows: 6,  maxRows: 19 }"
        />
      </n-gi>
    </n-grid>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {get_rh_json} from "@render/api/auxiliaryDb/jobJson.api";
import {add_work_flow} from "@render/api/datacenter.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {copyText} from "@render/utils/common/clipboard";
import {isBasicTable} from "@render/utils/common/isBasicTable";
import {workflowJobNameExist} from "@render/utils/datacenter/jobNameExist";
import {buildRh2Json, buildRhJson} from "@render/utils/datacenter/rhJob";
import {FormInst, SelectGroupOption, SelectOption} from "naive-ui";
import {ref, onMounted} from "vue";
import {QuestionCircleTwotone} from '@vicons/antd'

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  jobJsonId: '',
  personId: '',
  projectId: ''
})

const rules = {
  jobJsonId: {
    required: true,
    trigger: ['change'],
    message: '请选择表名'
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

const tableNameOptions = ref<Array<SelectOption | SelectGroupOption>>()

const jobDependencyCheckRef = ref(true)

onMounted(() => {
  get_rh_json().then((res) => {
    tableNameOptions.value = res?.filter((item: { tableName: string; }) => !isBasicTable(item.tableName)).map(
        ((v: { tableName: any; id: { toString: () => any; }; rh1Json: any; rh2Json: any; }) => ({
          label: `${v.tableName}`,
          value: v.id.toString(),
          rh1Json: v.rh1Json,
          rh2Json: v.rh2Json,
        }))
    ) || []
  })
})

const isGenerating = ref(false)

const singleTableJsonRef = ref('')
const multiTableJsonRef = ref('')

const generate = () => {
  isGenerating.value = true
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const rh1Json = JSON.parse(tableNameOptions.value.find(item => item.value === formModel.value.jobJsonId).rh1Json as string)
      // const rh2Json = JSON.parse(tableNameOptions.value.find(item => item.value === formModel.value.jobJsonId).rh2Json as string)
      const tableName = (tableNameOptions.value.find(item => item.value === formModel.value.jobJsonId).label as string).toLowerCase()

      if (rh1Json != null) {
        const singleTableJson = await buildRhJson({
          jobJsonId: formModel.value.jobJsonId,
          personId: formModel.value.personId,
          projectId: formModel.value.projectId,
          tableName: tableName
        }, rh1Json, false)

        singleTableJsonRef.value = JSON.stringify(singleTableJson, null, 2)
      } else {
        window.$message.warning("单表融合JSON为空")
      }

      const multiTableJson = await buildRh2Json({
        personId: formModel.value.personId,
        projectId: formModel.value.projectId,
        tableName: tableName
      })

      multiTableJsonRef.value = JSON.stringify(multiTableJson, null, 2)

    } else {
      console.error(errors)
    }
  }).finally(() => isGenerating.value = false)
}

const isAdding = ref(false)

const addWorkFlow = async () => {
  isAdding.value = true

  if (singleTableJsonRef.value.length > 0) {
    const paramsModel = JSON.parse(singleTableJsonRef.value)
    if (await workflowJobNameExist(paramsModel.name)) {
      window.$dialog.warning({
        title: '警告',
        content: `检测到[${paramsModel.name}]任务名已存在，是否继续创建？`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          addRh1Job(paramsModel)
        },
        onAfterLeave: () => {
          isAdding.value = false
        }
      })
    } else {
      addRh1Job(paramsModel)
    }
  }

}

const addRh1Job = (paramsModel: any) => {
  add_work_flow(paramsModel).then(async (res1) => {
    if (res1.code == 200) {
      window.$message.success('单表融合任务创建成功')

      if (multiTableJsonRef.value.length > 0) {
        if (jobDependencyCheckRef.value) {
          let multiTableJson = JSON.parse(multiTableJsonRef.value)
          multiTableJson.dependencyProjectId = formModel.value.projectId
          multiTableJson.dependencyProjectName = projectIdOptions.find(option => option.value === formModel.value.projectId).label as string
          multiTableJson.dependencyWorkflowId = res1.data.id as string
          multiTableJson.dependencyWorkflowName = res1.data.procName
          multiTableJson.schedulingMode = 1

          multiTableJsonRef.value = JSON.stringify(multiTableJson, null, 2)
        }

        const paramsModel2 = JSON.parse(multiTableJsonRef.value)
        if (await workflowJobNameExist(paramsModel2.name)) {
          window.$dialog.warning({
            title: '警告',
            content: `检测到[${paramsModel2.name}]任务名已存在，是否继续创建？`,
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: () => {
              addRh2Job(paramsModel2)
            },
            onAfterLeave: () => {
              isAdding.value = false
            }
          })
        } else {
          addRh2Job(paramsModel2)
        }

      }
    } else {
      window.$message.error(res1.message)
    }
  }).finally(() => isAdding.value = false)
}

const addRh2Job = (paramsModel: any) => {
  add_work_flow(paramsModel).then(res2 => {
    if (res2.code == 200) {
      window.$message.success('多表融合任务创建成功')
    } else {
      window.$message.error(res2.message)
    }
  })
}

</script>

<style scoped>

</style>
