<template>
  <WindowBar
      :show-bg-color="user.isLogin"
      :show-title="user.isLogin"
      :show-window-min="true"
      :show-window-max="user.isLogin"
      :show-window-close="true"
  />
  <MainLayout v-if="user.isLogin"/>
  <LoginLayout v-else/>
</template>

<script setup lang="ts">
import {channels} from "@render/api/channels";
import {useIpc} from '@render/plugins/ipc'
import {useUserStore} from "@render/stores/user";
import WindowBar from "@render/components/base/WindowBar.vue";
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
