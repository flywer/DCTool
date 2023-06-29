<template>
  <n-layout class="ml-2 mr-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="基础数据">
        <create-basic-data-rh-job-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="行为数据">
        <create-action-data-rh-job-tab/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="JSON管理">
        <rh-json-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import CreateActionDataRhJobTab from "@render/views/rhJob/createActionDataRhJobTab.vue";
import CreateBasicDataRhJobTab from "@render/views/rhJob/createBasicDataRhJobTab.vue";
import RhJsonTab from "@render/views/rhJob/rhJsonTab.vue";
</script>

<style scoped>

</style>
