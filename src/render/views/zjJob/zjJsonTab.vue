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
import {get_zj_json, update_zj_json} from "@render/api/auxiliaryDb/jobJson.api";
import {formatDate} from "@render/utils/common/dateUtils";
import {convertZjJson} from "@render/utils/datacenter/zjJob";
import JsonDataTable from "@render/views/zjJob/components/jsonDataTable.vue";
import {onMounted, ref} from "vue";

const tableDataRef = ref<CommonJsonDataType[]>([])

const isLoading = ref(true)

onMounted(() => {
  tableDataInit()
})

const tableDataInit = (v?: string) => {
  isLoading.value = true
  get_zj_json(v || '').then((res) => {
    tableDataRef.value = res.map(
        (v => ({
          id: v.id,
          tableName: v.tableName,
          json: v.zjJson,
          updateTime: v.zjUpdateTime == null ? '--' : formatDate(v.zjUpdateTime)
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
    json: zjJson
  } = model

  update_zj_json({
    id,
    tableName,
    zjJson
  }).then(() => {
    window.$message.success('保存成功')
    tableDataInit(searchValue)
  })
}

</script>

<style scoped>

</style>
