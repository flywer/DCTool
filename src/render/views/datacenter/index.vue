<template>
  <n-layout style="margin-left: 10px;margin-right: 10px;margin-top: 10px;">
    <n-tabs type="line" animated>
<!--      <n-tab-pane name="1" tab="Hive建表语句转换">
        <hive-sql-tab/>
      </n-tab-pane>-->
      <n-tab-pane name="2" tab="质检JSON生成">
        <valid-json-tab/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="备份JSON生成">
        <backup-json-tab/>
      </n-tab-pane>
      <n-tab-pane name="4" tab="清空JSON生成">
        <clean-json-tab/>
      </n-tab-pane>
      <n-tab-pane name="5" tab="INSERT语句校验">
        <insert-sql-valid-tab/>
      </n-tab-pane>
      <n-tab-pane name="6" tab="入库JSON生成">
        <into-theme-tab/>
      </n-tab-pane>
      <n-tab-pane name="7" tab="共享JSON生成">
        <share-json-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>

</template>

<script setup lang="ts">
import BackupJsonTab from "@render/views/datacenter/backupJsonTab.vue";
import CleanJsonTab from "@render/views/datacenter/cleanJsonTab.vue";
import HiveSqlTab from "@render/views/datacenter/hiveSqlTab.vue";
import InsertSqlValidTab from "@render/views/datacenter/insertSqlValidTab.vue";
import IntoThemeTab from "@render/views/datacenter/intoThemeTab.vue";
import ShareJsonTab from "@render/views/datacenter/shareJsonTab.vue";
import ValidJsonTab from "@render/views/datacenter/validJsonTab.vue";
</script>

<style scoped>

</style>
