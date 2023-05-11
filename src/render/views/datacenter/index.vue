<template>
  <n-layout style="padding-left: 20px;padding-right: 20px;margin-top: 20px">
    <n-tabs type="line" animated>
      <n-tab-pane name="1" tab="Hive建表语句转换">
        <n-alert title="说明" type="default" :show-icon="false">
          因为数据中台建表语句的特殊性，现可将原有的MYSQL建表语句转换为TBDS的建表语句，注意decimal类型没有自动转换，可自行手动改为varchar或者string
        </n-alert>
        <n-input
            style="margin-top: 20px"
            v-model:value="hiveSqlInputRef"
            type="textarea"
            placeholder="输入MYSQL建表语句"
            :clearable="true"
        />
        <n-space justify="center" style="margin-top: 20px">
          <n-button type="primary" style="width: 120px" @click="hiveSqlTrans">转换</n-button>
          <n-button :disabled="hiveSqlResRef === ''" style="width: 120px" @click="copyText(hiveSqlResRef)">
            复制结果
          </n-button>
        </n-space>
        <n-input
            style="margin-top: 20px"
            v-model:value="hiveSqlResRef"
            type="textarea"
            placeholder=""
        />
      </n-tab-pane>
      <n-tab-pane name="2" tab="质检JSON生成">
        <n-alert title="说明" type="default" :show-icon="false">
          对于相同结构的表，没有必要每次都建一遍质检任务，在这里粘贴一个原始新建的质检任务JSON，即可生成万用的同表结构的JSON，只需自己修改任务名
        </n-alert>
        <n-input
            style="margin-top: 20px"
            v-model:value="validJsonInputRef"
            type="textarea"
            placeholder="输入原始JSON"
            :clearable="true"
        />
        <n-space justify="center" style="margin-top: 20px">
          <n-button type="primary" style="width: 120px" @click="validJsonTrans">转换</n-button>
          <n-button :disabled="validJsonResRef === ''" style="width: 120px" @click="copyText(validJsonResRef)">
            复制结果
          </n-button>
        </n-space>
        <n-input
            style="margin-top: 20px"
            v-model:value="validJsonResRef"
            type="textarea"
            placeholder=""
        />
      </n-tab-pane>
      <!--       <n-tab-pane name="jay chou" tab="周杰伦">
             七里香
           </n-tab-pane>-->
    </n-tabs>
  </n-layout>

</template>

<script setup lang="ts">
import {ref} from "vue";
import {uuid} from "vue3-uuid";
import useClipboard from 'vue-clipboard3';
import {useMessage} from 'naive-ui'

const message = useMessage()

const {toClipboard} = useClipboard();

const copyText = async (text) => {
  await toClipboard(text);
  message.success('复制成功')
}

const hiveSqlInputRef = ref('');

const hiveSqlResRef = ref('');

const hiveSqlTrans = () => {

  const lines = hiveSqlInputRef.value.split('\n');

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
      .replace(/datetime/g, 'TIMESTAMP') // datetime转为TIMESTAMP
      .replace(/date/g, 'DATE') // varchar 格式化
      .replace(/NOT NULL|NULL/g, '') // 删除无法识别的关键词
      .replace(/int(\(.*\))?/g, 'INT') // int无需长度
      .replace(/;.*'/g, '\'') // 清除多余注释
      .replace(";", " ROW FORMAT DELIMITED FIELDS TERMINATED BY '|' STORED AS ORC ") // 添加hive建表语句
      .replace(/\n\s*\n/g, '\n');// 删除多余空行

  // 将多个空格转为一个空格
  hiveSqlResRef.value = trans_string.replace(/\s+/g, (match) => {
    if (match.includes('\n')) { // 如果包含换行符则不替换
      return match;
    }
    return ' ';
  });

}

const validJsonInputRef = ref('');

const validJsonResRef = ref('');

const validJsonTrans = () => {
  // 去除多于属性的JSON对象
  const json = removeIds(JSON.parse(validJsonInputRef.value))

  validJsonResRef.value = updateSjkUUID(json)

}

// 更新其中sjk开头的uuid
const updateSjkUUID = (json) => {
  let xmlIds: string[] = []
  json.modelXml.match(/id="sjk[^"]*"/g).forEach(idStr => {
    xmlIds.push(idStr.replace(/id="|"/g, ''));
  })

  let jsonIds: string[] = []
  json.modelJson.match(/"id":"sjk[^"]*"/g).forEach(idStr => {
    jsonIds.push(idStr.replace(/"id":"|"/g, ''));
  })

  const mergeArr = mergeArrays(xmlIds, jsonIds)

  let jsonStr = JSON.stringify(json, null, 2)

  for (const i of mergeArr) {
    if (jsonStr.includes(i)) {
      const uuidStr = 'sjk' + uuid.v4().replace(/-/g, '');
      jsonStr = jsonStr.replaceAll(i, uuidStr);
    }
  }

  return jsonStr
}

function removeIds(obj: unknown) {
  if (Array.isArray(obj)) {
    return obj.map(removeIds);
  } else if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key !== 'id' && key !== 'fromTableSourceList' && key !== 'validate') {
        result[key] = removeIds(value);
      }
    }
    return result;
  } else {
    return obj;
  }
}

function mergeArrays(arr1: string[], arr2: string[]): string[] {
  const mergedArray = [...arr1, ...arr2];
  return Array.from(new Set(mergedArray));
}

</script>

<style scoped>

</style>
