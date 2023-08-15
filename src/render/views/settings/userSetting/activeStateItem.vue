<template>
  <n-card size="small" :style="{borderRadius:'6px',borderColor:'rgb(224 224 233)'}">
    <n-grid :cols="2">
      <n-gi>
        <div class="select-none leading-8">
          <span>激活状态</span>
        </div>
      </n-gi>
      <n-gi>
        <n-space class="h-full" justify="end" align="center">
          <n-tag type="success">
            永久激活
            <template #icon>
              <n-icon>
                <CheckmarkCircle/>
              </n-icon>
            </template>
          </n-tag>
        </n-space>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import {useUserStore} from "@render/stores/user";
import {CheckmarkCircle} from '@vicons/ionicons5'

const user = useUserStore()
</script>

<style scoped>

</style>
