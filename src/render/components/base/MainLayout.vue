<template>
  <n-layout has-sider class="mt-8">
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

    <n-layout class="h-full">
      <router-view/>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import {quit_and_install} from "@render/api/app.api";
import {channels} from "@render/api/channels";
import {useIpc} from "@render/plugins";
import {routeName} from "@render/router";
import {NIcon, useNotification, NButton} from "naive-ui";
import {h, onMounted, ref} from 'vue'
import type {MenuOption, MenuInst} from 'naive-ui'
import {RouterLink, useRouter} from "vue-router";
import {Sql, DataBase} from '@vicons/carbon'
import {LibraryAddOutlined} from '@vicons/material'
import {
  AppsListDetail24Regular,
  BookSearch24Regular,
  CalendarClock24Regular,
  TableAdd24Regular,
  Toolbox24Regular,
  Organization24Regular,
TaskListLtr24Regular
} from '@vicons/fluent'
import {SettingsOutline, StatsChartOutline} from '@vicons/ionicons5'
import {ProjectOutlined} from '@vicons/antd'
import {renderIcon} from "@render/utils/common/renderIcon";

const notification = useNotification()

const router = useRouter()

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
    icon: renderIcon(AppsListDetail24Regular)
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
                name: routeName.jobDependency,
              }
            },
            {default: () => '任务依赖'}
        ),
    key: routeName.jobDependency,
    icon: () => h(NIcon, {class: '-rotate-90'}, {default: () => h(Organization24Regular)})
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
    icon: renderIcon(TableAdd24Regular)
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
                name: routeName.taskScheduler,
              }
            },
            {default: () => '任务调度'}
        ),
    key: routeName.taskScheduler,
    icon: renderIcon(TaskListLtr24Regular)
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
                name: routeName.toolbox,
              }
            },
            {default: () => '工具箱'}
        ),
    key: routeName.toolbox,
    icon: renderIcon(Toolbox24Regular)
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
const selectedKey = ref(routeName.projectMgt)
// 菜单是否折叠
const collapsed = ref(false)

onMounted(() => {
  router.push({name: routeName.projectMgt});
})

const ipc = useIpc()

ipc.on(channels.datacenter.authTokenNotice, (msg: string) => {
  notification.create({
    title: "访问令牌出错",
    content: msg,
    type: "warning"
  })
})

ipc.on(channels.app.sendAppInstallNotice, () => {
  notification.create({
    title: "应用更新",
    content: () => {
      return h('div', {}, [
        '新版本下载完毕！',
        h(NButton, {
          quaternary: true,
          type: 'info',
          size: 'small',
          onClick: () => {
            quit_and_install()
          }
        }, () => '立即安装')
      ])
    },
    type: "success"
  })
})
</script>
