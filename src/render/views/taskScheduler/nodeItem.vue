<template>
  <n-card
      hoverable
      draggable="true"
      :content-style="{padding:'10px'}"
  >
    <n-space align="center" >
      <n-icon :size="16" style="line-height: 34px">
        <Cube/>
      </n-icon>
      <div draggable="false">{{ label }}</div>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import {Cube} from '@vicons/carbon'

defineProps({
  label: String
})
</script>

<style scoped>

</style>
