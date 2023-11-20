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
    <n-grid :cols="5" :x-gap="12" class="mt-2 text-center">
      <n-gi :span="1">
        任务总数
        <n-spin :show="loading.totalLoading" :size="'small'">
          {{ volumes.total }}
        </n-spin>
      </n-gi>
      <n-gi :span="1">
        启用
        <n-spin :show="loading.enableLoading" :size="'small'">
          {{ volumes.enable }}
        </n-spin>
      </n-gi>
      <n-gi :span="1">
        运行中
        <n-spin :show="loading.runningLoading" :size="'small'">
          {{ volumes.running }}
        </n-spin>
      </n-gi>
      <n-gi :span="1">
        异常
        <n-spin :show="loading.exceptionLoading" :size="'small'">
          {{ volumes.exception }}
        </n-spin>
      </n-gi>
      <n-gi :span="1">
        未反馈
        <n-spin :show="loading.noFeedBackLoading" :size="'small'">
          {{ volumes.noFeedBack }}
        </n-spin>
      </n-gi>
    </n-grid>

  </n-card>
</template>

<script setup lang="ts">
import {get_workflow_page} from "@render/api/datacenter.api";
import {ArrowRepeatAll24Regular} from "@vicons/fluent";
import {NButton, NIcon} from "naive-ui";
import {computed, onMounted, ref, watch} from "vue";

let abortController = new AbortController()
let abortSignal = abortController.signal

const props = defineProps({
  jobPrefix: {
    type: String,
    default: '',
    required: true
  },
  projectAbbr: {
    type: Array<string>,
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
  abortController.abort() // 取消终止请求
  abortController = new AbortController()
  abortSignal = abortController.signal
  handleLoad()
})

const volumes = ref({
  total: 0,
  enable: 0,
  running: 0,
  exception: 0,
  noFeedBack: 0
})

const loading = ref({
  totalLoading: false,
  enableLoading: false,
  runningLoading: false,
  exceptionLoading: false,
  noFeedBackLoading: false,
})

const isLoading = computed(() => loading.value.totalLoading || loading.value.enableLoading || loading.value.runningLoading || loading.value.exceptionLoading || loading.value.noFeedBackLoading)

const allLoading = () => {
  loading.value.totalLoading = true
  loading.value.enableLoading = true
  loading.value.runningLoading = true
  loading.value.exceptionLoading = true
  loading.value.noFeedBackLoading = true
}

const handleLoad = () => {
  allLoading()

  volumes.value = {
    total: 0,
    enable: 0,
    running: 0,
    exception: 0,
    noFeedBack: 0
  }

  new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      if (abortSignal.aborted) { // 检查终止信号是否被触发
        resolve()  // 终止执行
      }
      const total = (await get_workflow_page({
        page: 1,
        size: 1,
        status: null,
        procName: props.jobPrefix + abbr
      })).data.total
      volumes.value.total += total
    }
    resolve()
  }).finally(() => {
    loading.value.totalLoading = false
  })

  new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      if (abortSignal.aborted) { // 检查终止信号是否被触发
        return  // 终止执行
      }

      const total = (await get_workflow_page({
        page: 1,
        size: 1,
        status: '1',
        procName: props.jobPrefix + abbr
      })).data.total
      volumes.value.enable += total
    }
    resolve()
  }).finally(() => {
    if (!abortSignal.aborted) { // 如果终止信号未被触发，取消加载状态
      loading.value.enableLoading = false
    }
  })

  new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      if (abortSignal.aborted) { // 检查终止信号是否被触发
        return  // 终止执行
      }

      const total = (await get_workflow_page({
        page: 1,
        size: 1,
        status: '4',
        procName: props.jobPrefix + abbr
      })).data.total
      volumes.value.running += total
    }
    resolve()
  }).finally(() => {
    if (!abortSignal.aborted) { // 如果终止信号未被触发，取消加载状态
      loading.value.runningLoading = false
    }
  })

  new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      if (abortSignal.aborted) { // 检查终止信号是否被触发
        return  // 终止执行
      }

      const total = (await get_workflow_page({
        page: 1,
        size: 1,
        status: '3',
        procName: props.jobPrefix + abbr
      })).data.total
      volumes.value.exception += total
    }
    resolve()
  }).finally(() => {
    if (!abortSignal.aborted) { // 如果终止信号未被触发，取消加载状态
      loading.value.exceptionLoading = false
    }
  })

  new Promise<void>(async (resolve) => {
    for (const abbr of props.projectAbbr) {
      if (abortSignal.aborted) { // 检查终止信号是否被触发
        return  // 终止执行
      }

      const total = (await get_workflow_page({
        page: 1,
        size: 1,
        status: '5',
        procName: props.jobPrefix + abbr
      })).data.total
      volumes.value.noFeedBack += total
    }
    resolve()
  }).finally(() => {
    if (!abortSignal.aborted) { // 如果终止信号未被触发，取消加载状态
      loading.value.noFeedBackLoading = false
    }
  })

}
</script>

<style scoped>

</style>
