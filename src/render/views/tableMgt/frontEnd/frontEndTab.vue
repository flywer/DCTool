<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="表名关联">
        <table-name-association/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import TableNameAssociation from "@render/views/tableMgt/frontEnd/tableNameAssociation.vue";
</script>

<style scoped>

</style>
