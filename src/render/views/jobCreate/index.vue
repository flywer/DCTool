<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="采集任务">
        <cj-job/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="质检任务">
        <zj-job/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="备份任务">
        <bf-job/>
      </n-tab-pane>
      <n-tab-pane name="5" tab="清除任务">
        <qc-job/>
      </n-tab-pane>
      <n-tab-pane name="6" tab="入库任务">
        <rk-job/>
      </n-tab-pane>
      <n-tab-pane name="7" tab="共享任务">
        <gx-job/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import CjJob from "@render/views/jobCreate/cjJob/index.vue";
import ZjJob from "@render/views/jobCreate/zjJob/index.vue";
import BfJob from "@render/views/jobCreate/bfJob/index.vue";
import QcJob from "@render/views/jobCreate/qcJob/index.vue";
import RkJob from "@render/views/jobCreate/rkJob/index.vue";
import GxJob from "@render/views/jobCreate/gxJob/index.vue";
</script>

<style scoped>

</style>
