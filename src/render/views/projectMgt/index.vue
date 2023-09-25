<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="项目简称管理">
        <project-abbr-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="项目调度管理">
        <project-scheduling-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ProjectAbbrTab from "@render/views/projectMgt/projectAbbr/projectAbbrTab.vue";
import ProjectSchedulingTab from "@render/views/projectMgt/schedulingMgt/projectSchedulingTab.vue";
</script>

<style scoped>

</style>
