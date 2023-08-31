<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="全局依赖图">
        <global-dependency-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import GlobalDependencyTab from "@render/views/jobDependency/globalDependencyTab.vue";
</script>

<style scoped>

</style>
