<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="绿盾解密">
        <ld-decrypt-tab/>
      </n-tab-pane>
      <n-tab-pane name="2" tab="文本扁平">
        <flatten-text-tab/>
      </n-tab-pane>
      <n-tab-pane name="3" tab="JSON类型提取">
        <get-type-from-json-tab/>
      </n-tab-pane>
      <n-tab-pane name="4" tab="Excel提取">
        <convert-excel-data-tab/>
      </n-tab-pane>
      <n-tab-pane name="5" tab="政务服务网提取">
        <GdzwfwDataFetch/>
      </n-tab-pane>
      <!--      <n-tab-pane name="5" tab="法规提取（测）">
              <extract-laws-tab/>
            </n-tab-pane>-->
      <!--      <n-tab-pane name="6" tab="信用公示数据导出">
              <credit-publicity-data-export-tab/>
            </n-tab-pane>-->
    </n-tabs>

  </n-layout>
</template>

<script setup lang="ts">
import ConvertExcelDataTab from "@render/views/toolbox/convertExcelDataTab.vue";
import FlattenTextTab from "@render/views/toolbox/flattenTextTab.vue";
import GetTypeFromJsonTab from "@render/views/toolbox/getTypeFromJsonTab.vue";
import LdDecryptTab from "@render/views/toolbox/ldDecryptTab.vue";
import CreditPublicityDataExportTab from "@render/views/toolbox/creditPublicityDataExportTab.vue";
import GdzwfwDataFetch from "@render/views/toolbox/gdzwfwDataFetch.vue";
</script>

<style scoped>

</style>
