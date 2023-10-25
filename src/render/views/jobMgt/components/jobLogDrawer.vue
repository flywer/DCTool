<template>
  <n-drawer
      v-model:show="showDrawerRef"
      :width="220"
  >
    <n-drawer-content title="日志" :native-scrollbar="false" closable>
      <n-spin :size="14" :show="loading">
        <n-timeline v-if="!isEmpty(logItemsRef)">
          <n-timeline-item v-for="item in logItemsRef"
                           :type="item.type"
                           :time="item.time"
          >
            <template #icon>
              <template v-if="item.type==='success'">
                <n-icon :size="18">
                  <CheckmarkCircle24Regular/>
                </n-icon>
              </template>
              <template v-if="item.type==='error'">
                <n-icon :size="18">
                  <DismissCircle24Regular/>
                </n-icon>
              </template>
            </template>
            <template #header>
              <n-space justify="space-between">
                {{ item.title }}
                <n-button :size="'tiny'"
                          class="transition"
                          :class="item.show?'rotate-180':'rotate-0'"
                          @click="item.show=!item.show"
                          text
                >
                  <n-icon :size="18">
                    <ChevronUp24Regular/>
                  </n-icon>
                </n-button>
              </n-space>
            </template>
            <template #default>
              <n-space>
                <n-collapse-transition :show="item.show">
                  <p class="m-0" style="font-size: 12px" v-html="item.content"></p>
                </n-collapse-transition>
              </n-space>
            </template>
          </n-timeline-item>
        </n-timeline>
        <n-empty v-else description="无运行日志"/>
        <n-space v-if="showTipRef" class="mt-4" style="color: #999999" justify="center">仅显示前100条</n-space>
      </n-spin>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import {DataXJobLog} from "@common/types/datacenter/dataCollection";
import {WorkflowLog} from "@common/types/datacenter/workflow";
import {get_datax_job_log, get_workflow_log} from "@render/api/datacenter.api";
import {Job} from "@render/utils/datacenter/jobTabUtil";
import {CheckmarkCircle24Regular, DismissCircle24Regular, ChevronUp24Regular} from "@vicons/fluent";
import {isEmpty} from "lodash-es";
import {NSpace} from "naive-ui";
import {ref, watch} from "vue";

const props = defineProps({
  job: {
    type: Object as () => Job,
    default: null,
  },
  show: {
    default: false,
  }
})

const emit = defineEmits(['update:show'])

const showDrawerRef = ref(false)
const loading = ref(false)
const logItemsRef = ref([])
const showTipRef = ref(false)

watch(() => props.job, (newValue: Job) => {
  loading.value = true
  if (newValue != null) {
    logItemsRef.value = []

    showDrawerRef.value = props.show
    if (newValue.type === '数据采集任务' || newValue.type === '数据共享任务') {
      showDataXJobLog(newValue)
    } else {
      showWorkflowLog(newValue)
    }
  }
  loading.value = false
})

watch(() => props.show, (newValue: boolean) => {
  showDrawerRef.value = newValue
})

watch(() => showDrawerRef.value, (newValue: boolean) => {
  if (!newValue) {
    emit('update:show', newValue)
  }
})

const showDataXJobLog = async (v: Job) => {
  const logs: DataXJobLog[] = (await get_datax_job_log({
    current: 1,
    size: 100,
    jobContent: v.jobName
  })).data.records

  showTipRef.value = logs.length >= 100;

  logItemsRef.value = []

  logs.forEach(log => {
    let type: "default" | "error" | "info" | "success" | "warning"
    let title: string
    let content: string
    let time: string

    if (log.handleCode == 0) {
      title = '未运行'
      type = 'default'
    } else if (log.handleCode == 200) {
      title = '执行成功'
      type = 'success'
    } else if (log.handleCode == 201) {
      title = '运行中'
      type = 'info'
    } else if (log.handleCode == 500) {
      title = '执行失败'
      type = 'error'
    } else {
      title = '未知'
      type = 'warning'
    }

    time = log.handleTime

    const info = getDataXJobLogInfo(log.handleMsg)
    content = `
        任务总计耗时：${info.taskTotalTime}<br/>
        任务平均流量：${info.taskAverageFlow}<br/>
        记录写入速度：${info.taskRecordWritingSpeed}<br/>
        读出记录总数：${info.taskRecordReaderNum}<br/>
        读写失败总数：${info.taskRecordWriteFailNum}<br/>
        `

    logItemsRef.value.push({
      type: type,
      title: title,
      content: content,
      time: time,
      show: false
    })
  })
}

const getDataXJobLogInfo = (logString: string) => {
  // 任务启动时刻
  const taskStartTime = logString?.match(/taskStartTime=(.*?),/)?.[1] || '--';
  // 任务结束时刻
  const taskEndTime = logString?.match(/taskEndTime=(.*?),/)?.[1] || '--';
  // 任务总计耗时
  const taskTotalTime = logString?.match(/taskTotalTime=(.*?),/)?.[1] || '--';
  // 任务平均流量
  const taskAverageFlow = logString?.match(/taskAverageFlow=(.*?),/)?.[1] || '--';
  // 记录写入速度
  const taskRecordWritingSpeed = logString?.match(/taskRecordWritingSpeed=(.*?),/)?.[1] || '--';
  // 读出记录总数
  const taskRecordReaderNum = logString?.match(/taskRecordReaderNum=(.*?),/)?.[1] || '--';
  // 读写失败总数
  const taskRecordWriteFailNum = logString?.match(/taskRecordWriteFailNum=(.*?)}$/)?.[1] || '--';

  return {
    taskStartTime,
    taskEndTime,
    taskTotalTime,
    taskAverageFlow,
    taskRecordWritingSpeed,
    taskRecordReaderNum,
    taskRecordWriteFailNum
  }
}

const showWorkflowLog = async (v: Job) => {
  const logs: WorkflowLog[] = (await get_workflow_log(v.id, 100, 1)).data.records

  showTipRef.value = logs.length >= 100;

  logItemsRef.value = []

  logs.forEach(log => {
    let type: "default" | "error" | "info" | "success" | "warning"
    let title: string
    let content: string
    let time: string

    if (log.result == null) {
      title = '运行中'
      type = 'info'
    } else if (log.result == 1) {
      title = '执行成功'
      type = 'success'
    } else if (log.result == 2) {
      title = '执行失败'
      type = 'error'
    } else if (log.result == 3) {
      title = '未反馈'
      type = 'warning'
    } else {
      title = '未知'
      type = 'warning'
    }

    time = log.startTime
    content = `
    组件名称：${log.componentName}<br>
    IO条数： ${log.ioNum}<br>
    运行时长：${(log.runTime / 60000).toFixed(2)}分钟<br>
    `

    logItemsRef.value.push({
      type: type,
      title: title,
      content: content,
      time: time,
      show: false
    })
  })
}

</script>

<style scoped>

</style>
