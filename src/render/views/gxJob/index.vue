<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px); " trigger="hover">
      <n-card class="mt-2" :content-style="{paddingBottom:0}">
        <n-form ref="formRef"
                inline
                :size="'small'"
                :model="formModel"
                :rules="rules"
                label-placement="left"
        >
          <n-grid :cols="3" :x-gap="12">
            <n-form-item-gi label="数据类型" path="dataType">
              <n-radio-group v-model:value="formModel.dataType">
                <n-radio-button
                    :key="1"
                    :value="1"
                    label="基础数据"
                />
                <n-radio-button
                    :key="2"
                    :value="2"
                    label="行为数据"
                />
              </n-radio-group>
            </n-form-item-gi>


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
                  :disabled="formModel.dataType===2"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="4" v-show="previewRef.length>0"> {{ previewRef }}</n-form-item-gi>
          </n-grid>
        </n-form>
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
        <n-button class="w-28"
                  type="primary"
                  :disabled="dataXJsonRef === ''"
                  @click="createDataXJob"
                  :loading="isLoading"
        >
          执行
        </n-button>
      </n-space>

      <n-input
          v-model:value="dataXJsonRef"
          type="textarea"
          placeholder=""
          class="mt-2"
          readonly
          :autosize="{minRows:6,maxRows:18}"
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
import {add_datax_job, add_sched_task} from "@render/api/datacenter";
import {projectIdOptions} from "@render/typings/datacenterOptions";
import {copyText} from "@render/utils/common/clipboard";
import {buildGxJson} from "@render/utils/datacenter/gxJob";
import {dataXJobNameExist} from "@render/utils/datacenter/jobNameExist";
import {isEmpty} from "lodash-es";
import {FormInst} from "naive-ui";
import {ref, watch} from "vue";

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  dataType: 1,
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
    [() => formModel.value.projectId, () => formModel.value.tableName, () => formModel.value.dataType],
    async ([projectId, tableName, dataType]) => {
      tableName = tableName.toLowerCase()
      if (dataType == 1) {
        const projectAbbr = (await find_by_project_id(projectId))?.projectAbbr || ''
        formModel.value.name = `gx_${projectAbbr}_${tableName}`
      } else {
        formModel.value.projectId = '27'
        const projectAbbr = (await find_by_project_id(formModel.value.projectId))?.projectAbbr || ''
        formModel.value.name = `gx_${projectAbbr}_${tableName}`
      }
      formModel.value.sourceTableName = `sztk_${tableName}`
      formModel.value.targetTableName = `gdsztk_${tableName}`
      previewRef.value = `工作流名称：${formModel.value.name}，来源表：${formModel.value.sourceTableName}，目标表：${formModel.value.targetTableName}`

    }
)

const dataXJsonRef = ref('')

const generate = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {

      const json = await buildGxJson(formModel.value);

      if (isEmpty(json.readerModel.columns)) {
        window.$message.warning('来源表不存在')
        dataXJsonRef.value = ''
        return 0
      }

      if (isEmpty(json.writerModel.columns)) {
        window.$message.warning('目标表不存在')
        dataXJsonRef.value = ''
        return 0
      }

      dataXJsonRef.value = JSON.stringify(json, null, 2)

    } else {
      console.error(errors)
    }
  })
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
      console.error(errors)
    }
  })
}

//记录本次提交成功数
let submitCount = 0;
let jobTemplateId = null

const createDataXJob = async () => {
  isLoading.value = true
  const paramsModel = JSON.parse(dataXJsonRef.value)
  if (await dataXJobNameExist(paramsModel.jobDesc)) {
    window.$dialog.warning({
      title: '警告',
      content: `检测到[${paramsModel.jobDesc}]任务名已存在，是否继续创建？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        addDataxJob(paramsModel)
      },
      onAfterLeave: () => {
        isLoading.value = false
      }
    })
  } else {
    addDataxJob(paramsModel)
  }
}

const addDataxJob = (paramsModel) => {
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
          } else {
            window.$notification.create({
              title: '调度任务创建失败',
              content: res.msg + '，请重新配置CRON表达式',
              type: "warning"
            })
          }
        })
      }
    } else {
      window.$message.error(res.msg)
      console.error(res)
    }
    isLoading.value = false
  })
}

</script>

<style scoped>

</style>
