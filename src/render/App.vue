<template>
  <n-config-provider
      class="h-full"
      :locale="zhCN"
      :date-locale="dateZhCN"
      :theme="theme"
  >
    <naive-provider>
      <router-view/>
    </naive-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import {SetupModelType} from "@common/types";
import {get_app_settings} from "@render/api/app.api";
import {channels} from "@render/api/channels";
import {should_use_dark_theme} from "@render/api/sys.api";
import {useIpc} from "@render/plugins";
import {useAppSettingsStore} from "@render/stores/appSettings";
import {zhCN, dateZhCN, darkTheme} from 'naive-ui';
import NaiveProvider from "@render/components/common/NaiveProvider.vue"
import {ref} from 'vue'

const appSettings = useAppSettingsStore()

const theme = ref(null)

const ipc = useIpc()

// 应用设置
get_app_settings().then(async res => {
  if (res.success) {
    appSettings.setup = res.data as SetupModelType
    await updateTheme()
  } else {
    window.$message.error(res.message)
  }
})

const updateTheme = async () => {
  if (appSettings.setup?.themeAccentColor) {
    if (appSettings.setup.themeAccentColor == 'followSys') {
      theme.value = (await should_use_dark_theme()) ? darkTheme : null
    } else if (appSettings.setup.themeAccentColor == 'light') {
      theme.value = null
    } else {
      theme.value = darkTheme
    }
  } else {
    theme.value = (await should_use_dark_theme()) ? darkTheme : null
  }
}

ipc.on(channels.app.updateTheme, () => {
  updateTheme()
})


</script>

<style scoped>
</style>

<style>
* {
  font-family: v-sans v-mono;
}
</style>
