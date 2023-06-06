<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 105px); " trigger="hover">
      <n-alert title="说明" type="default" :show-icon="false">
        共享采集任务生成
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
      <n-space justify="center" align="center" class="mt-2">
        <n-button type="primary" class="w-28" @click="generate">JSON生成</n-button>
        <n-button :disabled="dataXJsonRef === ''" class="w-28" @click="copyText(dataXJsonRef)">
          复制结果
        </n-button>
        <n-divider :vertical="true"/>
        <n-checkbox
            v-model:checked="addSchedTaskCheck"
            @updateChecked="onAddSchedTaskCheckUpdate"
        >
          同时创建调度任务
        </n-checkbox>
        <n-button type="primary" :disabled="dataXJsonRef === ''" class="w-28" @click="createDataXJob"
                  :loading="isLoading"
        >
          执行
        </n-button>
      </n-space>

      <n-input
          v-model:value="dataXJsonRef"
          type="textarea"
          placeholder="采集任务JSON"
          class="mt-2"
          readonly
      />
    </n-scrollbar>
  </n-layout>
  <n-modal
      v-model:show="showModalRef"
      :mask-closable="false"
      :closable="false"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      title="CRON表达式"
      :size="'medium'"
      positive-text="确认"
      negative-text="取消"
      @positive-click="onPositiveClick"
      @negative-click="onNegativeClick"
  >
    <n-form
        ref="cronFormRef"
        :model="cronFormModel"
        :rules="cronRules"
    >
      <n-grid :cols="7" :x-gap="4">
        <n-form-item-gi label="秒" path="sec" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="cronFormModel.sec" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi label="分" path="min" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="cronFormModel.min" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi label="时" path="hour" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="cronFormModel.hour" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi label="日" path="day" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="cronFormModel.day" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi label="月" path="month" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="cronFormModel.month" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi label="周" path="week" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="cronFormModel.week" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi label="年" path="year" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="cronFormModel.year" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </n-modal>
</template>

<script lang="ts" setup>
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {add_datax_job, add_sched_task, build_datax_json, get_columns} from "@render/api/datacenter";
import {projectIdOptions} from "@render/typings/datacenterOptions";
import {FormInst, useMessage, useNotification} from "naive-ui";
import {ref, watch} from "vue";
import useClipboard from "vue-clipboard3";

const message = useMessage()

const {toClipboard} = useClipboard();

const notification = useNotification()
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
    trigger: ['input'],
    message: '请选择来源库'
  },
  sourceTableName: {
    key: 'table',
    required: true,
    trigger: ['input'],
    message: '请输入来源表'
  },
  targetDataSourceId: {
    key: 'table',
    required: true,
    trigger: ['input'],
    message: '请选择目标库'
  },
  targetTableName: {
    key: 'table',
    required: true,
    trigger: ['input'],
    message: '请输入目标表'
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
      formModel.value.name = `gx_${projectAbbr}_${tableName}`
      formModel.value.sourceTableName = `sztk_${tableName}`
      formModel.value.targetTableName = `gdsztk_${tableName}`
      previewRef.value = `工作流名称：gx_${projectAbbr}_${tableName}，来源表：${formModel.value.sourceTableName}，目标表：${formModel.value.targetTableName}`

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
      paramsModel.readerModel.columns = (await get_columns(paramsModel.readerModel.datasourceId, formModel.value.sourceTableName, true))

      paramsModel.writerModel.fromTableName = formModel.value.targetTableName
      paramsModel.writerModel.preSql = `truncate table ${formModel.value.targetTableName}`
      // paramsModel.writerModel.datasourceId = formModel.value.targetDataSourceId
      paramsModel.writerModel.columns = (await get_columns(paramsModel.writerModel.datasourceId, formModel.value.targetTableName, true))
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

/*
const createDataXJob = async () => {
  isCreatingDataXJob.value = true
  await add_datax_job(paramsModel).then((async res => {
    if (res.code == 0) {
      message.success('共享任务创建成功')

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
*/

const isLoading = ref(false)

const addSchedTaskCheck = ref(false)

const showModalRef = ref(false)

const onAddSchedTaskCheckUpdate = (v) => {
  if (v) {
    showModalRef.value = true
  }
}

const cronFormRef = ref<FormInst | null>(null);

const cronFormModel = ref({
  sec: '*',
  min: '0',
  hour: '0,12',
  day: '?',
  month: '*',
  week: '*',
  year: '*'
})

const cronRules = {
  sec: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  min: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  hour: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  day: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  month: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  week: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  year: {
    required: true,
    trigger: ['input'],
    message: ''
  }
}

const onNegativeClick = () => {
  showModalRef.value = false
  cronFormRef.value.restoreValidation()
  addSchedTaskCheck.value = false
}

const onPositiveClick = () => {
  cronFormRef.value?.validate((errors) => {
    if (!errors) {
      showModalRef.value = false
    } else {
      console.log(errors)
    }
  })
}

//记录本次提交成功数
let submitCount = 0;
let jobTemplateId = null

const createDataXJob = () => {
  isLoading.value = true
  add_datax_job(paramsModel).then(async (res) => {
    if (res.code == 0 || (submitCount > 0 && res.msg == '任务名称不能相同')) {
      submitCount++;
      if (res.code == 0) {
        message.success('采集任务创建成功')
      }
      if (addSchedTaskCheck.value) {
        const {
          sec,
          min,
          hour,
          day,
          month,
          week,
          year
        } = cronFormModel.value;
        const cronString = `${sec} ${min} ${hour} ${day} ${month} ${week} ${year}`;

        let SchedTaskJson = {
          jobType: "大数据采集",
          jobContent: paramsModel.jobDesc,
          glueType: "DATAX",
          projectId: paramsModel.projectId,
          jobCron: cronString,
          jobDesc: paramsModel.jobDesc,
          jobGroup: 2,
          retry: 0,
          executorFailRetryCount: '0',
          jobTemplateId: jobTemplateId == null ? res.data : jobTemplateId,
          subsystemName: "采集"
        }

        // 第一次提交时初始化
        if (submitCount == 1) {
          jobTemplateId = res.data
        }

        await add_sched_task(SchedTaskJson).then(res => {
          if (res.code == 0) {
            message.success('调度任务创建成功')
          } else {
            notification.create({
              title: '调度任务创建失败',
              content: res.msg + '，请重新配置CRON表达式',
              type: "warning"
            })
            console.log(res)
          }
        })
      }
    } else {
      message.error(res.msg)
      console.log(res)
    }
    isLoading.value = false
  })
}

</script>

<style scoped>

</style>
