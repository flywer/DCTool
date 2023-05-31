<template>
  <n-scrollbar style="height: calc(100vh - 105px); padding-right: 10px" trigger="hover">
    <n-alert title="说明" type="default" :show-icon="false">
      对于相同结构的表，没有必要每次都建一遍质检任务，在这里粘贴一个原始新建的质检任务JSON，即可生成万用的同表结构的JSON，只需自己修改任务名
    </n-alert>
    <n-input
        style="margin-top: 10px"
        v-model:value="validJsonInputRef"
        type="textarea"
        placeholder="输入原始JSON"
        :clearable="true"
        @blur="getBaseInfo"
    />
    <n-card style="margin-top: 10px" :content-style="{paddingBottom:0}">
      <n-form
          ref="validJsonFormRef"
          inline
          :size="'small'"
          :model="validJsonFormModel"
          :rules="validJsonRules"
          label-placement="left"
      >
        <n-grid :cols="4" :x-gap="12">
          <n-form-item-gi :span="4" label="工作流名称" path="name">
            <n-input v-model:value="validJsonFormModel.name" placeholder="输入工作流名称"
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="项目" path="projectId">
            <n-select
                v-model:value="validJsonFormModel.projectId"
                placeholder="选择项目"
                :options="projectIdOptions"
                filterable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="责任人" path="personId">
            <n-select
                v-model:value="validJsonFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="告警邮箱" path="email">
            <n-input v-model:value="validJsonFormModel.email" placeholder="输入告警邮箱" @keydown.enter.prevent/>
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="描述" path="description">
            <n-input v-model:value="validJsonFormModel.description" placeholder="输入描述"
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>
    <n-space justify="center" align="center" style="margin-top: 10px">
      <n-button type="primary" style="width: 120px" @click="validJsonTrans">转换</n-button>
      <n-button :disabled="validJsonResRef === ''" style="width: 120px" @click="copyText(validJsonResRef)">
        复制结果
      </n-button>
      <n-divider :vertical="true"/>
      <n-button type="primary" :disabled="validJsonResRef === ''" style="width: 120px" @click="addWorkFlow"
                :loading="isLoading"
      >执行
      </n-button>
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-icon size="16">
            <QuestionCircleTwotone/>
          </n-icon>
        </template>
        直接在中台创建此任务
      </n-tooltip>
    </n-space>
    <n-input
        style="margin-top: 10px"
        v-model:value="validJsonResRef"
        type="textarea"
        placeholder=""
    />
  </n-scrollbar>
</template>

<script setup lang="ts">
import {add_work_flow, get_job_project_list, get_person_list} from "@render/api/datacenter";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {onMounted, ref} from "vue";
import {uuid} from "vue3-uuid";
import useClipboard from 'vue-clipboard3';
import {useMessage, FormInst} from 'naive-ui'
import pinyin from 'pinyin';
import {QuestionCircleTwotone} from '@vicons/antd'

const message = useMessage()

const {toClipboard} = useClipboard();

const copyText = async (text) => {
  await toClipboard(text);
  message.success('复制成功')
}

const validJsonInputRef = ref('');

const validJsonResRef = ref('');

const validJsonFormRef = ref<FormInst | null>(null);

const validJsonFormModel = ref({
  name: '',
  projectId: '',
  projectName: '',
  personId: '',
  personName: '',
  email: '',
  description: ''
})

const validJsonRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入工作流名称'
  },
  projectId: {
    required: true,
    trigger: ['blur', 'change'],
    message: '请选择项目'
  },
  personId: {
    required: true,
    trigger: ['blur', 'change'],
    message: '请选择责任人'
  }
}

const validJsonTrans = (e: MouseEvent) => {
  e.preventDefault()
  validJsonFormRef.value?.validate((errors) => {
    if (!errors) {
      let json1 = JSON.parse(validJsonInputRef.value)
      json1.name = validJsonFormModel.value.name;
      json1.projectId = validJsonFormModel.value.projectId
      json1.projectName = projectIdOptions.find(option => option.value === validJsonFormModel.value.projectId).label
      json1.personId = validJsonFormModel.value.personId
      json1.personName = personIdOptions.find(option => option.value === validJsonFormModel.value.personId).label
      json1.email = validJsonFormModel.value.email
      json1.description = validJsonFormModel.value.description

      // 去除多于属性的JSON对象
      const json = removeIds(json1)

      validJsonResRef.value = updateSjkUUID(json)
    } else {
      console.log(errors)
    }
  })

}

const getBaseInfo = () => {
  let json;
  try {
    json = JSON.parse(validJsonInputRef?.value);
    validJsonFormModel.value.name = json.name;
    validJsonFormModel.value.projectId = json.projectId.toString();
    validJsonFormModel.value.personId = json.personId;
    validJsonFormModel.value.email = json.email;
    validJsonFormModel.value.description = json.description;
  } catch (e) {
    console.error(`解析 JSON 失败：${json}`, e)
  }

}

const isLoading = ref(false)

const addWorkFlow = () => {
  isLoading.value = true
  add_work_flow(JSON.parse(validJsonResRef.value)).then((res) => {
    if (res.code == 200) {
      message.success(res.message)
    } else {
      message.error(res.message)
    }
    isLoading.value = false
  })
}

</script>

<style scoped>

</style>
