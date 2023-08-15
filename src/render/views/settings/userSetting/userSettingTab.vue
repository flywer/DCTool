<template>
  <n-scrollbar style="height: calc(100vh - 111px);" trigger="hover">
    <n-layout class="pl-2 pr-2 tab-background-color">
      <n-grid :cols="1" :y-gap="12">
        <n-gi>
          <user-account-info-item/>
        </n-gi>
        <n-gi>
          <dc-auth-token-item/>
        </n-gi>
        <n-gi>
          <active-state-item/>
        </n-gi>
      </n-grid>
    </n-layout>
  </n-scrollbar>
</template>

<script setup lang="ts">
import ActiveStateItem from "@render/views/settings/userSetting/activeStateItem.vue";
import DcAuthTokenItem from "@render/views/settings/userSetting/dcAuthTokenItem.vue";
import UserAccountInfoItem from "@render/views/settings/userSetting/userAccountInfoItem.vue";
</script>

<style>

</style>
