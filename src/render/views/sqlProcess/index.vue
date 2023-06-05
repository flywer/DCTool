<template>
  <n-layout class="m-2">
      <n-tabs type="line" animated>
        <n-tab-pane name="1" tab="SQL转换">
          <sql-trans-tab/>
        </n-tab-pane>
        <n-tab-pane name="2" tab="SQL校验">
          <sql-valid-tab/>
        </n-tab-pane>
        <n-tab-pane name="3" tab="SQL执行">
          <sql-exec-tab/>
        </n-tab-pane>
      </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import SqlExecTab from "@render/views/sqlProcess/sqlExec/sqlExecTab.vue";
import SqlTransTab from "@render/views/sqlProcess/sqlTrans/sqlTransTab.vue";
import SqlValidTab from "@render/views/sqlProcess/sqlValid/sqlValidTab.vue";
</script>

<style scoped>

</style>
