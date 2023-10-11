<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="表管理">
        <table-mgt-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="快捷建表">
        <create-tab/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="DDL管理">
        <ddl-mgt-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import CreateTab from "@render/views/tableMgt/tbds/createTab.vue";
import DdlMgtTab from "@render/views/tableMgt/tbds/ddlMgtTab.vue";
import TableMgtTab from "@render/views/tableMgt/tbds/tableMgtTab.vue";
</script>

<style scoped>

</style>
