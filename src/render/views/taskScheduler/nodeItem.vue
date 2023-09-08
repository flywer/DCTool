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
.card {
  border: 2px solid #7979b7;
  margin: 0 auto;
  display: flex;
  padding: 4px 0 0 4px;
  flex-wrap: wrap;
  align-items: center;
}
</style>
