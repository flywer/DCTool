<template>
  <n-layout class="ml-2 mr-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="任务列表">
        <action-rk-job/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="行为数据集市表">
        <action-dm-table/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ActionDmTable from "@render/views/projectMgt/actionDmTable.vue";
import ActionRkJob from "@render/views/projectMgt/actionRkJob.vue";
</script>

<style scoped>

</style>
