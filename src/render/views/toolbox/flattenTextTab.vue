<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <n-input
          v-model:value="inputValue"
          type="textarea"
          placeholder=""
          :autosize="{ minRows: 5, maxRows: 8 }"
          :clearable="true"
      />
      <n-space justify="center" class="mt-2">
        <n-button type="primary" class="w-28" @click="trans">确认</n-button>
        <n-button :disabled="resValue === ''" class="w-28" @click="copyText(resValue)">
          复制结果
        </n-button>
      </n-space>
      <n-space class="mt-2">
        <n-text>扁平化：</n-text>
      </n-space>

      <n-input
          :value="resValue"
          class="mt-2"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 3 }"
          placeholder=""
          readonly
      />
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {copyText} from "@render/utils/common/clipboard";
import {ref} from 'vue'

const inputValue = ref('');
const resValue = ref('');
const trans = () => {
  resValue.value = inputValue.value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
}

</script>

<style scoped>

</style>
