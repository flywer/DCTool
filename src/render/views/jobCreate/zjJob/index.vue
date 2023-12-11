<template>
  <n-layout class="ml-2 mr-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="任务生成">
        <create-zj-job-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="完整版JSON管理">
        <zj-json-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import CreateZjJobTab from "@render/views/jobCreate/zjJob/createZjJobTab.vue";
import ZjJsonTab from "@render/views/jobCreate/zjJob/zjJsonTab.vue";
</script>

<style scoped>

</style>
