<template>
  <n-card
      hoverable
      draggable="true"
      :content-style="{padding:'8px'}"
  >
    <n-space align="center" style="width: 100px">
      <n-icon :size="16" style="padding-top: 8px">
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
