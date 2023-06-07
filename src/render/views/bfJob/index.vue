<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-alert  type="default" :show-icon="false">
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
            <n-icon size="16">
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
          :autosize="{
        minRows: 6,
        maxRows: 6
      }"
      />
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {add_work_flow} from "@render/api/datacenter";
import {personIdOptions, projectIdOptions, projectIdOptionsUpdate} from "@render/typings/datacenterOptions";
import {getTablesOptions} from "@render/utils/datacenter/getTablesOptions";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {FormInst, SelectGroupOption, SelectOption, useMessage} from "naive-ui";
import {onMounted, ref, watch} from "vue";
import useClipboard from "vue-clipboard3";
import {QuestionCircleTwotone} from '@vicons/antd'

const message = useMessage()

const {toClipboard} = useClipboard();

const copyText = async (text) => {
  await toClipboard(text);
  message.success('复制成功')
}

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

// 输出模型
let outputModel = {
  name: '',
  email: '',
  description: '',
  personId: '',
  personName: '',
  projectId: '',
  projectName: "",
  crontab: "",
  type: "流程",
  code: 'sjkeab27401755a4bc0b227dbe5a8d99f50',
  modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjkeab27401755a4bc0b227dbe5a8d99f50\" name=\"sjkeab27401755a4bc0b227dbe5a8d99f50\" isExecutable=\"true\">\n        <startEvent id=\"sjk0eb5bf28574d441097fc8cc2c17cdc3b\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjkf682c3b9355843e29a95df2246cca414\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjkf8ec68ef554b44b7b914b9663025eebf\" name=\"结束\"/>\n        <sequenceFlow id=\"sjka6d142d47f7b47b1a351d0672637bd4e\" name=\"TDBS-Hive\" sourceRef=\"sjk0eb5bf28574d441097fc8cc2c17cdc3b\" targetRef=\"sjkf682c3b9355843e29a95df2246cca414\"/>\n        <sequenceFlow id=\"sjke121d07d98f24c06a819f8e5d5e573f1\" name=\"TDBS-Hive\" sourceRef=\"sjkf682c3b9355843e29a95df2246cca414\" targetRef=\"sjkf8ec68ef554b44b7b914b9663025eebf\"/>\n    </process>\n</definitions>",
  modelJson: "{\"nodeList\":[{\"id\":\"sjk0eb5bf28574d441097fc8cc2c17cdc3b\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjk586b80b8921f42be8309e0ca5ef83a02\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"sourceTable\"},{\"id\":\"sjkf682c3b9355843e29a95df2246cca414\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/71f2f583f082a8d659c9336cab5dc360.svg\",\"size\":\"20\",\"delegateExpression\":\"dataDevSpTaskListener\",\"type\":\"component\",\"name\":\"数据开发(Spark SQL)\",\"taskType\":\"TDBS-Hive\"},{\"id\":\"sjk584dc87d1c4446709892adda78e9ce8f\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"targetTable\"},{\"id\":\"sjkf8ec68ef554b44b7b914b9663025eebf\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/fc24a27468b1b125d7cf415739058b41.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjk0eb5bf28574d441097fc8cc2c17cdc3b\",\"to\":\"sjk586b80b8921f42be8309e0ca5ef83a02\",\"id\":\"sjk14d15968054d4258b979bc3ae8924423\"},{\"from\":\"sjk586b80b8921f42be8309e0ca5ef83a02\",\"to\":\"sjkf682c3b9355843e29a95df2246cca414\",\"id\":\"sjka6d142d47f7b47b1a351d0672637bd4e\"},{\"from\":\"sjkf682c3b9355843e29a95df2246cca414\",\"to\":\"sjk584dc87d1c4446709892adda78e9ce8f\",\"id\":\"sjk5c93a040881a4f81a8d58f328d56ea61\"},{\"from\":\"sjk584dc87d1c4446709892adda78e9ce8f\",\"to\":\"sjkf8ec68ef554b44b7b914b9663025eebf\",\"id\":\"sjke121d07d98f24c06a819f8e5d5e573f1\"}]}",
  dataDevBizVo: {
    dataSyncDtoList: [],
    qualityInspectionDtoList: [],
    sparkSqlDtoList: [
      {
        taskInfoDto: {
          taskDefKey: "sjkf682c3b9355843e29a95df2246cca414"
        },
        sparkConfig: {
          saveMode: "append"
        },
        sql: "",
        id: "sjkf682c3b9355843e29a95df2246cca414",
        sourceDBId: [
          6
        ],
        sourceTable: [
          ""
        ],
        targetDBId: 6,
        targetTable: "",
        taskType: "TDBS-HIVE2TDBS-HIVE"
      }
    ],
    mySqlDtoList: [],
    postgreSqlDtoList: [],
    trinoSqlDtoList: [],
    conversionDtoList: []
  }
}

const generate = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      if (formModel.value.sourceTable === '' || formModel.value.targetTable === '') {
        formModel.value.sourceTable = `di_${(await find_by_project_id(formModel.value.projectId))?.tableAbbr}_${formModel.value.tableName}_temp_ods`
        formModel.value.targetTable = `di_${(await find_by_project_id(formModel.value.projectId))?.tableAbbr}_${formModel.value.tableName}_ods`
      }

      outputModel.modelJson = outputModel.modelJson.replace(/sourceTable/g, `${formModel.value.sourceTable}`).replace(/targetTable/g, `${formModel.value.targetTable}`)

      outputModel = JSON.parse(updateSjkUUID(removeIds(outputModel)))

      outputModel.name = formModel.value.name
      outputModel.projectId = formModel.value.projectId
      outputModel.projectName = projectIdOptions.find(option => option.value === formModel.value.projectId).label as string
      outputModel.personId = formModel.value.personId
      outputModel.personName = personIdOptions.find(option => option.value === formModel.value.personId).label as string
      outputModel.email = formModel.value.email
      outputModel.description = formModel.value.description

      outputModel.dataDevBizVo.sparkSqlDtoList[0].sql = `INSERT INTO ` + `${formModel.value.targetTable}` + ' SELECT * FROM ' + `${formModel.value.sourceTable}`
      outputModel.dataDevBizVo.sparkSqlDtoList[0].sourceTable = [`${formModel.value.sourceTable}`]
      outputModel.dataDevBizVo.sparkSqlDtoList[0].targetTable = formModel.value.targetTable

      resRef.value = JSON.stringify(outputModel, null, 2)
    } else {
      console.log(errors)
    }
  })
}

const isLoading = ref(false)

const addWorkFlow = () => {
  isLoading.value = true
  add_work_flow(outputModel).then((res) => {
    if (res.code == 200) {
      message.success('备份任务创建成功')
    } else {
      message.error(res.message)
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
