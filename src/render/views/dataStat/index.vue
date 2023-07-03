<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-tabs type="line" animated>
        <n-tab-pane name="1" tab="质检情况统计">
          <quality-insp-stat/>
        </n-tab-pane>
      </n-tabs>




    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">

import QualityInspStat from "@render/views/dataStat/qualityInspStat.vue";
</script>

<style scoped>

</style>
