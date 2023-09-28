<template>
  <json-data-table
      :json-data="tableDataRef"
      :json-type="1"
      :is-loading="isLoading"
      @search="tableDataInit"
      @save="handleSave"
  />
</template>

<script setup lang="ts">
import {CommonJsonDataType} from "@common/types";
import {get_simp_zj_json, update_simp_zj_json} from "@render/api/auxiliaryDb/jobJson.api";
import {formatDate} from "@render/utils/common/dateUtils";
import {convertZjJson} from "@render/utils/datacenter/zjJob";
import JsonDataTable from "@render/views/jobCreate/zjJob/components/jsonDataTable.vue";
import {onMounted, ref} from "vue";

const tableDataRef = ref<CommonJsonDataType[]>([])

const isLoading = ref(true)

onMounted(() => {
  tableDataInit()
})

const tableDataInit = (v?: string) => {
  isLoading.value = true
  get_simp_zj_json(v || '').then((res) => {
    tableDataRef.value = res.filter((table: { tableName: string; }) => table.tableName.startsWith('C')).map(
        (v => ({
          id: v.id,
          tableName: v.tableName,
          json: v.simpZjJson,
          updateTime: v.simpZjUpdateTime == null ? '--' : formatDate(v.simpZjUpdateTime)
        })))
  }).finally(() => isLoading.value = false)
}

const isSaving = ref(false)

const handleSave = (model: CommonJsonDataType, searchValue: string) => {
  model.json = convertZjJson(model.json, model.tableName)
  model.tableName = model.tableName.toUpperCase()

  const {
    id,
    tableName,
    json: simpZjJson
  } = model

  update_simp_zj_json({
    id,
    tableName,
    simpZjJson
  }).then(() => {
    window.$message.success('保存成功')
    tableDataInit(searchValue)
  })
}

</script>

<style scoped>

</style>
