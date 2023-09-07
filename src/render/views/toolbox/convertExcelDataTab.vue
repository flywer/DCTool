<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">

      <n-card :content-style="{paddingBottom:0}">
        <n-form-item :span="1" label="表名" path="tableName" :size="'small'">
          <n-input v-model:value="formModel.tableName" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item>
      </n-card>

      <n-space justify="center" class="mt-2">
        <n-button type="primary" @click="convert">选择待提取的文件</n-button>
        <n-button :disabled="resValue === ''" class="w-28" @click="copyText(resValue)">
          复制结果
        </n-button>
      </n-space>
      <n-input
          :value="resValue"
          class="mt-2"
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 24 }"
          placeholder=""
          readonly
      />
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {generate_insert_statements} from "@render/api/xlsx.api";
import {copyText} from "@render/utils/common/clipboard";
import {ref} from 'vue'

const formModel = ref({
  tableName: ''
})

const resValue = ref('')

const convert = async () => {
  resValue.value = await generate_insert_statements(formModel.value.tableName)
}
</script>

<style scoped>

</style>
