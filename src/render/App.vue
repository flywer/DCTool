<template>
  <n-config-provider
      :locale="zhCN"
      :date-locale="dateZhCN"
  >
    <naive-provider>
      <WindowBtn :show-window-min="true" :show-window-max="user.isLogin" :show-window-close="true"/>
      <MainLayout v-if="user.isLogin"/>
      <LoginLayout v-else/>
    </naive-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import {channels} from "@render/api/channels";
import {useIpc} from '@render/plugins/ipc'
import {useUserStore} from "@render/stores/user";
import {zhCN, dateZhCN} from 'naive-ui';
import NaiveProvider from "@render/components/common/NaiveProvider.vue"
import WindowBtn from "@render/components/base/WindowBar.vue";
import MainLayout from "@render/components/base/MainLayout.vue";
import LoginLayout from "@render/login/index.vue";

const user = useUserStore()

const ipc = useIpc()

ipc.on(channels.login.sendCanLogin, (msg: boolean) => {
  user.isLogin = msg
})

</script>

<style scoped>
</style>

<style>
* {
  font-family: v-sans v-mono;
}
</style>
