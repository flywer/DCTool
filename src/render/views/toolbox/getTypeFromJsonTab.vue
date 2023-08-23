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
import {copyText} from "@render/utils/common/clipboard";
import {ref} from 'vue'

const inputValue = ref()
const resultValue = ref()

const trans = () => {
  resultValue.value = generateTypeFromJsonString(inputValue.value)
}

/**
 * 根据提供的 JSON 格式的字符串生成对应的 TypeScript 类型定义
 * @param jsonString JSON 格式的字符串
 * @returns TypeScript 类型定义字符串
 */
const generateTypeFromJsonString = (jsonString: string): string => {
  try {
    const data = JSON.parse(jsonString);
    const typeProperties: string[] = [];

    function parseProperties(obj: any, indent: string = '') {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          typeProperties.push(`${indent}${key}: {`);
          parseProperties(obj[key], `${indent}    `);
          typeProperties.push(`${indent}};`);
        } else {
          const valueType = obj[key] === null ? 'any' : typeof obj[key];
          typeProperties.push(`${indent}${key}: ${valueType === 'string' ? 'string' : valueType};`);
        }
      }
    }

    parseProperties(data);

    return `
type GeneratedType = {
    ${typeProperties.join('\n    ')}
};
`;
  } catch (error) {
    return `// 生成类型时发生错误：${error.message}`;
  }
}
</script>
<style scoped>

</style>
