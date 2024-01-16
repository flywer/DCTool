<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="质检统计">
        <n-tabs type="line" animated>
          <n-tab-pane name="1" tab="质检情况统计">
            <quality-insp-stat/>
          </n-tab-pane>
          <n-tab-pane name="2" tab="质检问题统计">
            <insp-problem-stat/>
          </n-tab-pane>
        </n-tabs>
      </n-tab-pane>
      <n-tab-pane name="2" tab="全省上报单位数据量统计">
        <depart-data-volume-stat/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="数据湖统计">
        <n-tabs type="line" animated>
          <n-tab-pane name="1" tab="地市单位案件量统计">
            <city-depart-case-volume-stat/>
          </n-tab-pane>
        </n-tabs>
      </n-tab-pane>
      <n-tab-pane name="4" tab="主题库统计">
        <n-tabs type="line" animated>
          <n-tab-pane name="1" tab="上报单位案件量统计">
            <data-source-case-volume-stat/>
          </n-tab-pane>
          <n-tab-pane name="2" tab="所属单位案件量统计">
            <theme-base-case-volume-stat/>
          </n-tab-pane>
          <n-tab-pane name="4" tab="单位编目挂接情况管理">
            <depart-catalog-hook-record-mgt/>
          </n-tab-pane>
        </n-tabs>


      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import DepartDataVolumeStat from "@render/views/dataStat/sourceDepartDataVolumeStat/sourceDepartDataVolumeStat.vue";
import QualityInspStat from "@render/views/dataStat/qualityInspStat/qualityInspStat.vue";
import CityDepartCaseVolumeStat from "@render/views/dataStat/dataLakeStat/cityDepartCaseVolumeStat.vue";
import DataSourceCaseVolumeStat from "@render/views/dataStat/themeBaseStat/dataSourceCaseVolumeStat.vue";
import DepartCatalogHookRecordMgt
  from "@render/views/dataStat/themeBaseStat/departCatalogHookRecordMgt.vue";
import ThemeBaseCaseVolumeStat
  from "@render/views/dataStat/themeBaseStat/dataOwnCaseVolumeStat.vue";
import InspProblemStat from "@render/views/dataStat/qualityInspStat/qualityInspProblemStat/inspProblemStat.vue";
</script>

<style scoped>

</style>
