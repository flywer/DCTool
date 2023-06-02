<template>
  <n-scrollbar style="height: calc(100vh - 105px); padding-right: 10px" trigger="hover">
    <n-alert title="说明" type="default" :show-icon="false">
      入主题库的入库任务生成
    </n-alert>
    <n-card style="margin-top: 10px;" :content-style="{paddingTop:0,paddingBottom:0}">
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
            <n-grid :cols="2" :x-gap="12">
              <n-form-item-gi :span="4" label="工作流名称" path="name">
                <n-input v-model:value="formModel.name" placeholder="输入工作流名称"
                         @keydown.enter.prevent
                />
              </n-form-item-gi>
              <n-form-item-gi label="项目" path="projectId">
                <n-select
                    v-model:value="formModel.projectId"
                    placeholder="选择项目"
                    :options="projectIdOptions"
                    filterable
                />
              </n-form-item-gi>
              <n-form-item-gi label="责任人" path="personId">
                <n-select
                    v-model:value="formModel.personId"
                    placeholder="选择责任人"
                    :options="personIdOptions"
                />
              </n-form-item-gi>
              <n-form-item-gi label="告警邮箱" path="email">
                <n-input v-model:value="formModel.email" placeholder="输入告警邮箱" @keydown.enter.prevent/>
              </n-form-item-gi>
              <n-form-item-gi label="描述" path="description">
                <n-input v-model:value="formModel.description" placeholder="输入描述"
                         @keydown.enter.prevent
                />
              </n-form-item-gi>
              <n-form-item-gi label="来源表" path="sourceDataSourceId">
                <n-select :size="'small'"
                          v-model:value="formModel.sourceDataSourceId"
                          :options="datasourceOptions"
                          @update:value="getSourceTables('')"
                />
              </n-form-item-gi>
              <n-form-item-gi label="表名" path="sourceTableName">
                <n-select :size="'small'"
                          v-model:value="formModel.sourceTableName"
                          :options="sourceTableOptions"
                          filterable
                          remote
                          :consistent-menu-width="false"
                          @search="getSourceTables"
                />
              </n-form-item-gi>
              <n-form-item-gi label="目标表" path="targetDataSourceId">
                <n-select :size="'small'"
                          v-model:value="formModel.targetDataSourceId"
                          :default-value="6"
                          :options="datasourceOptions"
                          @update:value="getTargetTables('')"
                />
              </n-form-item-gi>
              <n-form-item-gi label="表名" path="targetTableName">
                <n-select :size="'small'"
                          v-model:value="formModel.targetTableName"
                          :options="targetTableOptions"
                          filterable
                          remote
                          :consistent-menu-width="false"
                          @search="getTargetTables"
                />
              </n-form-item-gi>
            </n-grid>

          </n-form>
        </n-tab-pane>
      </n-tabs>
    </n-card>
    <n-space justify="center" align="center" style="margin-top: 10px">
      <n-checkbox v-model:checked="removeIdCheckRef">
        去除id字段
      </n-checkbox>
      <n-checkbox v-model:checked="removeDiffCheckRef">
        去除不同名称字段
      </n-checkbox>
      <n-divider :vertical="true"/>
      <n-button type="primary" style="width: 120px" @click="generateSql" :loading="isGenerating">SQL生成</n-button>
      <n-button :disabled="insertSqlRef === ''" style="width: 120px" @click="copyText(insertSqlRef)">
        复制结果
      </n-button>
    </n-space>
    <n-input
        v-model:value="insertSqlRef"
        type="textarea"
        placeholder=""
        style="margin-top: 10px"
        readonly
    />
    <n-space justify="center" align="center" style="margin-top: 10px">
      <n-button type="primary" :disabled="insertSqlRef === ''" style="width: 120px" @click="addWorkFlow"
                :loading="isLoading"
      >
        执行
      </n-button>
    </n-space>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {add_work_flow, get_columns, get_tables} from "@render/api/datacenter";
import {datasourceOptions, personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {findCommonElements} from "@render/utils/datacenter/findCommonElements";
import {getTablesOptions} from "@render/utils/datacenter/getTablesOptions";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";
import {FormInst, SelectGroupOption, SelectOption, useMessage} from "naive-ui";
import {ref, watch} from 'vue'
import {format} from 'sql-formatter';
import useClipboard from "vue-clipboard3";

const message = useMessage()

const {toClipboard} = useClipboard();

const copyText = async (text) => {
  await toClipboard(text);
  message.success('复制成功')
}

const sourceTableOptions = ref<Array<SelectOption | SelectGroupOption>>()

const targetTableOptions = ref<Array<SelectOption | SelectGroupOption>>()

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
    trigger: ['blur', 'input'],
    message: '请输入工作流名称'
  },
  projectId: {
    key: 'table',
    required: true,
    trigger: ['blur', 'change'],
    message: '请选择项目'
  },
  personId: {
    required: true,
    trigger: ['blur', 'change'],
    message: '请选择责任人'
  },
  sourceDataSourceId: {
    key: 'table',
    required: true,
    trigger: ['blur', 'input'],
    message: '请选择来源库'
  },
  sourceTableName: {
    key: 'table',
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入来源表'
  },
  targetDataSourceId: {
    key: 'table',
    required: true,
    trigger: ['blur', 'input'],
    message: '请选择目标库'
  },
  targetTableName: {
    key: 'table',
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入目标表'
  },
  tableName: {
    key: 'table',
    required: true,
    trigger: ['blur', 'input'],
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
      formModel.value.targetTableName = `sztk_${tableName}`
      previewRef.value = `工作流名称：rk_${projectAbbr}_${tableName}，来源表：${formModel.value.sourceTableName}，目标表：${formModel.value.targetTableName}`

    }
)

const getSourceTables = async (query?:string) => {
  sourceTableOptions.value = await getTablesOptions(formModel.value.sourceDataSourceId, query)
}
const getTargetTables = async (query?:string) => {
  targetTableOptions.value = await getTablesOptions(formModel.value.targetDataSourceId, query)
}

const removeIdCheckRef = ref(true)
const removeDiffCheckRef = ref(true)

const insertSqlRef = ref('')
const isGenerating = ref(false)

const generateSql = () => {

  isGenerating.value = true

  if (formModel.value.sourceDataSourceId.length < 1) {
    formModel.value.sourceDataSourceId = '6'
  }
  if (formModel.value.targetDataSourceId.length < 1) {
    formModel.value.targetDataSourceId = '8'
  }

  formRef.value?.validate(
      async (errors) => {
        if (!errors) {
          let sourceTableColumns = (await get_columns(formModel.value.sourceDataSourceId, formModel.value.sourceTableName,true))
          let targetTableColumns = (await get_columns(formModel.value.targetDataSourceId, formModel.value.targetTableName,true))
          if (removeIdCheckRef.value) {
            sourceTableColumns = sourceTableColumns.filter(c => c !== 'id')
            targetTableColumns = targetTableColumns.filter(c => c !== 'id')
          }
          if (removeDiffCheckRef.value) {
            const elements = findCommonElements(sourceTableColumns, targetTableColumns);
            sourceTableColumns = elements.commonArr1
            targetTableColumns = elements.commonArr2
          }

          insertSqlRef.value = format(`INSERT INTO ${formModel.value.targetTableName} (${targetTableColumns.join(',')})
                                       SELECT ${sourceTableColumns.join(',')}
                                       FROM ${formModel.value.sourceTableName}`, {language: 'mysql'})
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

// 合并两数组，只取共有元素
const intersectArrays = <T>(a: T[], b: T[]): (string | T)[] => {
  const setA = new Set(a);
  const setB = new Set(b);
  return [...setA].filter(x => setB.has(x));
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
  code: 'sjk07f499ef4b934d79ae56629a061b699e',
  modelXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:flowable=\"http://flowable.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.flowable.org/processdef\" exporter=\"Flowable Open Source Modeler\" exporterVersion=\"6.7.2\">\n    <process id=\"sjk07f499ef4b934d79ae56629a061b699e\" name=\"sjk07f499ef4b934d79ae56629a061b699e\" isExecutable=\"true\">\n        <startEvent id=\"sjkc233d8c7359c461d89a6f4f83ceb77f7\" name=\"开始\" flowable:formFieldValidation=\"true\"/>\n        <userTask id=\"sjkf3fc13bd07f545f0a386877d5302f525\" name=\"数据开发(Spark SQL)\" flowable:formFieldValidation=\"true\">\n            <extensionElements>\n                <flowable:taskListener event=\"create\" delegateExpression=\"${dataDevSpTaskListener}\"/>\n            </extensionElements>\n        </userTask>\n        <endEvent id=\"sjk9c827209d3dc4818a253b7aad07389e8\" name=\"结束\"/>\n        <sequenceFlow id=\"sjk27cb39ec79244ef9a1027ce58c9fed06\" name=\"TDBS-Hive\" sourceRef=\"sjkc233d8c7359c461d89a6f4f83ceb77f7\" targetRef=\"sjkf3fc13bd07f545f0a386877d5302f525\"/>\n        <sequenceFlow id=\"sjk190be68c0ab2414da5c1d58baf493f07\" name=\"MySQL\" sourceRef=\"sjkf3fc13bd07f545f0a386877d5302f525\" targetRef=\"sjk9c827209d3dc4818a253b7aad07389e8\"/>\n    </process>\n</definitions>",
  modelJson: "{\"nodeList\":[{\"id\":\"sjkc233d8c7359c461d89a6f4f83ceb77f7\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/ea223490b8676e353d40480c6b4d6de4.svg\",\"size\":\"20\",\"type\":\"startProcess\",\"name\":\"开始\"},{\"id\":\"sjk84954b619bad4ebaac32323abefea6eb\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/f2bdf916796f505f3e63a2add285467a.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"TDBS-Hive\",\"name\":\"TDBS-Hive\",\"databaseName\":6,\"tableName\":\"sourceTable\"},{\"id\":\"sjk5db9e53230de434dae1f70247d425daa\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/3d8232390940992d1515b8af2150bbc4.svg\",\"size\":\"20\",\"type\":\"database\",\"database\":\"MySQL\",\"name\":\"MySQL\",\"databaseName\":8,\"tableName\":\"targetTable\"},{\"id\":\"sjkf3fc13bd07f545f0a386877d5302f525\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/71f2f583f082a8d659c9336cab5dc360.svg\",\"size\":\"20\",\"delegateExpression\":\"dataDevSpTaskListener\",\"type\":\"component\",\"name\":\"数据开发(Spark SQL)\",\"taskType\":\"TDBS-Hive\"},{\"id\":\"sjk9c827209d3dc4818a253b7aad07389e8\",\"shape\":\"image\",\"image\":\"/szrzyt/data_center/tdbs-dev/fc24a27468b1b125d7cf415739058b41.svg\",\"size\":\"20\",\"type\":\"endProcess\",\"name\":\"结束\"}],\"edgesList\":[{\"from\":\"sjkc233d8c7359c461d89a6f4f83ceb77f7\",\"to\":\"sjk84954b619bad4ebaac32323abefea6eb\",\"id\":\"sjkdb1de0a2d7a44c5d8077488e9aeb9a74\"},{\"from\":\"sjk84954b619bad4ebaac32323abefea6eb\",\"to\":\"sjkf3fc13bd07f545f0a386877d5302f525\",\"id\":\"sjk27cb39ec79244ef9a1027ce58c9fed06\"},{\"from\":\"sjkf3fc13bd07f545f0a386877d5302f525\",\"to\":\"sjk5db9e53230de434dae1f70247d425daa\",\"id\":\"sjkaea574ab40654d148a0e402b926904aa\"},{\"from\":\"sjk5db9e53230de434dae1f70247d425daa\",\"to\":\"sjk9c827209d3dc4818a253b7aad07389e8\",\"id\":\"sjk190be68c0ab2414da5c1d58baf493f07\"}]}",
  dataDevBizVo: {
    dataSyncDtoList: [],
    qualityInspectionDtoList: [],
    sparkSqlDtoList: [
      {
        taskType: "TDBS-HIVE2MYSQL",
        sourceDBId: [],
        targetDBId: '',
        sql: "",
        sourceTable: [
          ""
        ],
        targetTable: "",
        sparkConfig: {
          saveMode: "overwrite"
        },
        taskInfoDto: {
          taskDefKey: "sjkf3fc13bd07f545f0a386877d5302f525"
        },
        id: "sjkf3fc13bd07f545f0a386877d5302f525"
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

          add_work_flow(paramsModel).then((res) => {
            if (res.code == 200) {
              message.success(res.message)
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
