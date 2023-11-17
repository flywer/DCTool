<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="整体任务">
        <tree-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="行为数据入湖">
        <action-data2-data-lake-tab/>
      </n-tab-pane>
      <n-tab-pane name="4" tab="行为数据入库">
        <action-data2-theme-base-tab/>
      </n-tab-pane>
      <n-tab-pane name="5" tab="行为数据共享">
        <action-gx-job/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ActionData2ThemeBaseTab from "@render/views/jobMgt/actionData2ThemeBase/actionData2ThemeBaseTab.vue";
import ActionGxJob from "@render/views/jobMgt/actionGx/actionGxJob.vue";
import ActionData2DataLakeTab from "@render/views/jobMgt/actionData2DataLake/actionData2DataLakeTab.vue";
import TreeTab from "@render/views/jobMgt/projectTree/treeTab.vue";
</script>

<style scoped>

</style>
