<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 93px);" trigger="hover">

      <template-table
          v-if="showTemplateTable"
          v-model:show="showTemplateTable"
          v-model:template-id="templateId"
      />

      <template-detail
          v-if="!showTemplateTable"
          :template-id="templateId"
          @back="showTable"
      />

    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import TemplateDetail from "@render/views/jobTemplate/zj/templateDetail.vue";
import TemplateTable from "@render/views/jobTemplate/zj/templateTable.vue";
import {ref} from 'vue'

const showTemplateTable = ref(true)
const templateId = ref(null)

const showTable = () => {
  showTemplateTable.value = true
}
</script>

<style scoped>

</style>
