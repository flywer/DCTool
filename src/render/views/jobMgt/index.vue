<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="整体任务">
        <tree-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="行为数据入湖">
        <action-rk-tab/>
      </n-tab-pane>
      <n-tab-pane name="4" tab="行为数据共享">
        <action-gx-job/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ActionGxJob from "@render/views/jobMgt/actionGx/actionGxJob.vue";
import ActionRkTab from "@render/views/jobMgt/actionRk/actionRkTab.vue";
import TreeTab from "@render/views/jobMgt/projectTree/treeTab.vue";
</script>

<style scoped>

</style>
