<template>
  <n-layout class="ml-2 mr-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="任务列表">
        <action-data2-theme-base-job/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="TBDS-Hive表">
        <action-hive-theme-base-table/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="主题库表">
        <theme-base-table/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ActionData2ThemeBaseJob from "@render/views/jobMgt/actionData2ThemeBase/actionData2ThemeBaseJob.vue";
import ActionHiveThemeBaseTable from "@render/views/jobMgt/actionData2ThemeBase/actionHiveThemeBaseTable.vue";
import ThemeBaseTable from "@render/views/jobMgt/actionData2ThemeBase/themeBaseTable.vue";
</script>

<style scoped>

</style>
