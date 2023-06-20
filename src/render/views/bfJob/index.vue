<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-alert type="default" :show-icon="false">
        目前只能用于两张表皆是中台TBDS-hive表
      </n-alert>
      <n-card class="mt-2" :content-style="{paddingTop:0,paddingBottom:0}">
        <n-tabs type="line" animated>
          <n-tab-pane name="1" tab="简易模式">
            <n-form ref="formRef"
                    inline
                    :size="'small'"
                    :model="formModel"
                    :rules="rules"
                    label-placement="left"
            >
              <n-grid :cols="3" :x-gap="12">
                <n-form-item-gi label="表名" path="tableName">
                  <n-input v-model:value="formModel.tableName" placeholder="输入表名"
                           @keydown.enter.prevent
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
                      :options="personIdOptions" :consistent-menu-width="false"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="4" v-show="previewRef.length>0"> {{ previewRef }}</n-form-item-gi>
              </n-grid>
            </n-form>

          </n-tab-pane>
          <n-tab-pane name="2" tab="自定义模式">
            <n-form ref="formRef"
                    inline
                    :size="'small'"
                    :model="formModel"
                    :rules="rules"
                    label-placement="left"
            >
              <n-grid :cols="4" :x-gap="12">
                <n-form-item-gi :span="4" label="工作流名称" path="name">
                  <n-input v-model:value="formModel.name" placeholder="输入工作流名称"
                           @keydown.enter.prevent
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="来源表" path="sourceTable">
                  <n-select :size="'small'"
                            v-model:value="formModel.sourceTable"
                            :options="sourceTableOptions"
                            filterable
                            remote
                            @search="handleSourceTableSearch"
                            :consistent-menu-width="false"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="目标表" path="targetTable">
                  <n-select :size="'small'"
                            v-model:value="formModel.targetTable"
                            :options="targetTableOptions"
                            filterable
                            remote
                            @search="handleTargetTableSearch"
                            :consistent-menu-width="false"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="项目" path="projectId">
                  <n-select
                      v-model:value="formModel.projectId"
                      placeholder="选择项目"
                      :options="projectIdOptions"
                      filterable
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="责任人" path="personId">
                  <n-select
                      v-model:value="formModel.personId"
                      placeholder="选择责任人"
                      :options="personIdOptions"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="告警邮箱" path="email">
                  <n-input v-model:value="formModel.email" placeholder="输入告警邮箱" @keydown.enter.prevent/>
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="描述" path="description">
                  <n-input v-model:value="formModel.description" placeholder="输入描述"
                           @keydown.enter.prevent
                  />
                </n-form-item-gi>
              </n-grid>
            </n-form>
          </n-tab-pane>
        </n-tabs>

      </n-card>
      <n-space justify="center" align="center" class="mt-2">
        <n-button type="primary" class="w-28" @click="generate">生成</n-button>
        <n-button :disabled="resRef === ''" class="w-28" @click="copyText(resRef)">
          复制结果
        </n-button>
        <n-divider :vertical="true"/>
        <n-button type="primary" :disabled="resRef === ''" class="w-28" @click="addWorkFlow"
                  :loading="isLoading"
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
      <n-input
          class="mt-2"
          v-model:value="resRef"
          type="textarea"
          placeholder=""
          :autosize="{ minRows: 6, maxRows: 16 }"
      />
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {add_work_flow} from "@render/api/datacenter";
import {personIdOptions, projectIdOptions, projectIdOptionsUpdate} from "@render/typings/datacenterOptions";
import {copyText} from "@render/utils/common/clipboard";
import {buildBfJson} from "@render/utils/datacenter/bfJob";
import {getTablesOptions} from "@render/utils/datacenter/getTablesOptions";
import {FormInst, SelectGroupOption, SelectOption} from "naive-ui";
import {onMounted, ref, watch} from "vue";
import {QuestionCircleTwotone} from '@vicons/antd'

const sourceTableOptions = ref<Array<SelectOption | SelectGroupOption>>()
const targetTableOptions = ref<Array<SelectOption | SelectGroupOption>>()

onMounted(async () => {
  await projectIdOptionsUpdate()
  sourceTableOptions.value = await getTablesOptions('6')
  targetTableOptions.value = await getTablesOptions('6')
})

const formRef = ref<FormInst | null>(null);
const formModel = ref({
  name: '',
  sourceTable: '',
  targetTable: '',
  projectId: '',
  personId: '',
  email: '',
  description: '',
  tableName: ''
})

const previewRef = ref('')
watch(
    [() => formModel.value.projectId, () => formModel.value.tableName],
    async ([projectId, tableName]) => {
      const projectAbbr = (await find_by_project_id(projectId))?.projectAbbr || ''
      previewRef.value = `工作流名称：bf_${projectAbbr}_${tableName}`
      formModel.value.name = `bf_${projectAbbr}_${tableName}`
    }
)
const rules = {
  name: {
    required: true,
    trigger: ['input'],
    message: '请输入工作流名称'
  },
  sourceTable: {
    required: true,
    trigger: ['change'],
    message: '请输入来源表'
  },
  targetTable: {
    required: true,
    trigger: ['change'],
    message: '请输入目标表'
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
  },
  tableName: {
    required: true,
    trigger: ['input'],
    message: '请输入表名'
  }
}

const resRef = ref('');

const generate = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      resRef.value = JSON.stringify(await buildBfJson(formModel.value), null, 2)
    } else {
      console.log(errors)
    }
  })
}

const isLoading = ref(false)

const addWorkFlow = () => {
  isLoading.value = true
  add_work_flow(JSON.parse(resRef.value)).then((res) => {
    if (res.code == 200) {
      window.$message.success('备份任务创建成功')
    } else {
      window.$message.error(res.message)
    }
    isLoading.value = false
  })
}

const handleSourceTableSearch = async (query: string) => {
  sourceTableOptions.value = await getTablesOptions('6', query)
}

const handleTargetTableSearch = async (query: string) => {
  targetTableOptions.value = await getTablesOptions('6', query)
}
</script>


<style scoped>

</style>
