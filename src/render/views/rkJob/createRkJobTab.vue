<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-card :content-style="{paddingBottom:0}">
        <n-form ref="formRef"
                inline
                :size="'small'"
                :model="formModel"
                :rules="rules"
                label-placement="left"
        >
          <n-grid :cols="2" :x-gap="12">
            <n-form-item-gi label="数据类型" path="dataType">
              <n-radio-group v-model:value="formModel.dataType">
                <n-radio-button
                    :key="1"
                    :value="1"
                    label="基础数据"
                />
                <n-radio-button
                    :key="2"
                    :value="2"
                    label="行为数据"
                />
              </n-radio-group>
            </n-form-item-gi>

            <n-form-item-gi label="表名" path="tableName">
              <n-input v-model:value="formModel.tableName" placeholder="输入表名"
                       @keydown.enter.prevent
              />
            </n-form-item-gi>

            <n-form-item-gi label="来源库" path="sourceDataSourceId">
              <n-select
                  v-model:value="formModel.sourceDataSourceId"
                  :options="datasourceOptions"
                  :size="'small'"
                  disabled
              />
            </n-form-item-gi>

            <n-form-item-gi label="目标库" path="targetDataSourceId">
              <n-select
                  v-model:value="formModel.targetDataSourceId"
                  :options="datasourceOptions"
                  :size="'small'"
                  disabled
              />
            </n-form-item-gi>

            <n-form-item-gi label="项目" path="projectId">
              <n-select
                  v-model:value="formModel.projectId"
                  placeholder="选择项目"
                  :options="projectIdOptions"
                  :consistent-menu-width="false"
                  filterable
                  :disabled="formModel.dataType===2"
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
            <n-form-item-gi :span="4" v-show="previewRef.length>0"> {{ previewRef }}</n-form-item-gi>
          </n-grid>
        </n-form>
      </n-card>

      <n-space justify="center" align="center" class="mt-2">
        <n-checkbox v-model:checked="removeIdCheckRef">
          去除id字段
        </n-checkbox>
        <n-checkbox v-model:checked="removeDiffCheckRef">
          去除不同名称字段
        </n-checkbox>
        <n-divider :vertical="true"/>
        <n-button type="primary" class="w-28" @click="buildJson" :loading="isGenerating">SQL生成</n-button>
        <n-button :disabled="insertSqlRef === ''" class="w-28" @click="copyText(insertSqlRef)">
          复制结果
        </n-button>
        <n-divider :vertical="true"/>
        <n-button
            type="primary"
            :disabled="insertSqlRef === ''"
            class="w-28"
            @click="addWorkFlow"
            :loading="isLoading"
        >
          创建任务
        </n-button>
      </n-space>

      <n-input
          v-model:value="insertSqlRef"
          type="textarea"
          placeholder=""
          class="mt-2"
          readonly
          :autosize="{minRows:6,maxRows:18}"
      />

    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {add_work_flow} from "@render/api/datacenter";
import {datasourceOptions, personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {copyText} from "@render/utils/common/clipboard";
import {workflowJobNameExist} from "@render/utils/datacenter/jobNameExist";
import {buildRkJson} from "@render/utils/datacenter/rkJob";
import {FormInst} from "naive-ui";
import {ref, watch} from 'vue'

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  dataType: 1,
  name: '',
  projectId: '',
  personId: '',
  sourceDataSourceId: '6',
  sourceTableName: '',
  targetDataSourceId: '8',
  targetTableName: '',
  email: '',
  description: '',
  tableName: ''
})

const rules = {
  name: {
    required: true,
    trigger: ['input'],
    message: '请输入工作流名称'
  },
  projectId: {
    key: 'table',
    required: true,
    trigger: ['change'],
    message: '请选择项目'
  },
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  },
  sourceDataSourceId: {
    key: 'table',
    required: true,
    trigger: ['change'],
    message: '请选择来源库'
  },
  sourceTableName: {
    key: 'table',
    required: true,
    trigger: ['change'],
    message: '请选择来源表'
  },
  targetDataSourceId: {
    key: 'table',
    required: true,
    trigger: ['change'],
    message: '请选择目标库'
  },
  targetTableName: {
    key: 'table',
    required: true,
    trigger: ['change'],
    message: '请选择目标表'
  },
  tableName: {
    key: 'table',
    required: true,
    trigger: ['input'],
    message: '请输入表名'
  },
}

const previewRef = ref('')
watch(
    [() => formModel.value.projectId, () => formModel.value.tableName, () => formModel.value.dataType],
    async ([projectId, tableName, dataType]) => {
      tableName = tableName.toLowerCase()
      if (dataType == 1) {
        const project = (await find_by_project_id(projectId))
        formModel.value.name = `rk_${project?.projectAbbr || ''}_${tableName}`
        formModel.value.sourceTableName = `df_${project?.tableAbbr || ''}_${tableName}_dwb`
        formModel.value.targetDataSourceId = '8'
      } else {
        formModel.value.projectId = '26'
        const projectAbbr = (await find_by_project_id(formModel.value.projectId))?.projectAbbr || ''
        formModel.value.name = `rk_${projectAbbr}_${tableName}`
        formModel.value.sourceTableName = `sztk_${tableName}_dm`
        formModel.value.targetDataSourceId = '12'
      }
      formModel.value.targetTableName = `sztk_${tableName}`
      previewRef.value = `工作流名称：${formModel.value.name}，来源表：${formModel.value.sourceTableName}，目标表：${formModel.value.targetTableName}`
    }
)

const removeIdCheckRef = ref(true)
const removeDiffCheckRef = ref(true)

const paramsJsonRef = ref(null)
const insertSqlRef = ref('')
const isGenerating = ref(false)

const buildJson = () => {

  isGenerating.value = true

  if (formModel.value.sourceDataSourceId.length < 1) {
    formModel.value.sourceDataSourceId = '6'
  }
  if (formModel.value.targetDataSourceId.length < 1) {
    if (formModel.value.dataType == 1) { //是否为基础数据
      formModel.value.targetDataSourceId = '8' // 主题库
    } else {
      formModel.value.targetDataSourceId = '12' // 数据湖
    }
  }

  formRef.value?.validate(
      async (errors) => {
        if (!errors) {
          buildRkJson(formModel.value, removeIdCheckRef.value, removeDiffCheckRef.value)
              .then((res) => {
                paramsJsonRef.value = res
                insertSqlRef.value = res.dataDevBizVo.sparkSqlDtoList[0].sql
              })
              .finally(() => isGenerating.value = false)
        } else {
          console.error(errors)
        }
      },
      (rule) => {
        return rule?.key === 'table'
      }
  )
}

const isLoading = ref(false)

const addWorkFlow = () => {
  isLoading.value = true

  formRef.value?.validate(
      async (errors) => {
        if (!errors) {

          if (await workflowJobNameExist(paramsJsonRef.value.name)) {
            window.$dialog.warning({
              title: '警告',
              content: `检测到[${paramsJsonRef.value.name}]任务名已存在，是否继续创建？`,
              positiveText: '确定',
              negativeText: '取消',
              onPositiveClick: () => {
                addWorkflow2()
              },
              onAfterLeave: () => {
                isLoading.value = false
              }
            })
          } else {
            addWorkflow2()
          }

        } else {
          console.log(errors)
        }
      }
  ).catch(() => {
    isLoading.value = false
  })

}

const addWorkflow2 = () => {
  add_work_flow(paramsJsonRef.value).then((res) => {
    if (res.code == 200) {
      window.$message.success('入库任务创建成功')
    } else {
      window.$message.error(res.message)
    }
  }).finally(() => {
    isLoading.value = false
  })
}

</script>

<style scoped>

</style>
