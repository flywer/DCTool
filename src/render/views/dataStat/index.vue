<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="质检情况统计">
        <quality-insp-stat/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="前置机数据量统计">
        <front-end-data-stat/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="数据湖数据量统计">
        <data-lake-data-stat/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import DataLakeDataStat from "@render/views/dataStat/dataLakeDataStat.vue";
import FrontEndDataStat from "@render/views/dataStat/frontEndDataStat.vue";
import QualityInspStat from "@render/views/dataStat/qualityInspStat.vue";
</script>

<style scoped>

</style>
