<template>
  <n-layout style="padding-left: 20px;padding-right: 20px;margin-top: 20px">
    <n-tabs type="line" animated>
      <n-tab-pane name="oasis" tab="建表语句转换">
        <n-input
            v-model:value="inputValue"
            type="textarea"
            placeholder=""
            :autosize="{
        minRows: 5,
        maxRows: 50
      }"
            :clearable="true"
        />
        <n-space justify="center" style="margin-top: 20px">
          <n-button style="width: 120px" @click="trans">转换</n-button>
        </n-space>
        <n-input
            style="margin-top: 20px"
            v-model:value="transValue"
            type="textarea"
            placeholder=""
            :autosize="{
        minRows: 5,
        maxRows: 50
      }"
            :clearable="true"
        />
      </n-tab-pane>
<!--      <n-tab-pane name="the beatles" tab="the Beatles">
        Hey Jude
      </n-tab-pane>
      <n-tab-pane name="jay chou" tab="周杰伦">
        七里香
      </n-tab-pane>-->
    </n-tabs>
  </n-layout>

</template>

<script setup lang="ts">
import {ref} from "vue";

const activeKey = ref('1')

const inputValue = ref('');

const transValue = ref('');

const trans = () => {

  const lines = inputValue.value.split('\n');

  // 删除以'--'开头的行、空行、CREATE TABLE行、主键行
  let new_lines = lines.filter(line => !line.startsWith('--') && !line.startsWith('\n') && !line.startsWith('CREATE TABLE') && !line.endsWith('PRIMARY KEY,'));

  // 格式化id这一行
  for (let i = 0; i < new_lines.length; i++) {
    if (new_lines[i].trim().startsWith('id')) {
      new_lines[i] = '    id INT COMMENT \'标识ID\','
    }
  }

  // 重新组合字符串
  const new_string = new_lines.join('\n');

  const trans_string = new_string
      .replace(/varchar/g, 'VARCHAR') // varchar 格式化
      .replace(/NOT NULL|NULL/g, '') // 删除无法识别的关键词
      .replace(/datetime/g, 'TIMESTAMP') // datetime转为TIMESTAMP
      .replace(/int\(.*\)/g, 'INT') // int无需长度
      .replace(/;.*'/g, '\'') // 清除多余注释
      .replace(";", " ROW FORMAT DELIMITED FIELDS TERMINATED BY '|' STORED AS ORC ") // 添加hive建表语句
      .replace(/\n\s*\n/g, '\n');// 删除多余空行

  // 将多个空格转为一个空格
  transValue.value = trans_string.replace(/\s+/g, (match) => {
    if (match.includes('\n')) { // 如果包含换行符则不替换
      return match;
    }
    return ' ';
  });

}


</script>

<style scoped>

</style>
