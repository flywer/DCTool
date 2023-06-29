<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-tabs type="line" animated>
        <n-tab-pane name="1" tab="代码值插入">
          <save-dict-tab/>
        </n-tab-pane>
        <n-tab-pane name="2" tab="插入SQL生成">
          <insert-sql-build-tab/>
        </n-tab-pane>
      </n-tabs>

    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">

import InsertSqlBuildTab from "@render/views/sztkDict/insertSqlBuildTab.vue";
import SaveDictTab from "@render/views/sztkDict/saveDictTab.vue";
</script>

<style scoped>

</style>
