<template>
  <n-scrollbar style="height: calc(100vh - 111px);" trigger="hover">
    <n-layout class="pl-2 pr-2 tab-background-color">
      <n-grid :cols="1" :y-gap="12">
        <n-gi>
          <theme-item/>
        </n-gi>

      </n-grid>
    </n-layout>
  </n-scrollbar>
</template>

<script setup lang="ts">
import ThemeItem from "@render/views/settings/uiSetting/themeItem.vue";
</script>

<style scoped>

</style>
