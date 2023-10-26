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
  resultValue.value = extractLaws(inputValue.value).join('\n')
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

  const regex = /(《(.*?)》|(\S+?)\/)(第(.*?)章)?\/?(第(.*?)条)?\/?(第(.*?)款)?\/?(第(.*?)项)?/g;
  let match;
  let results = [];

  while ((match = regex.exec(text)) !== null) {
    let result = {
      law: match[2] || match[3],
      chapter: match[5],
      clause: match[7],
      item: match[9],
      subItem: match[11]
    };
    results.push(result);
  }

   return results.map((v) => `${v.law}/${v.chapter}/${v.clause}/${v.item}/${v.subItem}`)
}

</script>
<style scoped>

</style>
