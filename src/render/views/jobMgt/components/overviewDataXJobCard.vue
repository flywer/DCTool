<template>
  <n-card :content-style="{padding:'12px 6px 6px 12px'}">
    <n-h6 prefix="bar" class="mb-0" type="info">
      {{ title }}
      <n-text depth="3" style="font-size: 13px;">{{ formatDate(volumes.statTime) }}</n-text>
      <n-button
          title="刷新"
          class="float-right"
          quaternary
          size="small"
          @click="dataStat"
          :disabled="isLoading"
      >
        <n-icon>
          <ArrowRepeatAll24Regular/>
        </n-icon>
      </n-button>
    </n-h6>
    <n-grid :cols="4" :x-gap="12" class="mt-2">
      <n-gi :span="1" class="text-center">
        任务总数
        <n-spin :show="loading.totalLoading" :size="'small'">
          {{ volumes.total }}
        </n-spin>
      </n-gi>
      <n-gi :span="1" class="text-center">
        正常
        <n-spin :show="loading.normalLoading" :size="'small'">
          {{ volumes.normal }}
        </n-spin>
      </n-gi>
      <n-gi :span="1" class="text-center">
        运行中
        <n-spin :show="loading.runningLoading" :size="'small'">
          {{ volumes.running }}
        </n-spin>
      </n-gi>
      <n-gi :span="1" class="text-center">
        异常
        <n-spin :show="loading.exceptionLoading" :size="'small'">
          {{ volumes.exception }}
        </n-spin>
      </n-gi>
    </n-grid>

  </n-card>
</template>

<script setup lang="ts">
import {DataXJobLog} from "@common/types/datacenter/dataCollection";
import {get_cj_job_page, get_datax_job_log} from "@render/api/datacenter.api";
import {ArrowRepeatAll24Regular} from "@vicons/fluent";
import {NButton, NIcon} from "naive-ui";
import {computed, onMounted, ref, watch} from "vue";
import {
  fetch_job_overview_stat_record,
  save_job_overview_stat_record
} from "@render/api/auxiliaryDb/jobOverviewStatRecord.api";
import {JobOverviewStatRecord} from "@main/entity/JobOverviewStatRecord";
import {formatDate} from "@render/utils/common/dateUtils";

const props = defineProps({
  jobPrefix: {
    type: String,
    default: '',
    required: true
  },
  projectAbbr: {
    type: Array<string>,
    default: '',
    required: true
  },
  title: {
    type: String,
    default: '任务'
  },
})

onMounted(() => {
  handleLoad()
})

watch(() => props.projectAbbr, () => {
  handleLoad()
})

const volumes = ref({
  total: 0,
  normal: 0,
  running: 0,
  exception: 0,
  statTime: null
})

const loading = ref({
  totalLoading: false,
  normalLoading: false,
  runningLoading: false,
  exceptionLoading: false,
})

const isLoading = computed(() => loading.value.totalLoading || loading.value.normalLoading || loading.value.runningLoading || loading.value.exceptionLoading)

const allLoading = (isLoading: boolean) => {
  loading.value.totalLoading = isLoading
  loading.value.normalLoading = isLoading
  loading.value.runningLoading = isLoading
  loading.value.exceptionLoading = isLoading
}

const handleLoad = async () => {

  allLoading(true)

  const record = await fetch_job_overview_stat_record(props.jobPrefix, props.projectAbbr.join(','), 1)

  if (record) {
    volumes.value = {
      total: record.total,
      normal: record.normal,
      running: record.running,
      exception: record.exception,
      statTime: record.createTime
    }
    allLoading(false)
  } else {
    dataStat()
  }

}

const dataStat = () => {

  allLoading(true)

  volumes.value = {
    total: 0,
    normal: 0,
    running: 0,
    exception: 0,
    statTime: null
  }

  let promises: Promise<void>[] = [];

  promises.push(new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      const total = (await get_cj_job_page({
        current: 1,
        size: 1,
        jobDesc: props.jobPrefix + abbr,
        executeResult: '',
        incrementOrFull: '',
        subsystemName: "采集"
      })).data.total
      volumes.value.total += total
    }
    resolve()
  }).finally(() => loading.value.totalLoading = false))
  promises.push(new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      const total = (await get_cj_job_page({
        current: 1,
        size: 1,
        jobDesc: props.jobPrefix + abbr,
        executeResult: '1',
        subsystemName: "采集"
      })).data.total
      volumes.value.normal += total
    }
    resolve()
  }).finally(() => loading.value.normalLoading = false))
  promises.push(new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      const logs: DataXJobLog[] = (await get_datax_job_log({
        current: 1,
        size: 100,
        jobContent: props.jobPrefix + abbr
      }))?.data?.records || []
      volumes.value.running += logs.filter(log => log.handleCode_dictText == '运行中').length
    }
    resolve()
  }).finally(() => loading.value.runningLoading = false))
  promises.push(new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      const total = (await get_cj_job_page({
        current: 1,
        size: 10,
        jobDesc: props.jobPrefix + abbr,
        executeResult: '0',
        subsystemName: "采集"
      })).data?.total || 0
      volumes.value.exception += total
    }
    resolve()
  }).finally(() => loading.value.exceptionLoading = false))

  Promise.all(promises)
      .then(() => {
        const record = new JobOverviewStatRecord()
        record.jobPrefix = props.jobPrefix
        record.projectAbbr = props.projectAbbr.join(',')
        record.jobType = 1
        record.total = volumes.value.total
        record.normal = volumes.value.normal
        record.running = volumes.value.running
        record.exception = volumes.value.exception
        record.createTime = new Date()

        save_job_overview_stat_record(record)

        volumes.value.statTime = record.createTime
      })
      .catch(error => {
        console.error(error)
        allLoading(false)
      })
}
</script>

<style scoped>

</style>
