<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="调度任务管理">
        <scheduling-task-mgt/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import SchedulingTaskMgt from "@render/views/taskScheduler/schedulingTaskMgt.vue";
</script>

<style scoped>

</style>
