<template>
  <n-layout class="m-2">
      <n-tabs type="line" animated>
        <n-tab-pane name="1" tab="中台建表">
          <create-tab/>
        </n-tab-pane>
        <n-tab-pane name="2" tab="建表语句管理">
          <ddl-mgt/>
        </n-tab-pane>
      </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import CreateTab from "@render/views/tableMgt/tbds/createTab.vue";
import DdlMgt from "@render/views/tableMgt/tbds/ddlMgt.vue";
</script>

<style scoped>

</style>
