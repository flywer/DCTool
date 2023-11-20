<template>
  <n-card :content-style="{padding:'12px 6px 6px 12px'}">
    <n-h6 prefix="bar" class="mb-0" type="info">
      {{ title }}
      <n-button
          title="刷新"
          class="float-right"
          quaternary
          size="small"
          @click="handleLoad"
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
  exception: 0
})

const loading = ref({
  totalLoading: false,
  normalLoading: false,
  runningLoading: false,
  exceptionLoading: false,
})

const isLoading = computed(() => loading.value.totalLoading || loading.value.normalLoading || loading.value.runningLoading || loading.value.exceptionLoading)

const allLoading = () => {
  loading.value.totalLoading = true
  loading.value.normalLoading = true
  loading.value.runningLoading = true
  loading.value.exceptionLoading = true
}

const handleLoad = async () => {

  allLoading()

  volumes.value = {
    total: 0,
    normal: 0,
    running: 0,
    exception: 0
  }

  new Promise<void>(async (resolve) => {
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
  }).finally(() => loading.value.totalLoading = false)

  new Promise<void>(async (resolve) => {
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
  }).finally(() => loading.value.normalLoading = false)

  new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      const logs: DataXJobLog[] = (await get_datax_job_log({
        current: 1,
        size: 100,
        jobContent: props.jobPrefix + abbr
      })).data.records
      volumes.value.running += logs.filter(log => log.handleCode_dictText == '运行中').length
    }
    resolve()
  }).finally(() => loading.value.runningLoading = false)

  new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      const total = (await get_cj_job_page({
        current: 1,
        size: 10,
        jobDesc: props.jobPrefix + abbr,
        executeResult: '0',
        subsystemName: "采集"
      })).data.total
      volumes.value.exception += total
    }
    resolve()
  }).finally(() => loading.value.exceptionLoading = false)

}

</script>

<style scoped>

</style>
