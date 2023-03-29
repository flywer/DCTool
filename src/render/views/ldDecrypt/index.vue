<template>
  <n-grid x-gap="0" :cols="1" style="text-align: center;margin-top: 24px">
    <n-gi span="24">
      <n-button @click="decrypt" style="width: 80%">选择待解密的文件</n-button>
    </n-gi>
  </n-grid>

</template>

<script setup lang="ts">

import {ld_decrypt} from "@render/api/ldDecrypt.api";

const decrypt = () => {
  ld_decrypt()
}

</script>

<style scoped>

</style>
