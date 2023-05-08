<template>
  <n-grid x-gap="0" :cols="1" style="text-align: center;margin-top: 24px">
    <n-gi span="24">
      <n-button @click="ocr" style="width: 80%">选择图片</n-button>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import {scan} from "@render/api/ocr.api";

const ocr = () => {
  scan()
}

</script>

<style scoped>

</style>
