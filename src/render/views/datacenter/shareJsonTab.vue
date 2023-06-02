<template>
  <n-scrollbar style="height: calc(100vh - 105px); padding-right: 10px" trigger="hover">
    <n-alert title="说明" type="default" :show-icon="false">
      共享采集任务生成
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
            <n-grid :cols="2" :x-gap="12">
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
              <n-form-item-gi :span="4" v-show="previewRef.length>0"> {{ previewRef }}</n-form-item-gi>
            </n-grid>
          </n-form>
        </n-tab-pane>
        <!-- <n-tab-pane name="2" tab="自定义模式"> </n-tab-pane>-->
      </n-tabs>
    </n-card>
    <n-space justify="center" align="center" style="margin-top: 10px">
      <n-button type="primary" style="width: 120px" @click="generate">采集JSON生成</n-button>
      <n-button :disabled="dataXJsonRef === ''" style="width: 120px" @click="copyText(dataXJsonRef)">
        复制结果
      </n-button>
    </n-space>

    <n-input
        v-model:value="dataXJsonRef"
        type="textarea"
        placeholder="采集任务JSON"
        style="margin-top: 10px"
        readonly
    />
    <n-space justify="center" align="center" style="margin-top: 10px">
      <!--      <n-checkbox v-model:checked="addSchedTaskCheckRef">
              生成同名调度任务JSON
            </n-checkbox>-->
      <n-button type="primary" style="width: 120px" :disabled="dataXJsonRef === ''" @click="createDataXJob"
                :loading="isCreatingDataXJob"
      >
        创建采集任务
      </n-button>
      <n-button :disabled="schedTaskJsonRef === ''" style="width: 120px" @click="copyText(schedTaskJsonRef)">
        复制结果
      </n-button>
    </n-space>

    <n-input
        v-model:value="schedTaskJsonRef"
        type="textarea"
        placeholder="调度任务JSON"
        style="margin-top: 10px"
    />
    <n-space justify="center" align="center" style="margin-top: 10px">
      <n-button type="primary" style="width: 120px" :disabled="schedTaskJsonRef === ''" @click="addSchedTask"
                :loading="isAddSchedTask"
      >
        创建调度任务
      </n-button>
    </n-space>
  </n-scrollbar>
</template>

<script lang="ts" setup>
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {add_datax_job, add_sched_task, build_datax_json, get_columns} from "@render/api/datacenter";
import {projectIdOptions} from "@render/typings/datacenterOptions";
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
      formModel.value.name = `gx_${projectAbbr}_${tableName}`
      formModel.value.sourceTableName = `sztk_${tableName}`
      formModel.value.targetTableName = `gdsztk_${tableName}`
      previewRef.value = `工作流名称：rk_${projectAbbr}_${tableName}，来源表：${formModel.value.sourceTableName}，目标表：${formModel.value.targetTableName}`

    }
)

const dataXJsonRef = ref('')
const schedTaskJsonRef = ref('')
// const addSchedTaskCheckRef = ref(true)
let paramsModel = {
  readerModel: {
    datasourceType: "mysql",
    datasourceId: '8',
    path: '',
    tableName: "",
    columns: []
  },
  writerModel: {
    datasourceType: "mysql",
    datasourceId: '11',
    fromTableName: '',
    preSql: '',
    columns: [],
    ftpColums: []
  },
  initReaderModel: [],
  initWriterModel: [],
  writerId: '11',
  readerId: '8',
  mappingType: 'the-same-row',
  path: '',
  dynamicPath: '',
  dynamicPathData: "[]",
  jobJson: {
    job: {
      content: [
        {
          reader: {
            parameter: {
              password: '',
              column: [],
              connection: [
                {
                  jdbcUrl: [],
                  table: []
                }
              ],
              splitPk: null,
              username: ''
            },
            name: ''
          },
          writer: {
            parameter: {
              postSql: null,
              password: '',
              column: [],
              connection: [
                {
                  jdbcUrl: [],
                  table: []
                }
              ],
              username: '',
              preSql: []
            },
            name: ''
          }
        }
      ],
      setting: {
        errorLimit: {
          record: 0,
          percentage: 0.02
        },
        speed: {
          byte: 10485760,
          channel: 3
        }
      }
    }
  },
  jobDesc: '',
  autoVerifyRecord: 0,
  gatherMethod: "1",
  incrementType: "0",
  projectId: '6',
  gatherSource: "业务系统库",
  subsystemName: "采集"
}

const generate = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      paramsModel.jobDesc = formModel.value.name
      paramsModel.projectId = formModel.value.projectId

      paramsModel.readerModel.tableName = formModel.value.sourceTableName
      // paramsModel.readerModel.datasourceId = formModel.value.sourceDataSourceId
      paramsModel.readerModel.columns = (await get_columns(paramsModel.readerModel.datasourceId, formModel.value.sourceTableName,true))

      paramsModel.writerModel.fromTableName = formModel.value.targetTableName
      paramsModel.writerModel.preSql = `truncate table ${formModel.value.targetTableName}`
      // paramsModel.writerModel.datasourceId = formModel.value.targetDataSourceId
      paramsModel.writerModel.columns = (await get_columns(paramsModel.writerModel.datasourceId, formModel.value.targetTableName,true))
      paramsModel.writerModel.ftpColums = Array(paramsModel.writerModel.columns.length).fill(0).map((_, index) => index)

      paramsModel.initReaderModel = paramsModel.readerModel.columns
      paramsModel.initWriterModel = paramsModel.writerModel.columns

      // paramsModel.readerId = formModel.value.sourceDataSourceId
      // paramsModel.writerId = formModel.value.targetDataSourceId

      let path = ''
      for (let i = 0; i < paramsModel.readerModel.columns.length; i++) {
        path += `M0,${72 + (48 * i)}.0 L100,${72 + (48 * i)}.0`
      }
      paramsModel.path = path

      let buildJson = {
        readerDatasourceId: paramsModel.readerId,
        readerTables: [paramsModel.readerModel.tableName],
        readerColumns: paramsModel.readerModel.columns,
        writerDatasourceId: paramsModel.writerId,
        writerTables: [paramsModel.writerModel.fromTableName],
        writerColumns: paramsModel.writerModel.columns,
        rdbmsReader: {},
        rdbmsWriter: {
          preSql: paramsModel.writerModel.preSql
        },
        subsystemName: "采集"
      }

      paramsModel.jobJson = await build_datax_json(buildJson)

      dataXJsonRef.value = JSON.stringify(paramsModel, null, 2)

    } else {
      console.error(errors)
    }
  })
}

const isCreatingDataXJob = ref(false)

const createDataXJob = async () => {
  isCreatingDataXJob.value = true
  await add_datax_job(paramsModel).then((async res => {
    if (res.code == 0) {
      message.success('采集任务创建成功')

      //  if (addSchedTaskCheckRef.value) {
      let SchedTaskJson = {
        jobType: "大数据采集",
        jobContent: paramsModel.jobDesc,
        glueType: "DATAX",
        projectId: paramsModel.projectId,
        jobCron: "* 10 2,14 ? * * *",
        jobDesc: paramsModel.jobDesc,
        jobGroup: 2,
        retry: 0,
        executorFailRetryCount: '0',
        jobTemplateId: res.data,
        subsystemName: "采集"
      }

      schedTaskJsonRef.value = JSON.stringify(SchedTaskJson, null, 2)

      //    }

    } else {
      message.error(res.msg)
    }
  })).finally(() => {
    isCreatingDataXJob.value = false
  })
}

const isAddSchedTask = ref(false)

const addSchedTask = async () => {
  isAddSchedTask.value = true
  await add_sched_task(JSON.parse(schedTaskJsonRef.value)).then(res => {
    if (res.code == 0) {
      message.success('调度任务创建成功')
    } else {
      message.error(res.msg)
    }
  }).finally(() => {
    isAddSchedTask.value = false
  })

}
</script>

<style scoped>

</style>
