<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="项目调度管理">
        <project-scheduling-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ProjectSchedulingTab from "@render/views/schedulingMgt/projectSchedulingTab.vue";
</script>

<style scoped>

</style>
