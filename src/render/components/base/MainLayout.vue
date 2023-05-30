<template>
  <n-layout has-sider style="margin-top: 32px;">
    <n-layout-sider
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
import {routeName} from "@render/router";
import {h, ref} from 'vue'
import type {MenuOption, MenuInst} from 'naive-ui'
import {RouterLink} from "vue-router";
import {HomeOutlined} from '@vicons/antd'
import {AccessibleIcon} from '@vicons/fa'
import {VisualRecognition, Svg, DataVis3, Sql} from '@vicons/carbon'
import {LetterF, LetterH} from '@vicons/tabler'
import {TextGrammarCheckmark24Regular} from '@vicons/fluent'
import {renderIcon} from "@render/utils/common/renderIcon";

// 菜单项
const menuOptions: MenuOption[] = [
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.datacenter,
              }
            },
            {default: () => 'JSON生成'}
        ),
    key: routeName.datacenter,
    icon: renderIcon(DataVis3)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.hiveSqlTrans,
              }
            },
            {default: () => 'SQL转换'}
        ),
    key: routeName.hiveSqlTrans,
    icon: renderIcon(LetterH)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.execSql,
              }
            },
            {default: () => 'SQL执行'}
        ),
    key: routeName.execSql,
    icon: renderIcon(Sql)
  },
  {
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: routeName.sqlValid,
              }
            },
            {default: () => 'SQL校验'}
        ),
    key: routeName.sqlValid,
    icon: renderIcon(TextGrammarCheckmark24Regular)
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
                name: routeName.ocr,
              }
            },
            {default: () => 'OCR'}
        ),
    key: routeName.ocr,
    icon: renderIcon(VisualRecognition)
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
]

// 菜单实例
const menuInstRef = ref<MenuInst | null>(null)
// 默认选中的菜单
const selectedKey = ref(menuOptions[0].key)
// 菜单是否折叠
const collapsed = ref(false)

const containerRef = ref<HTMLElement | undefined>(undefined)
</script>
