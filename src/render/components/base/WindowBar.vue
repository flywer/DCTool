<!-- 窗口的右上角三个操作按钮 -->
<template>
  <n-layout id="window-bar" :class="darkMode!=null?(darkMode?'window-bar-dark':'window-bar-light'):('')">
    <n-layout-content>
      <n-grid :cols="2">
        <n-gi>
          <n-space justify="start" inline>
            <span class="ml-4" style="line-height: 32px;font-family: 'Microsoft PhagsPa'"
            >{{ title }}</span>
          </n-space>
        </n-gi>
        <n-gi>
          <n-space justify="end" class="h-full float-right" id="btn-group" inline>
            <n-button-group class="h-full">
              <n-button size="tiny" :bordered=false class="window-btn" style="height: 100%;" @click="window_min"
                        v-if="showWindowMin"
              >
                <n-icon style="font-size: large">
                  <MinusOutlined/>
                </n-icon>
              </n-button>
              <n-button size="tiny" :bordered=false class="window-btn" style="height: 100%;" @click="window_max"
                        v-if="showWindowMax"
              >
                <n-icon style="font-size: large;">
                  <BorderOutlined/>
                </n-icon>
              </n-button>
              <n-button size="tiny" :bordered=false class="window-btn close-btn" style="height: 100%;"
                        @click="window_close"
                        v-if="showWindowClose"
              >
                <template #icon>
                  <n-icon>
                    <CloseOutlined/>
                  </n-icon>
                </template>
              </n-button>
            </n-button-group>
          </n-space>
        </n-gi>
      </n-grid>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import {get_app_version} from "@render/api/app.api";
import {channels} from "@render/api/channels";
import {should_use_dark_theme} from "@render/api/sys.api";
import {useIpc} from "@render/plugins";
import {useAppSettingsStore} from "@render/stores/appSettings";
import {MinusOutlined, BorderOutlined, CloseOutlined} from "@vicons/antd";
import {window_max, window_min, window_close} from "@render/api/window.api";
import {darkTheme} from "naive-ui";
import {onMounted, ref, watch} from 'vue'

const appSettings = useAppSettingsStore()

const ipc = useIpc()

const props = defineProps({
  showTitle: Boolean,
  showBgColor: Boolean,
  showWindowMin: Boolean,
  showWindowMax: Boolean,
  showWindowClose: Boolean
})

// 背景颜色模式   false为浅色
const darkMode = ref(null)
const title = ref('')

onMounted(() => {
  setTitle()
  setBackGroundColor()
})

watch(() => props.showBgColor, (v) => {
  setBackGroundColor()
})

watch(() => props.showTitle, (v) => {
  setTitle()
})

const getTheme = async () => {
  if (appSettings.setup?.themeAccentColor) {
    if (appSettings.setup.themeAccentColor == 'followSys') {
      return (await should_use_dark_theme()) ? darkTheme : null
    } else if (appSettings.setup.themeAccentColor == 'light') {
      return null
    } else {
      return darkTheme
    }
  } else {
    return (await should_use_dark_theme()) ? darkTheme : null
  }
}

const setBackGroundColor = async () => {
  if (props.showBgColor) {
    const theme = await getTheme()
    darkMode.value = theme != null;
  } else {
    darkMode.value = null
  }
}

ipc.on(channels.app.updateTheme, () => {
  setBackGroundColor()
})

const setTitle = async () => {
  if (props.showTitle) {
    get_app_version().then(res => {
      if (res.success) {
        title.value = `数据归集辅助工具 v${res.data}`
      } else {
        title.value = `数据归集辅助工具`
      }
    })
  } else {
    title.value = ''
  }
}

</script>

<style scoped lang="less">
#window-bar {
  -webkit-app-region: drag; /*头部可拖动*/
  //background-color: transparent; /*transparent*/
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 32px;
  z-index: 1000;
  user-select: none;

  .n-layout-content {
    background-color: transparent;
  }

  //按钮
  .window-btn {
    -webkit-app-region: no-drag;
    width: 47px;
    height: 26px;
    border-radius: 0;
  }

  //取消按钮自带的动画
  :deep(.n-button > .n-base-wave) {
    animation: none;
  }

  //关闭窗口按钮 动画特殊
  .close-btn:hover {
    background-color: #ec4f4f;

    .n-icon {
      color: white;
    }
  }
}

.window-bar-light {
  background-color: rgb(245 245 245);

  //背景色变换
  :deep(.n-button):hover {
    background-color: #e7e7e7;
  }

  // 设置图标默认颜色
  :deep(.n-icon) {
    color: rgb(51, 54, 57);
  }
}

.window-bar-dark {
  background-color: #000000;

  //背景色变换
  :deep(.n-button):hover {
    background-color: #545454;
  }

  // 设置图标默认颜色
  :deep(.n-icon) {
    color: #e8e8e8;
  }
}
</style>
