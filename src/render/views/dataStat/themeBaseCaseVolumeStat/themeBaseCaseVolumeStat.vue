<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 110px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      数据会根据案件编号去重
    </n-alert>

  </n-scrollbar>
</template>

<script setup lang="ts">

import QualityInspStat from "@render/views/dataStat/qualityInspStat.vue";
</script>

<style scoped>

</style>
