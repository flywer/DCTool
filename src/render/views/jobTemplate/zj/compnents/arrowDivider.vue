<template>
  <div style="height: calc(100vh - 145px);width:18px" class="relative">
    <n-divider class="block absolute" vertical style="top: 0;height: 49.2%;"/>
    <div class="text-center absolute" style="top: 50%;transform: translateY(-50%);left:2px">
      <n-icon>
        <IosArrowRtl24Regular style="color: rgb(203,203,208)"/>
      </n-icon>
    </div>
    <n-divider class="block absolute" vertical style="bottom: 0;height: 49.5%;"/>
  </div>
</template>

<script setup lang="ts">
import {IosArrowRtl24Regular} from "@vicons/fluent";
import {NIcon} from "naive-ui";
</script>

<style scoped>

</style>
