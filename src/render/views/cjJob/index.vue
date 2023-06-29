<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-card :content-style="{paddingBottom:0}">
        <n-form ref="formRef"
                inline
                :size="'small'"
                :model="formModel"
                :rules="rules"
                label-placement="left"
        >
          <n-grid :cols="5" :x-gap="12">
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
            <n-form-item-gi :span="1" label="表名" path="tableName">
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
                  :consistent-menu-width="false"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="来源库" path="sourceDataSourceId">
              <n-select
                  v-model:value="formModel.sourceDataSourceId"
                  :options="datasourceOptions"
                  :size="'small'"
                  disabled
              />
            </n-form-item-gi>
            <n-form-item-gi :span="3" label="来源表" path="sourceTableName">
              <n-select :size="'small'"
                        v-model:value="formModel.sourceTableName"
                        :options="sourceTableOptions"
                        filterable
                        remote
                        @search="handleSourceTableSearch"
                        @update:value="handleSourceTableUpdate"
                        :consistent-menu-width="false"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="目标库" path="targetDataSourceId">
              <n-select
                  v-model:value="formModel.targetDataSourceId"
                  :options="datasourceOptions"
                  :size="'small'"
                  disabled
              />
            </n-form-item-gi>
            <n-form-item-gi :span="3" label="目标表" path="targetTableName">
              <n-select :size="'small'"
                        v-model:value="formModel.targetTableName"
                        :options="targetTableOptions"
                        filterable
                        remote
                        @search="handleTargetTableSearch"
                        @update:value="handleTargetTableUpdate"
                        :consistent-menu-width="false"
              />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-card>

      <n-space class="mt-2" justify="center" align="center">
        <n-checkbox :checked="true" :disabled="true">
          根据Hive表同名映射
        </n-checkbox>
        <n-button type="primary" class="w-28" @click="buildJson" :loading="isBuildingRef">JSON生成</n-button>
        <n-button :disabled="jsonOutputRef === ''" class="w-28" @click="copyText(jsonOutputRef)">
          复制结果
        </n-button>
        <n-divider :vertical="true"/>
        <n-checkbox
            v-model:checked="addSchedTaskCheck"
            @updateChecked="onAddSchedTaskCheckUpdate"
        >
          同时创建调度任务
        </n-checkbox>
        <n-button type="primary" :disabled="jsonOutputRef === ''" class="w-28" @click="createDataXJob"
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
          v-model:value="jsonOutputRef"
          class="mt-2"
          type="textarea"
          placeholder=""
          readonly
          :autosize="{
            minRows:5,maxRows:16
          }"
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
                   @keydown.enter.prevent readonly
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

<script setup lang="ts">
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {add_datax_job, add_sched_task, build_datax_json, get_columns} from "@render/api/datacenter";
import {
  datasourceOptions, datasourceOptionsUpdate,
  projectIdOptions,
  projectIdOptionsUpdate
} from "@render/typings/datacenterOptions";
import {copyText} from "@render/utils/common/clipboard";
import {
  findCommonElementsByArr2
} from "@render/utils/datacenter/findCommonElements";
import {getAbbrByProId} from "@render/utils/datacenter/getAbbrByProId";
import {getTablesOptions} from "@render/utils/datacenter/getTablesOptions";
import {dataXJobNameExist} from "@render/utils/datacenter/jobNameExist";
import {isEmpty} from "lodash-es";
import {FormInst, SelectGroupOption, SelectOption} from "naive-ui";
import {onMounted, ref, watch} from "vue";
import {LockOutlined, UnlockOutlined} from '@vicons/antd'
import {QuestionCircleTwotone} from '@vicons/antd'

const formRef = ref<FormInst | null>(null);
const formModel = ref({
  name: '',
  sourceDataSourceId: '7',
  sourceTableName: '',
  targetDataSourceId: '6',
  targetTableName: '',
  projectId: '',
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
  sourceTableName: {
    required: true,
    trigger: ['change'],
    message: '请选择来源表'
  },
  targetTableName: {
    required: true,
    trigger: ['change'],
    message: '请选择目标表'
  },
  projectId: {
    required: true,
    trigger: ['change'],
    message: '请选择项目'
  }
}

watch(
    [() => formModel.value.projectId, () => formModel.value.tableName],
    async ([projectId, tableName]) => {
      formModel.value.targetTableName = `di_${(await find_by_project_id(projectId))?.tableAbbr || ''}_${tableName}_temp_ods`
      targetTableOptions.value = await getTablesOptions(formModel.value.targetDataSourceId, formModel.value.targetTableName)
      targetTableColumnsRef.value = (await get_columns(formModel.value.targetDataSourceId, formModel.value.targetTableName))
    }
)

const jobNameLockRef = ref(true)

const sourceTableOptions = ref<Array<SelectOption | SelectGroupOption>>()
const targetTableOptions = ref<Array<SelectOption | SelectGroupOption>>()

const sourceTableColumnsRef = ref([])
const targetTableColumnsRef = ref([])

const isBuildingRef = ref(false)

const jsonOutputRef = ref('')

onMounted(async () => {
  await projectIdOptionsUpdate()
  datasourceOptionsUpdate()
  sourceTableOptions.value = await getTablesOptions(formModel.value.sourceDataSourceId)
  targetTableOptions.value = await getTablesOptions(formModel.value.targetDataSourceId)
})

const onUpdateJobName = async () => {
  if (jobNameLockRef.value) {
    const {projectAbbr} = await getAbbrByProId(formModel.value.projectId);
    formModel.value.name = `cj_${projectAbbr}_${formModel.value.tableName}`
  }
}

const handleSourceTableSearch = async (query: string) => {
  sourceTableOptions.value = await getTablesOptions(formModel.value.sourceDataSourceId, query)
}

const handleTargetTableSearch = async (query: string) => {
  targetTableOptions.value = await getTablesOptions(formModel.value.targetDataSourceId, query)
}

const handleSourceTableUpdate = async () => {
  sourceTableColumnsRef.value = (await get_columns(formModel.value.sourceDataSourceId, formModel.value.sourceTableName))
}

const handleTargetTableUpdate = async () => {
  targetTableColumnsRef.value = (await get_columns(formModel.value.targetDataSourceId, formModel.value.targetTableName))

  formModel.value.tableName = formModel.value.targetTableName.split('_')[2]
  await onUpdateJobName()
}

let paramsModel = {
  readerModel: {
    datasourceType: "mysql",
    datasourceId: '8',
    path: '',
    readerFieldDelimiter: ',',
    tableName: "",
    whereParams: '',
    columns: []
  },
  writerModel: {
    datasourceType: "tbds-hive",
    datasourceId: '11',
    fromTableName: '',
    writerFileName: '',
    writeFieldDelimiter: "|",
    writeMode: "append",
    writerFileType: "orc",
    writerDefaultFS: "hdfs://173.76.2.222:8020",
    writerPath: '',
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
  subsystemName: "采集",
  replaceParam: '',
  incStartTime: '',
  replaceParamType: ''
}

const buildJson = () => {
  isBuildingRef.value = true
  if (!isEmpty(targetTableColumnsRef.value)) {
    formRef.value?.validate(async (errors) => {
      if (!errors) {
        const newSourceTable = findCommonElementsByArr2(sourceTableColumnsRef.value, targetTableColumnsRef.value, true)

        const indexes = newSourceTable
            .map((item, i) => item === null ? i : -1)
            .filter(i => i !== -1);

        if (indexes.length > 0) {
          jsonOutputRef.value = ''
          // 有 NULL 则说明目标表有字段没有被对应上
          window.$notification.create({
            title: "字段对应失败",
            content: `目标表有字段无法在来源表[${formModel.value.sourceTableName}]找到对应字段：${targetTableColumnsRef.value.filter((_, index) => indexes.includes(index)).map(item => item.split(':')[1]).join('，')}`,
            type: "error"
          })
        } else {
          paramsModel.jobDesc = formModel.value.name
          paramsModel.projectId = formModel.value.projectId

          paramsModel.readerId = formModel.value.sourceDataSourceId
          paramsModel.writerId = formModel.value.targetDataSourceId
          paramsModel.mappingType = "the-same-name"

          let path = ''
          for (let i = 0; i < targetTableColumnsRef.value.length; i++) {
            path += `M0,${72 + (48 * i)}.0 L100,${72 + (48 * i)}.0`
          }
          paramsModel.path = path

          paramsModel.gatherMethod = '2'
          paramsModel.incrementType = '2'
          paramsModel.incrementType = '2'
          paramsModel.replaceParam = "-DlastTime='%s' -DcurrentTime='%s'"
          paramsModel.incStartTime = "1971-01-01 00:00:00"
          paramsModel.replaceParamType = "yyyy-MM-dd HH:mm:ss"

          paramsModel.readerModel.datasourceType = 'mysql'
          paramsModel.readerModel.datasourceId = formModel.value.sourceDataSourceId
          paramsModel.readerModel.readerFieldDelimiter = ','
          paramsModel.readerModel.tableName = formModel.value.sourceTableName
          paramsModel.readerModel.whereParams = "cd_time >= ${lastTime} and cd_time < ${currentTime}"
          paramsModel.readerModel.columns = newSourceTable

          paramsModel.writerModel.datasourceType = 'tbds-hive'
          paramsModel.writerModel.datasourceId = formModel.value.targetDataSourceId
          paramsModel.writerModel.fromTableName = formModel.value.targetTableName
          paramsModel.writerModel.writerFileName = formModel.value.targetTableName
          paramsModel.writerModel.writerPath = `/apps/hive/warehouse/xzzf_ods.db/${formModel.value.targetTableName}`
          paramsModel.writerModel.columns = targetTableColumnsRef.value
          paramsModel.writerModel.ftpColums = Array(targetTableColumnsRef.value.length).fill(0).map((_, index) => index)

          paramsModel.initReaderModel = sourceTableColumnsRef.value
          paramsModel.initWriterModel = targetTableColumnsRef.value

          let buildJson = {
            readerDatasourceId: paramsModel.readerId,
            readerTables: [paramsModel.readerModel.tableName],
            readerColumns: paramsModel.readerModel.columns,
            writerDatasourceId: paramsModel.writerId,
            writerTables: [paramsModel.writerModel.fromTableName],
            writerColumns: paramsModel.writerModel.columns,
            rdbmsReader: {
              whereParams: paramsModel.readerModel.whereParams
            },
            hiveWriter: {
              datasourceType: paramsModel.writerModel.datasourceType,
              datasourceId: paramsModel.writerModel.datasourceId,
              fromTableName: paramsModel.writerModel.fromTableName,
              writerFileName: paramsModel.writerModel.writerFileName,
              writeFieldDelimiter: paramsModel.writerModel.writeFieldDelimiter,
              writeMode: paramsModel.writerModel.writeMode,
              writerFileType: paramsModel.writerModel.writerFileType,
              writerDefaultFS: paramsModel.writerModel.writerDefaultFS,
              writerPath: paramsModel.writerModel.writerPath,
            },
            subsystemName: "采集"
          }

          paramsModel.jobJson = await build_datax_json(buildJson)

          jsonOutputRef.value = JSON.stringify(paramsModel, null, 2)

        }
      } else {
        console.log(errors)
      }
    }).finally(() => [
      isBuildingRef.value = false
    ])
  } else {
    window.$message.warning("目标表不存在")
    isBuildingRef.value = false
  }

}

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
const createDataXJob = async () => {
  isLoading.value = true

  if (await dataXJobNameExist(paramsModel.jobDesc)) {
    window.$dialog.warning({
      title: '警告',
      content: `检测到[${paramsModel.jobDesc}]任务名已存在，是否继续创建？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        addDataxJob()
      },
      onAfterLeave: () => {
        isLoading.value = false
      }
    })
  } else {
    addDataxJob()
  }

}

const addDataxJob = () => {
  add_datax_job(paramsModel).then(async (res) => {
    if (res.code == 0 || (submitCount > 0 && res.msg == '任务名称不能相同')) {
      submitCount++;
      if (res.code == 0) {
        window.$message.success('采集任务创建成功')
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
            window.$message.success('调度任务创建成功')
            submitCount = 0;
            jobTemplateId = null
          } else {
            window.$notification.create({
              title: '调度任务创建失败',
              content: res.msg + '，请重新配置CRON表达式',
              type: "warning"
            })
            console.log(res)
          }
        })
      }
    } else {
      window.$message.error(res.msg)
      console.log(res)
    }
    isLoading.value = false
  })
}
</script>

<style scoped>

</style>
