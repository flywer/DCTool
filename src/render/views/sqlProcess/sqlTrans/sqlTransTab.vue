<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px); " trigger="hover">
      <n-alert  type="default" :show-icon="false">
        因为数据中台建表语句的特殊性，现可将原有的MYSQL建表语句转换为TBDS的建表语句
      </n-alert>
      <n-input
          class="mt-2"
          v-model:value="hiveSqlInputRef"
          type="textarea"
          placeholder="输入MYSQL建表语句"
          :clearable="true"
      />
      <n-space justify="center" class="mt-2">
        <n-button type="primary" class="w-28" @click="hiveSqlTrans">转换</n-button>
        <n-button :disabled="hiveSqlResRef === ''" class="w-28" @click="copyText(hiveSqlResRef)">
          复制结果
        </n-button>
      </n-space>
      <n-input
          class="mt-2"
          v-model:value="hiveSqlResRef"
          type="textarea"
          placeholder=""
      />
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {ref} from "vue";
import useClipboard from 'vue-clipboard3';
import {useMessage, FormInst} from 'naive-ui'

const message = useMessage()

const {toClipboard} = useClipboard();

const hiveSqlInputRef = ref('');

const hiveSqlResRef = ref('');

const hiveSqlTrans = () => {

  const lines = hiveSqlInputRef.value.split('\n');

  // 删除以'--'开头的行、空行、CREATE TABLE行、主键行、DROP TABLE行、PRIMARY KEY (id)
  let new_lines = lines.filter(line => !line.startsWith('--')
      && !line.startsWith('\n')
      && !line.startsWith('CREATE TABLE')
      && !line.startsWith('create table')
      && !line.startsWith('DROP TABLE')
      && !line.startsWith('drop table')
      && !line.endsWith('PRIMARY KEY,')
      && !line.endsWith('primary key,')
      && !line.endsWith('PRIMARY KEY (id)')
      && !line.endsWith('primary key (id)')
  );

  // 格式化id这一行
  for (let i = 0; i < new_lines.length; i++) {
    if (new_lines[i].trim().startsWith('id') || new_lines[i].trim().startsWith('`id`')) {
      new_lines[i] = '    ID INT COMMENT \'标识ID\','
    }
  }

  // 重新组合字符串
  const new_string = new_lines.join('\n');

  const trans_string = new_string
      .replace(/varchar/gi, 'VARCHAR') // varchar 格式化
      .replace(/comment/gi, 'COMMENT') // comment 格式化
      .replace(/text/gi, 'STRING') // text 格式化
      .replace(/comment =/gi, 'COMMENT') // comment = 转为 COMMENT
      .replace(/datetime/gi, 'TIMESTAMP') // datetime转为TIMESTAMP
      .replace(/date/gi, 'DATE') // date 格式化
      .replace(/not null|null/gi, '') // 删除无法识别的关键词
      .replace(/int(\(.*\))?/gi, 'INT') // int无需长度
      .replace(/decimal(\(.*\))?/gi, 'STRING') // decimal转换
      .replace(/;.*'/g, '\'') // 清除多余注释
      .replace(";", " ROW FORMAT DELIMITED FIELDS TERMINATED BY '|' STORED AS ORC ") // 添加hive建表语句
      .replace(/\n\s*\n/g, '\n')// 删除多余空行
      .replace(/`/g, '')// 删除`

  // 将多个空格转为一个空格
  hiveSqlResRef.value = trans_string.replace(/\s+/g, (match) => {
    if (match.includes('\n')) { // 如果包含换行符则不替换
      return match;
    }
    return ' ';
  });

}

const copyText = async (text) => {
  await toClipboard(text);
  message.success('复制成功')
}
</script>

<style scoped>

</style>
