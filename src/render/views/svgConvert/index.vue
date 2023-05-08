<template>
  <n-layout style="padding-left: 20px;padding-right: 20px;margin-top: 20px">
    <n-input
        v-model:value="inputValue"
        type="textarea"
        placeholder="请输入SVG标签"
        :autosize="{
        minRows: 3,
        maxRows: 7
      }"
        :clearable="true"
    />
    <n-space justify="center" style="margin-top: 20px">
      <n-button style="width: 80px" @click="submit">确认</n-button>
    </n-space>
    <n-space style="margin-top: 20px;">
      <n-text>base64编码：</n-text>
    </n-space>

    <n-input :value="base64Value" type="textarea" :autosize="{
        minRows: 2,
        maxRows: 7
      }" style="margin-top: 10px" placeholder=""  readonly
    ></n-input>
  </n-layout>
</template>

<script setup lang="ts">
import {save_svg_file} from "@render/api/svg.api";
import {svgStringToBase64} from "@render/utils/common/svgToBase64";
import {ref} from 'vue'
import {useMessage} from 'naive-ui'

const message = useMessage()
const inputValue = ref('');
const base64Value = ref('');
const submit = () => {
  if (isSvgTag(inputValue.value)) {
    const base64Str = svgStringToBase64(inputValue.value)
    base64Value.value = base64Str
    save_svg_file(base64Str)
  } else {
    message.error('这不是svg标签')
  }
}

function isSvgTag(str) {
  const svgRegex = /^<svg([\w\W]+?)<\/svg>$/;
  const xmlnsRegex = /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/;

  return svgRegex.test(str) && xmlnsRegex.test(str);
}
</script>

<style scoped>

</style>
