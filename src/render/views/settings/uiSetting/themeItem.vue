<template>
  <n-card size="small" :style="{borderRadius:'6px',borderColor:'rgb(224 224 233)'}">
    <n-grid :cols="2">
      <n-gi>
        <div class="select-none leading-8">
          <span>主题</span>
        </div>
      </n-gi>
      <n-gi>
        <n-space class="h-full" justify="end" align="center">
          <n-select
              v-model:value="selectValue"
              :options="options"
              @update:value="handleUpdateValue"
              style="width: 120px"
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

const selectValue = ref(appSettings.setup?.themeAccentColor || 'followSys')
const options = ref([
  {
    label: "跟随系统",
    value: 'followSys'
  },
  {
    label: "浅色",
    value: 'light'
  },
  {
    label: "深色",
    value: 'dark'
  },
])

const handleUpdateValue = (v) => {
  const appSettingsBackUp = appSettings.setup
  appSettings.setup.themeAccentColor = v

  set_app_settings({
    themeAccentColor: v
  })
      .then(res => {
        if (!res.success) {
          appSettings.setup = appSettingsBackUp
          window.$message.error(res.message)
        }
      })
      .catch(res => {
        window.$message.error(res)
      })
}

</script>

<style scoped>

</style>
