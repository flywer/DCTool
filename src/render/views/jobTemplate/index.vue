<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="质检任务模板">
        <zj-template-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ZjTemplateTab from "@render/views/jobTemplate/zj/zjTemplateTab.vue";
</script>

<style scoped>

</style>
