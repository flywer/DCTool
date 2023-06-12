<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="任务生成">
        <create-rh-job-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="JSON管理">
        <rh-json-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import CreateRhJobTab from "@render/views/rhJob/createRhJobTab.vue";
import RhJsonTab from "@render/views/rhJob/rhJsonTab.vue";

</script>

<style scoped>

</style>
