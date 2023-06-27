<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-tabs type="line" animated>
        <n-tab-pane name="1" tab="行为数据字段情况查询">
          <basic-data-problem-query/>
        </n-tab-pane>
      </n-tabs>
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import BasicDataProblemQuery from "@render/views/preDatabase/basicDataProblemQuery.vue";
</script>

<style scoped>

</style>
