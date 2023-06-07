<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="基础数据">
        <basic-data-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="行为数据">
        <action-data-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import ActionDataTab from "@render/views/rkJob/actionDataTab.vue";
import BasicDataTab from "@render/views/rkJob/basicDataTab.vue";

</script>

<style scoped>

</style>
