<template>
  <n-layout>
      <n-tabs type="line" animated>
        <n-tab-pane name="1" tab="通用SQL校验">
          <common-sql-valid/>
        </n-tab-pane>
        <n-tab-pane name="2" tab="INSERT语句校验">
          <insert-sql-valid-tab/>
        </n-tab-pane>
      </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import CommonSqlValid from "@render/views/sqlProcess/sqlValid/commonSqlValid.vue";
import InsertSqlValidTab from "@render/views/sqlProcess/sqlValid/insertSqlValidTab.vue";

</script>

<style scoped>

</style>
