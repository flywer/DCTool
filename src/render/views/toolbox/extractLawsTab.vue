<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 110px);" trigger="hover">
      <n-input
          v-model:value="inputValue"
          type="textarea"
          placeholder=""
          :autosize="{ minRows: 5, maxRows: 8 }"
          :clearable="true"
      />
      <n-space justify="center" class="mt-2">
        <n-button type="primary" class="w-28" @click="trans">确认</n-button>
        <n-button :disabled="resultValue === ''" class="w-28" @click="copyText(resultValue)">
          复制结果
        </n-button>
      </n-space>
      <n-input
          :value="resultValue"
          class="mt-2"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 16 }"
          placeholder=""
          readonly
      />
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {extract} from "@render/api/extractLaws.api";
import {copyText} from "@render/utils/common/clipboard";
import {ref} from 'vue'

const inputValue = ref()
const resultValue = ref()

const trans = () => {
  //resultValue.value = extractLaws(inputValue.value)
  resultValue.value = extractLaws(inputValue.value)
}

// const regex = /(《(.*?)》|(.*?)(?=第))((第.*?章)(.*?)(?=第))?(第.*?条)?(第.*?款)?(第.*?项)?/g;

const extractLaws = (text: string): any => {

  /*   extract(text.split('\n')).then(res => {
      console.log(res)
      if (res.success) {
        const data: string[][] = res.data

       resultValue.value = data.join('\n')

      } else {

      }
    }) */

// 定义一个正则表达式，用于匹配法规引用
  /*     const regex = /((?:《([^》]+)》|[\u4e00-\u9fa5]+)(?:第([^条]+)条)?(?:第([^款]+)款)?(?:第([^项]+)项)?)/g;

      const result = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
          const law = match[2] || match[1]; // 法规名称
          const clause = match[3]; // 条
          const paragraph = match[4]; // 款
          const item = match[5]; // 项
          let lawRef = law;
          if (clause) lawRef += '/' + clause + '条';
          if (paragraph) lawRef += '/' + paragraph + '款';
          if (item) lawRef += '/' + item + '项';
          result.push(lawRef);
      }

      return result; */

   const regex = /(.*?)(\/第.*章)?(\/第.*条)?(\/第.*款)?/;

  const match = regex.exec(text)
  if (match) {
    return match[0];
  }
  return '';
}

</script>
<style scoped>

</style>
