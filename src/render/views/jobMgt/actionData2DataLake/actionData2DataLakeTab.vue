<template>
  <n-layout class="ml-2 mr-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="任务列表">
        <action-data2-data-lake-job/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="TBDS-Hive表">
        <action-hive-lake-table/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="数据湖表">
        <data-lake-table/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ActionHiveLakeTable from "@render/views/jobMgt/actionData2DataLake/actionHiveLakeTable.vue";
import ActionData2DataLakeJob from "@render/views/jobMgt/actionData2DataLake/actionData2DataLakeJob.vue";
import DataLakeTable from "@render/views/jobMgt/actionData2DataLake/dataLakeTable.vue";
</script>

<style scoped>

</style>
