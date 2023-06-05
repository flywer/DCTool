<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-tabs type="line" animated>
        <n-tab-pane name="1" tab="建表">
          <create/>
        </n-tab-pane>
        <n-tab-pane name="2" tab="建表语句">
          <sql/>
        </n-tab-pane>
      </n-tabs>

    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import Create from "@render/views/createTable/create.vue";
import Sql from "@render/views/createTable/sql.vue";
</script>

<style scoped>

</style>
