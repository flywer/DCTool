<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <n-space vertical justify="center" class="text-center">
        <n-alert type="default" :show-icon="false" class="m-auto">
          需安装北软绿盾
        </n-alert>
        <n-button @click="decrypt" class="h-12">选择待解密的文件</n-button>
      </n-space>
    </n-scrollbar>
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
