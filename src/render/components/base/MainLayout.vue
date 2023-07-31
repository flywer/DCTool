<template>
  <n-layout has-sider style="margin-top: 32px;">
    <n-layout-sider
        class="select-none"
        collapse-mode="width"
        :collapsed-width="64"
        :width="145"
        :collapsed="collapsed"
        :show-trigger="false"
        @collapse="collapsed = true"
        @expand="collapsed = false"
    >
      <n-scrollbar style="height: calc(100vh - 32px);" trigger="hover">
        <n-menu
            ref="menuInstRef"
            v-model:value="selectedKey"
            :collapsed="collapsed"
            :collapsed-width="74"
            :collapsed-icon-size="22"
            :options="menuOptions"
        />
      </n-scrollbar>
    </n-layout-sider>

    <n-layout style="height:100%">
      <n-message-provider>
        <router-view/>
      </n-message-provider>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import {channels} from "@render/api/channels";
import {useIpc} from "@render/plugins";
import {routeName} from "@render/router";
import {useNotification} from "naive-ui";
import {h, ref} from 'vue'
import type {MenuOption, MenuInst} from 'naive-ui'
import {RouterLink} from "vue-router";
import {AccessibleIcon} from '@vicons/fa'
import {Svg, Sql, DataBase} from '@vicons/carbon'
import {LetterF} from '@vicons/tabler'
import {LibraryAddOutlined} from '@vicons/material'
import {AppsListDetail20Filled, BookSearch24Regular,CalendarClock24Regular,TableAdd16Regular} from '@vicons/fluent'
import {SettingsOutline, StatsChartOutline} from '@vicons/ionicons5'
import {ProjectOutlined} from '@vicons/antd'
import {renderIcon} from "@render/utils/common/renderIcon";

const notification = useNotification()

// 菜单项
const menuOptions: MenuOption[] = [
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.projectMgt,
              }
            },
            {default: () => '任务管理'}
        ),
    key: routeName.projectMgt,
    icon: renderIcon(AppsListDetail20Filled)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.jobCreate,
              }
            },
            {default: () => '任务创建'}
        ),
    key: routeName.jobCreate,
    icon: renderIcon(LibraryAddOutlined)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.createTable,
              }
            },
            {default: () => '中台建表'}
        ),
    key: routeName.createTable,
    icon: renderIcon(TableAdd16Regular)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.schedulingMgt,
              }
            },
            {default: () => '调度管理'}
        ),
    key: routeName.schedulingMgt,
    icon: renderIcon(CalendarClock24Regular)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.sqlProcess,
              }
            },
            {default: () => 'SQL处理'}
        ),
    key: routeName.sqlProcess,
    icon: renderIcon(Sql)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.projectAbbr,
              }
            },
            {default: () => '项目简称'}
        ),
    key: routeName.projectAbbr,
    icon: renderIcon(ProjectOutlined)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.preDatabase,
              }
            },
            {default: () => '前置机'}
        ),
    key: routeName.preDatabase,
    icon: renderIcon(DataBase)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.dataStat,
              }
            },
            {default: () => '数据统计'}
        ),
    key: routeName.dataStat,
    icon: renderIcon(StatsChartOutline)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.sztkDict,
              }
            },
            {default: () => '字典表'}
        ),
    key: routeName.sztkDict,
    icon: renderIcon(BookSearch24Regular)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.ldDecrypt,
              }
            },
            {default: () => '绿盾解密'}
        ),
    key: routeName.ldDecrypt,
    icon: renderIcon(AccessibleIcon)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.flattenText,
              }
            },
            {default: () => '文本扁平'}
        ),
    key: routeName.flattenText,
    icon: renderIcon(LetterF)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.svg,
              }
            },
            {default: () => 'SVG转换'}
        ),
    key: routeName.svg,
    icon: renderIcon(Svg)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.settings,
              }
            },
            {default: () => '应用设置'}
        ),
    key: routeName.settings,
    icon: renderIcon(SettingsOutline)
  }
]

// 菜单实例
const menuInstRef = ref<MenuInst | null>(null)
// 默认选中的菜单
const selectedKey = ref(menuOptions[0].key)
// 菜单是否折叠
const collapsed = ref(false)

const ipc = useIpc()

ipc.on(channels.datacenter.authTokenNotice, (msg: string) => {
  notification.destroyAll()

  notification.create({
    title: "访问令牌出错",
    content: msg,
    type: "warning"
  })
})
</script>
