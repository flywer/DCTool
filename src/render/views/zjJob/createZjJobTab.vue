<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
    <n-card class="mt-2" :content-style="{paddingBottom:0}">
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
      <n-button :disabled="jonJsonRef === ''" class="w-28" @click="copyText(jonJsonRef)">
        复制结果
      </n-button>
      <n-divider :vertical="true"/>
      <n-button type="primary" :disabled="jonJsonRef === ''" class="w-28" @click="addWorkFlow"
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

    <n-input
        class="mt-2"
        v-model:value="jonJsonRef"
        type="textarea"
        placeholder=""
        :autosize="{
        minRows: 6,
        maxRows: 20
      }"
    />
  </n-scrollbar>
</template>

<script setup lang="ts">
import {find_by_project_id, get_zj_json} from "@render/api/auxiliaryDb";
import {add_work_flow} from "@render/api/datacenter";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {copyText} from "@render/utils/common/clipboard";
import {getAbbrByProId} from "@render/utils/datacenter/getAbbrByProId";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {FormInst, SelectGroupOption, SelectOption} from "naive-ui";
import {onMounted, ref} from "vue";
import {QuestionCircleTwotone} from '@vicons/antd'

const tableNameOptions = ref<Array<SelectOption | SelectGroupOption>>()

const jonJsonRef = ref('')

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

onMounted(() => {
  get_zj_json().then((res) => {
    tableNameOptions.value = res?.filter(item => item.zjJson != null).map(
        (v => ({
          label: `${v.tableName}`,
          value: v.id.toString(),
          json: v.zjJson,
        }))
    ) || []
  })
})

const isGenerating = ref(false)

const generate = () => {
  isGenerating.value = true
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      let paramJson = JSON.parse(tableNameOptions.value.find(item => item.value === formModel.value.jobJsonId).json as string)
      let tableName = (tableNameOptions.value.find(item => item.value === formModel.value.jobJsonId).label as string).toLowerCase()

      const projectAbbr = (await find_by_project_id(formModel.value.projectId))?.projectAbbr || ''

      paramJson.name = `zj_${projectAbbr}_${tableName}`;
      paramJson.projectId = formModel.value.projectId
      paramJson.projectName = projectIdOptions.find(option => option.value === formModel.value.projectId).label
      paramJson.personId = formModel.value.personId
      paramJson.personName = personIdOptions.find(option => option.value === formModel.value.personId).label

      const {tableAbbr} = await getAbbrByProId(paramJson.projectId);

      paramJson = JSON.parse(JSON.stringify(paramJson).replaceAll('depart', tableAbbr))
      paramJson = JSON.parse(updateSjkUUID(removeIds(paramJson)))

      jonJsonRef.value = JSON.stringify(paramJson, null, 2)
    } else {
      console.log(errors)
    }
  }).finally(() => isGenerating.value = false)
}

const isAdding = ref(false)

const addWorkFlow = () => {
  isAdding.value = true
  add_work_flow(JSON.parse(jonJsonRef.value)).then((res) => {
    if (res.code == 200) {
      window.$message.success('质检任务创建成功')
    } else {
      window.$message.error(res.message)
    }
  }).finally(() => isAdding.value = false)
}
</script>

<style scoped>

</style>
