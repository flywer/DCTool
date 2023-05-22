<template>
  <n-scrollbar style="max-height: 400px;padding-right: 10px" trigger="hover">
    <n-alert title="说明" type="default" :show-icon="false">
      备份任务的写法基本相同，这里只需这个表单的信息即可生成对应的备份任务JSON<br>
      目前只能用于两张表皆是中台TBDS-hive表
    </n-alert>
    <n-card style="margin-top: 10px">
      <n-tabs type="line" animated>
        <n-tab-pane name="1" tab="简易模式">
          <n-form ref="formRef"
                  inline
                  :size="'small'"
                  :model="formModel"
                  :rules="rules"
                  label-placement="left"
          >
            <n-grid :cols="4" :x-gap="12">
              <n-form-item-gi :span="4" label="表名" path="tableName">
                <n-input v-model:value="formModel.tableName" placeholder="输入表名"
                         @keydown.enter.prevent
                />
              </n-form-item-gi>
              <n-form-item-gi :span="2" label="项目" path="projectId">
                <n-select
                    v-model:value="formModel.projectId"
                    placeholder="选择项目"
                    :options="projectIdOptions"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="2" label="责任人" path="personId">
                <n-select
                    v-model:value="formModel.personId"
                    placeholder="选择责任人"
                    :options="personIdOptions"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="4"> {{ previewRef }}</n-form-item-gi>

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
                <n-input v-model:value="formModel.sourceTable" placeholder="输入来源表"
                         @keydown.enter.prevent
                />
              </n-form-item-gi>
              <n-form-item-gi :span="2" label="目标表" path="targetTable">
                <n-input v-model:value="formModel.targetTable" placeholder="输入目标表"
                         @keydown.enter.prevent
                />
              </n-form-item-gi>
              <n-form-item-gi :span="2" label="项目" path="projectId">
                <n-select
                    v-model:value="formModel.projectId"
                    placeholder="选择项目"
                    :options="projectIdOptions"
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
    <n-space justify="center" style="margin-top: 10px">
      <n-button type="primary" style="width: 120px" @click="generate">生成</n-button>
      <n-button :disabled="resRef === ''" style="width: 120px" @click="copyText(resRef)">
        复制结果
      </n-button>
    </n-space>
    <n-input
        style="margin-top: 10px"
        v-model:value="resRef"
        type="textarea"
        placeholder=""
    />
  </n-scrollbar>
</template>

<script setup lang="ts">
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {FormInst, useMessage} from "naive-ui";
import {ref, watch} from "vue";
import useClipboard from "vue-clipboard3";

const message = useMessage()

const {toClipboard} = useClipboard();

const copyText = async (text) => {
  await toClipboard(text);
  message.success('复制成功')
}

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

const previewRef = ref(`工作流名称：bf_${projectIdOptions.find(option => option.value === formModel.value.projectId)?.abbr || ''}_${formModel.value.tableName}`)
watch(
    [() => formModel.value.projectId, () => formModel.value.tableName],
    ([projectId, tableName]) => {
      const abbr = projectIdOptions.find(option => option.value === projectId)?.abbr || ''
      previewRef.value = `工作流名称：bf_${abbr}_${tableName}`
      formModel.value.name = `bf_${abbr}_${tableName}`
    }
)
const rules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入工作流名称'
  },
  sourceTable: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入来源表'
  },
  targetTable: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入目标表'
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
  },
  tableName: {
    required: true,
    trigger: ['blur', 'change'],
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
  code: 'sjk1fb00bd9416d4e7197e8ae86e8bf63d1',
  modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjk1fb00bd9416d4e7197e8ae86e8bf63d1\" name=\"sjk1fb00bd9416d4e7197e8ae86e8bf63d1\" isExecutable=\"true\">\n        <userTask id=\"sjk89c53bb21e024d8c9e519d9618b952c2\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <startEvent id=\"sjk9c42698d659a430694464fea7835fa64\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <sequenceFlow id=\"sjka4489a6ba69248c6849d42b603a6682e\" name=\"TDBS-Hive\" sourceRef=\"sjk9c42698d659a430694464fea7835fa64\" targetRef=\"sjk89c53bb21e024d8c9e519d9618b952c2\"/>\n    </process>\n</definitions>",
  modelJson: "{\"nodeList\":[{\"id\":\"sjk89c53bb21e024d8c9e519d9618b952c2\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/71f2f583f082a8d659c9336cab5dc360.svg\",\"size\":\"20\",\"delegateExpression\":\"dataDevSpTaskListener\",\"type\":\"component\",\"name\":\"数据开发(Spark SQL)\",\"taskType\":\"TDBS-Hive\"},{\"id\":\"sjk76ddaa75a73944138b9a348a0324eda1\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"di_ssft_y3010_temp_ods\"},{\"id\":\"sjk9c42698d659a430694464fea7835fa64\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjk45661c9f444b40078cbd32c1c750a14f\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"di_ssft_y3010_ods\"}],\"edgesList\":[{\"from\":\"sjk9c42698d659a430694464fea7835fa64\",\"to\":\"sjk76ddaa75a73944138b9a348a0324eda1\",\"id\":\"sjk6b909ee0544449bfaf7dc8d76f219c9e\"},{\"from\":\"sjk76ddaa75a73944138b9a348a0324eda1\",\"to\":\"sjk89c53bb21e024d8c9e519d9618b952c2\",\"id\":\"sjka4489a6ba69248c6849d42b603a6682e\"},{\"from\":\"sjk89c53bb21e024d8c9e519d9618b952c2\",\"to\":\"sjk45661c9f444b40078cbd32c1c750a14f\",\"id\":\"sjk784bf7c778c144ab9ddf6b27e56c5599\"}]}",
  dataDevBizVo: {
    dataSyncDtoList: [],
    qualityInspectionDtoList: [],
    sparkSqlDtoList: [
      {
        taskInfoDto: {
          taskDefKey: "sjk89c53bb21e024d8c9e519d9618b952c2"
        },
        sparkConfig: {
          saveMode: "append"
        },
        sql: "",
        id: "sjk89c53bb21e024d8c9e519d9618b952c2",
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
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (formModel.value.sourceTable === '' || formModel.value.targetTable === '') {
        formModel.value.sourceTable = `di_${projectIdOptions.find(option => option.value === formModel.value.projectId)?.abbr}_${formModel.value.tableName}_temp_ods`
        formModel.value.targetTable = `di_${projectIdOptions.find(option => option.value === formModel.value.projectId)?.abbr}_${formModel.value.tableName}_ods`
      }
      outputModel = JSON.parse(updateSjkUUID(removeIds(outputModel)))

      outputModel.name = formModel.value.name
      outputModel.projectId = formModel.value.projectId
      outputModel.projectName = projectIdOptions.find(option => option.value === formModel.value.projectId).label
      outputModel.personId = formModel.value.personId
      outputModel.personName = personIdOptions.find(option => option.value === formModel.value.personId).label
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
</script>

<style scoped>

</style>
