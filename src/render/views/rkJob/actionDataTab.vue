<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-alert type="default" :show-icon="false">
        行为数据入主题库较为特殊，需先将数据插入到一个中台临时表里，再将此表覆写到主题库对应表<br>
        若此表不存在，则先创建 （sztk_表名缩写_dm）
      </n-alert>

      <n-card class="mt-2" :content-style="{paddingBottom:0}">
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
                  :options="personIdOptions"
                  :consistent-menu-width="false"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="4" v-show="previewRef.length>0"> {{ previewRef }}</n-form-item-gi>
          </n-grid>
        </n-form>
      </n-card>

      <n-space justify="center" align="center" class="mt-2">
        <n-button type="primary" class="w-28" @click="generateSql" :loading="isGenerating">SQL生成</n-button>
        <n-button :disabled="insertSqlRef === ''" class="w-28" @click="copyText(insertSqlRef)">
          复制结果
        </n-button>
      </n-space>

      <n-input
          v-model:value="insertSqlRef"
          type="textarea"
          placeholder=""
          class="mt-2"
          readonly
          :autosize="{minRows:5,maxRows:10}"
      />
      <n-space justify="center" align="center" class="mt-2">
        <n-button
            type="primary"
            :disabled="insertSqlRef === ''"
            class="w-28"
            @click="addWorkFlow"
            :loading="isLoading"
        >
          执行
        </n-button>
      </n-space>

    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {add_work_flow, get_columns} from "@render/api/datacenter";
import {datasourceOptions, personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {FormInst, SelectGroupOption, SelectOption, useMessage} from "naive-ui";
import {format} from "sql-formatter";
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
  projectId: '',
  personId: '',
  sourceDataSourceId: '',
  sourceTableName: '',
  targetDataSourceId: '',
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
    [() => formModel.value.projectId, () => formModel.value.tableName],
    async ([projectId, tableName]) => {
      const projectAbbr = (await find_by_project_id(projectId))?.projectAbbr || ''
      formModel.value.name = `rk_${projectAbbr}_${tableName}`
      formModel.value.sourceTableName = `df_${(await find_by_project_id(formModel.value.projectId))?.tableAbbr || ''}_${tableName}_dwb`
      formModel.value.targetTableName = `sztk_${tableName}_dm`
      previewRef.value = `工作流名称：rk_${projectAbbr}_${tableName}，来源表：${formModel.value.sourceTableName}，目标表：${formModel.value.targetTableName}`

    }
)

const insertSqlRef = ref('')
const isGenerating = ref(false)

const generateSql = () => {

  isGenerating.value = true

  if (formModel.value.sourceDataSourceId.length < 1) {
    formModel.value.sourceDataSourceId = '6'
  }
  if (formModel.value.targetDataSourceId.length < 1) {
    formModel.value.targetDataSourceId = '6'
  }

  formRef.value?.validate(
      async (errors) => {
        if (!errors) {
          let sourceTableColumns = (await get_columns(formModel.value.sourceDataSourceId, formModel.value.sourceTableName, true))
          let targetTableColumns = (await get_columns(formModel.value.targetDataSourceId, formModel.value.targetTableName, true))

          insertSqlRef.value = format(`INSERT INTO ${formModel.value.targetTableName} (${targetTableColumns.join(',')})
                                       SELECT ${sourceTableColumns.join(',')}
                                       FROM ${formModel.value.sourceTableName}`, {language: 'hive'})
        } else {
          console.error(errors)
        }
      },
      (rule) => {
        return rule?.key === 'table'
      }
  ).then(() => {
    isGenerating.value = false
  }).catch(() => {
    isGenerating.value = false
  })
}

let paramsModel = {
  name: '',
  email: '',
  description: '',
  personId: '',
  personName: '',
  projectId: '',
  projectName: "",
  crontab: "",
  type: "流程",
  code: 'sjka059ccb93a63410fa4a30b4a74aab76c',
  modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjka059ccb93a63410fa4a30b4a74aab76c\" name=\"sjka059ccb93a63410fa4a30b4a74aab76c\" isExecutable=\"true\">\n        <startEvent id=\"sjk9ab876ee181541339fd21d1eb4debc80\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjk3921a406dd9d4d2784f91adcce0f43f6\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjk73457987771545d2b31033bdaf026f5e\" name=\"结束\"/>\n        <sequenceFlow id=\"sjk420f647f61e845fc875d3b22a6f7d3c4\" name=\"TDBS-Hive\" sourceRef=\"sjk9ab876ee181541339fd21d1eb4debc80\" targetRef=\"sjk3921a406dd9d4d2784f91adcce0f43f6\"/>\n        <sequenceFlow id=\"sjk931a63b7510a457093865bac0f4877db\" name=\"TDBS-Hive\" sourceRef=\"sjk3921a406dd9d4d2784f91adcce0f43f6\" targetRef=\"sjk73457987771545d2b31033bdaf026f5e\"/>\n    </process>\n</definitions>",
  modelJson: "{\"nodeList\":[{\"id\":\"sjk9ab876ee181541339fd21d1eb4debc80\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjkaca56ce98baf464dbc29fcd7d7b08a09\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"sourceTable\"},{\"id\":\"sjk3921a406dd9d4d2784f91adcce0f43f6\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/71f2f583f082a8d659c9336cab5dc360.svg\",\"size\":\"20\",\"delegateExpression\":\"dataDevSpTaskListener\",\"type\":\"component\",\"name\":\"数据开发(Spark SQL)\",\"taskType\":\"TDBS-Hive\"},{\"id\":\"sjk1c76017aebb3493a9f58c35c2e7b53a5\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"targetTable\"},{\"id\":\"sjk73457987771545d2b31033bdaf026f5e\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/fc24a27468b1b125d7cf415739058b41.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjk9ab876ee181541339fd21d1eb4debc80\",\"to\":\"sjkaca56ce98baf464dbc29fcd7d7b08a09\",\"id\":\"sjkbfa14b3e945e4e01a43d57952a58f1bd\"},{\"from\":\"sjkaca56ce98baf464dbc29fcd7d7b08a09\",\"to\":\"sjk3921a406dd9d4d2784f91adcce0f43f6\",\"id\":\"sjk420f647f61e845fc875d3b22a6f7d3c4\"},{\"from\":\"sjk3921a406dd9d4d2784f91adcce0f43f6\",\"to\":\"sjk1c76017aebb3493a9f58c35c2e7b53a5\",\"id\":\"sjk6714e675a4034acf85b5d5f301d358a0\"},{\"from\":\"sjk1c76017aebb3493a9f58c35c2e7b53a5\",\"to\":\"sjk73457987771545d2b31033bdaf026f5e\",\"id\":\"sjk931a63b7510a457093865bac0f4877db\"}]}",
  dataDevBizVo: {
    dataSyncDtoList: [],
    qualityInspectionDtoList: [],
    sparkSqlDtoList: [
      {
        taskType: "TDBS-HIVE2TDBS-HIVE",
        sourceDBId: [],
        targetDBId: '6',
        sql: "",
        sourceTable: [
          ""
        ],
        targetTable: "",
        sparkConfig: {
          saveMode: "append"
        },
        taskInfoDto: {
          taskDefKey: "sjk3921a406dd9d4d2784f91adcce0f43f6"
        }
      }
    ],
    mySqlDtoList: [],
    postgreSqlDtoList: [],
    trinoSqlDtoList: [],
    conversionDtoList: []
  }
}

const isLoading = ref(false)

const addWorkFlow = () => {
  isLoading.value = true

  formRef.value?.validate(
      (errors) => {
        if (!errors) {

          paramsModel.modelJson = paramsModel.modelJson.replace(/sourceTable/g, `${formModel.value.sourceTableName}`).replace(/targetTable/g, `${formModel.value.targetTableName}`)

          paramsModel = JSON.parse(updateSjkUUID(removeIds(paramsModel)))

          paramsModel.name = formModel.value.name
          paramsModel.projectId = formModel.value.projectId
          paramsModel.projectName = projectIdOptions.find(option => option.value === formModel.value.projectId).label as string
          paramsModel.personId = formModel.value.personId
          paramsModel.personName = personIdOptions.find(option => option.value === formModel.value.personId).label as string
          paramsModel.email = formModel.value.email
          paramsModel.description = formModel.value.description

          const sourceDatasource = datasourceOptions.find(option => option.value === formModel.value.sourceDataSourceId).datasource as string;
          const targetDataSource = datasourceOptions.find(option => option.value === formModel.value.targetDataSourceId).datasource as string;
          paramsModel.dataDevBizVo.sparkSqlDtoList[0].taskType = `${sourceDatasource.toUpperCase()}2${targetDataSource.toUpperCase()}`

          paramsModel.dataDevBizVo.sparkSqlDtoList[0].sourceDBId = [`${formModel.value.sourceDataSourceId}`]
          paramsModel.dataDevBizVo.sparkSqlDtoList[0].targetDBId = formModel.value.targetDataSourceId
          paramsModel.dataDevBizVo.sparkSqlDtoList[0].sql = insertSqlRef.value
          paramsModel.dataDevBizVo.sparkSqlDtoList[0].sourceTable = [`${formModel.value.sourceTableName}`]
          paramsModel.dataDevBizVo.sparkSqlDtoList[0].targetTable = formModel.value.targetTableName

          console.log(paramsModel)

          add_work_flow(paramsModel).then((res) => {
            console.log(res)
            if (res.code == 200) {
              message.success('入库任务创建成功')
            } else {
              message.error(res.message)
            }
            isLoading.value = false
          }).catch(() => {
            isLoading.value = false
          })

        } else {
          console.log(errors)
        }
      }
  ).catch(() => {
    isLoading.value = false
  })

}


</script>

<style scoped>

</style>
