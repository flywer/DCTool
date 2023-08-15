<template>
  <n-layout class="m-2">
    <n-tabs type="line" animated>
      <n-tab-pane class="tab-background-color" name="1" tab="用户设置">
        <user-setting-tab/>
      </n-tab-pane>
      <n-tab-pane class="tab-background-color" name="2" tab="通用设置">
        <common-setting-tab/>
      </n-tab-pane>
      <n-tab-pane class="tab-background-color" name="3" tab="界面设置">
        <ui-setting-tab/>
      </n-tab-pane>
    </n-tabs>
  </n-layout>
</template>

<script setup lang="ts">
import CommonSettingTab from "@render/views/settings/commonSetting/commonSettingTab.vue";
import UiSettingTab from "@render/views/settings/uiSetting/uiSettingTab.vue";
import UserSettingTab from "@render/views/settings/userSetting/userSettingTab.vue";
</script>

<style>
</style>
