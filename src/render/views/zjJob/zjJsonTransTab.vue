<template>
  <n-scrollbar style="height: calc(100vh - 105px); padding-right: 10px" trigger="hover">
    <n-alert type="default" :show-icon="false">
      针对于无法自动生成质检JSON的表使用，给出一个完整的质检任务JSON，配置选项，即可生成同表结构的JSON
    </n-alert>
    <n-input
        class="mt-2"
        v-model:value="validJsonInputRef"
        type="textarea"
        placeholder="输入原始JSON"
        :clearable="true"
        @change="getBaseInfo"
    />
    <n-card class="mt-2" :content-style="{paddingBottom:0}">
      <n-form
          ref="validJsonFormRef"
          inline
          :size="'small'"
          :model="formModel"
          :rules="validJsonRules"
          label-placement="left"
      >
        <n-grid :cols="4" :x-gap="12">
          <n-form-item-gi :span="2" label="工作流名称" path="name">
            <n-input v-model:value="formModel.name" placeholder="输入工作流名称"
                     @keydown.enter.prevent
                     :readonly="jobNameLockRef"
            >
              <template #suffix>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button text type="default" ghost
                              @click="jobNameLockRef = !jobNameLockRef"
                    >
                      <n-icon>
                        <LockOutlined v-show="jobNameLockRef"/>
                        <UnlockOutlined v-show="!jobNameLockRef"/>
                      </n-icon>
                    </n-button>
                  </template>
                  工作流名称是否跟随项目与表名变化
                </n-tooltip>
              </template>
            </n-input>
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="表名" path="tableName">
            <n-input v-model:value="formModel.tableName" placeholder=""
                     @keydown.enter.prevent
                     @update:value="onUpdateJobName"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="项目" path="projectId">
            <n-select
                v-model:value="formModel.projectId"
                placeholder="选择项目"
                :options="projectIdOptions"
                filterable
                @update:value="onUpdateJobName"
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
    </n-card>
    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" class="w-28" @click="validJsonTrans">转换</n-button>
      <n-button :disabled="validJsonResRef === ''" class="w-28" @click="copyText(validJsonResRef)">
        复制结果
      </n-button>
      <n-divider :vertical="true"/>
      <n-button type="primary" :disabled="validJsonResRef === ''" class="w-28" @click="addWorkFlow"
                :loading="isLoading"
      >执行
      </n-button>
      <div class="mt-1">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-icon size="16">
              <QuestionCircleTwotone/>
            </n-icon>
          </template>
          直接在中台创建此任务
        </n-tooltip>
      </div>

    </n-space>
    <n-input
        class="mb-2 mt-2"
        v-model:value="validJsonResRef"
        type="textarea"
        placeholder=""
        :autosize="{minRows:4,maxRows:10}"
    />
  </n-scrollbar>
</template>

<script setup lang="ts">
import {add_work_flow} from "@render/api/datacenter";
import {personIdOptions, projectIdOptions, projectIdOptionsUpdate} from "@render/typings/datacenterOptions";
import {isBasicTable} from "@render/utils/common/isBasicTable";
import {getAbbrByProId} from "@render/utils/datacenter/getAbbrByProId";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {onMounted, ref} from "vue";
import useClipboard from 'vue-clipboard3';
import {useMessage, FormInst} from 'naive-ui'
import {QuestionCircleTwotone} from '@vicons/antd'
import {LockOutlined, UnlockOutlined} from '@vicons/antd'

const message = useMessage()

const {toClipboard} = useClipboard();

const copyText = async (text) => {
  await toClipboard(text);
  message.success('复制成功')
}
onMounted(() => {
  projectIdOptionsUpdate()
})

const validJsonInputRef = ref('');

const validJsonResRef = ref('');

const validJsonFormRef = ref<FormInst | null>(null);

const formModel = ref({
  name: '',
  projectId: '',
  projectName: '',
  personId: '',
  personName: '',
  email: '',
  description: '',
  tableName: ''
})

const validJsonRules = {
  name: {
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
    message: '请选择责任人'
  }
}

const jobNameLockRef = ref(true)

const validJsonTrans = (e: MouseEvent) => {
  e.preventDefault()
  if (validJsonInputRef.value.length > 0) {
    validJsonFormRef.value?.validate(async (errors) => {
      if (!errors) {
        let paramJson = JSON.parse(validJsonInputRef.value)

        paramJson.name = formModel.value.name;
        paramJson.projectId = formModel.value.projectId
        paramJson.projectName = projectIdOptions.find(option => option.value === formModel.value.projectId).label
        paramJson.personId = formModel.value.personId
        paramJson.personName = personIdOptions.find(option => option.value === formModel.value.personId).label
        paramJson.email = formModel.value.email
        paramJson.description = formModel.value.description

        const oldSourceTableName = paramJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName
        const oldTableAbbr = oldSourceTableName.split('_')[1]
        const oldAimTableName = paramJson.dataDevBizVo.qualityInspectionDtoList[0].aimTableName
        const oldWrongTableName = paramJson.dataDevBizVo.qualityInspectionDtoList[0].wrongTableName

        const {tableAbbr} = await getAbbrByProId(paramJson.projectId);

        const newSourceTableName = `di_${tableAbbr}_${formModel.value.tableName}_temp_ods`
        const newAimTableName = `di_${tableAbbr}_${formModel.value.tableName}_right_dwd`
        const newWrongTableName = `di_${tableAbbr}_${formModel.value.tableName}_error_dwd`

        paramJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName = newSourceTableName
        paramJson.dataDevBizVo.qualityInspectionDtoList[0].aimTableName = newAimTableName
        paramJson.dataDevBizVo.qualityInspectionDtoList[0].wrongTableName = newWrongTableName

        paramJson.modelJson = paramJson.modelJson.replaceAll(oldSourceTableName, newSourceTableName).replaceAll(oldAimTableName, newAimTableName).replaceAll(oldWrongTableName, newWrongTableName)

        paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList = paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.map(obj => {
              obj.field = obj.field.replace(oldSourceTableName, newSourceTableName);
              return obj
            }
        )

        //替换关联表里的表名，但关联的是基础数据的不用替换
        paramJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.forEach((field: any) => {
          field.ruleList.forEach((rule: any) => {
            if (rule.customSqlKey != undefined) {
              rule.customSqlKey = rule.customSqlKey.replaceAll(oldTableAbbr, tableAbbr);
            }
            if (rule.fromTableDataTable != undefined && !isBasicTable(rule.fromTableDataTable)) {
              rule.fromTableDataTable = rule.fromTableDataTable.replaceAll(oldTableAbbr, tableAbbr);
              rule.fromTableField = rule.fromTableField.replaceAll(oldTableAbbr, tableAbbr);
            }
          });
        });

        // 去除多于属性的JSON对象
        const json = removeIds(paramJson)

        validJsonResRef.value = updateSjkUUID(json)
      } else {
        console.log(errors)
      }
    })
  } else {
    message.error('原始JSON不能为空')
  }

}

const getBaseInfo = () => {
  let json;
  try {
    json = JSON.parse(validJsonInputRef?.value);
    formModel.value.name = json.name;
    formModel.value.projectId = json.projectId.toString();
    formModel.value.personId = json.personId;
    formModel.value.email = json.email;
    formModel.value.description = json.description;
    formModel.value.tableName = json.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName.split('_')[2]
  } catch (e) {
    console.error(`解析 JSON 失败：${json}`, e)
  }

}

const onUpdateJobName = async () => {
  if (jobNameLockRef.value) {
    const {projectAbbr} = await getAbbrByProId(formModel.value.projectId);

    formModel.value.name = `zj_${projectAbbr}_${formModel.value.tableName}`
  }
}

const isLoading = ref(false)

const addWorkFlow = () => {
  isLoading.value = true
  add_work_flow(JSON.parse(validJsonResRef.value)).then((res) => {
    if (res.code == 200) {
      message.success('质检任务创建成功')
    } else {
      message.error(res.message)
    }
    isLoading.value = false
  })
}

</script>

<style scoped>

</style>
