<template>
  <n-layout>
    <n-space vertical justify="center" class="text-center">
       <n-alert type="default" :show-icon="false" style="width: 90%" class="m-auto">
          需装北软绿盾
        </n-alert>
        <n-button @click="decrypt" style="width: 80%"  class="h-12">选择待解密的文件</n-button>
    </n-space>
  </n-layout>

</template>

<script setup lang="ts">
import {ld_decrypt} from "@render/api/ldDecrypt.api";

const decrypt = () => {
  ld_decrypt()
}

</script>

<style scoped>

</style>
