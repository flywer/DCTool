<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
    <n-card :content-style="{paddingBottom:0}">
      <n-form-item :span="1" label="数据类型" path="dataType" :size="'small'">
        <n-select
            v-model:value="formModel.dataType"
            placeholder="选择项目"
            :options="dataOptions"
            :consistent-menu-width="false"
            filterable
        />
      </n-form-item>
    </n-card>

    <n-space justify="center" class="mt-2">
      <n-button type="primary" @click="createExcel">生成Excel</n-button>
    </n-space>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {export_credit_publicity_data} from "@render/api/xlsx.api";

const formModel = ref({
  dataType: 'v_ztk_03_sgs_xzcf'
})

const dataOptions = [
  {
    label: '行政处罚',
    value: 'v_ztk_03_sgs_xzcf'
  }
]
const createExcel = () => {
  export_credit_publicity_data(formModel.value.dataType)
}
</script>

<style scoped>

</style>
