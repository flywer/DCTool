<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="TBDS">
        <tbds-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="前置机">
        <front-end-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import FrontEndTab from "@render/views/tableMgt/frontEnd/frontEndTab.vue";
import TbdsTab from "@render/views/tableMgt/tbds/tbdsTab.vue";
</script>

<style scoped>

</style>
