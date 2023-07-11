<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="整体任务">
        <tree-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="行为数据入湖任务">
        <action-rk-job/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="行为数据共享任务">
        <action-gx-job/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ActionGxJob from "@render/views/projectMgt/actionGxJob.vue";
import ActionRkJob from "@render/views/projectMgt/actionRkJob.vue";
import TreeTab from "@render/views/projectMgt/treeTab.vue";
</script>

<style scoped>

</style>
