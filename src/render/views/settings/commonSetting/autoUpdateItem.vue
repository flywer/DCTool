<template>
  <n-card size="small" :style="{borderRadius:'6px',borderColor:'rgb(224 224 233)'}">
    <n-grid :cols="2">
      <n-gi>
        <div class="select-none leading-8">
          <span>自动更新</span>
          <n-text depth="3" class="ml-3">启动时检查更新</n-text>
        </div>
      </n-gi>
      <n-gi>
        <n-space class="h-full" justify="end" align="center">
          <n-switch
              :rubber-band="false"
              :value="appSettings.setup.autoUpdate"
              :loading="loading"
              @update:value="handleUpdateValue"
          />
        </n-space>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import {set_app_settings} from "@render/api/app.api"
import {useAppSettingsStore} from "@render/stores/appSettings";
import {ref} from 'vue'

const appSettings = useAppSettingsStore()

const loading = ref(false)

const handleUpdateValue = (v) => {
  loading.value = true
  set_app_settings({
    autoUpdate: v
  })
      .then(res => {
        appSettings.setup.autoUpdate = v
        if (!res.success) {
          appSettings.setup.autoUpdate = !v
          window.$message.error(res.message)
        }
      })
      .catch(res => {
        window.$message.error(res)
      })
      .finally(() => loading.value = false)
}

</script>

<style scoped>

</style>
