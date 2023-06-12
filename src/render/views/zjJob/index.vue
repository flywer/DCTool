<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-tabs type="line" animated>
        <n-tab-pane name="1" tab="JSON转换">
          <zj-json-trans-tab/>
        </n-tab-pane>
        <n-tab-pane name="2" tab="任务生成">
          <create-zj-job-tab/>
        </n-tab-pane>
        <n-tab-pane name="3" tab="JSON管理">
          <zj-json-tab/>
        </n-tab-pane>
      </n-tabs>
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import CreateZjJobTab from "@render/views/zjJob/createZjJobTab.vue";
import ZjJsonTab from "@render/views/zjJob/zjJsonTab.vue";
import ZjJsonTransTab from "@render/views/zjJob/zjJsonTransTab.vue";
</script>

<style scoped>

</style>
