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
      <n-tab-pane name="4" tab="融合任务">
        <rh-job/>
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
import CjJob from "@render/views/cjJob/index.vue";
import ZjJob from "@render/views/zjJob/index.vue";
import BfJob from "@render/views/bfJob/index.vue";
import RhJob from "@render/views/rhJob/index.vue";
import QcJob from "@render/views/qcJob/index.vue";
import RkJob from "@render/views/rkJob/index.vue";
import GxJob from "@render/views/gxJob/index.vue";
</script>

<style scoped>

</style>
