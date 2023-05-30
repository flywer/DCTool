<template>
  <n-layout style="margin: 10px 10px 0 10px">
    <n-scrollbar style="height: calc(100vh - 42px); padding-right: 10px;" trigger="hover">
      <n-alert title="说明" type="default" :show-icon="false">
        只可用于执行
        <n-tooltip trigger="hover">
          <template #trigger>
              <n-text type="success">DML</n-text>
          </template>
          常见的DML语句包括INSERT、UPDATE、DELETE等
        </n-tooltip>
        、
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-text type="success">DDL</n-text>
          </template>
          常见的DDL语句包括CREATE、ALTER、DROP等
        </n-tooltip>
      </n-alert>
      <n-card style="margin-top: 10px" :content-style="{paddingBottom:0}">
        <n-form ref="formRef"
                inline
                :size="'small'"
                :model="formModel"
                :rules="rules"
                label-placement="left"
        >
          <n-grid :cols="1" :x-gap="12">
            <n-form-item-gi label="数据源" path="dataSourceId">
              <n-select
                  v-model:value="formModel.dataSourceId"
                  :options="datasourceOptions"
                  :size="'small'"
              />
            </n-form-item-gi>
            <n-form-item-gi path="sql">
              <n-input
                  v-model:value="formModel.sql"
                  type="textarea"
                  placeholder="输入SQL语句"
                  :clearable="true"
                  :autosize=" {  minRows: 5 }"
              />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-card>

      <n-space justify="center" align="center" style="margin-top: 10px">
        <n-button type="primary" style="width: 120px" @click="exec" :loading="isLoading">执行</n-button>
      </n-space>

      <n-input
          v-show="resRef.length>0"
          style="margin-top: 10px"
          v-model:value="resRef"
          type="textarea"
          placeholder=""
          :autosize="true"
          readonly
      />

    </n-scrollbar>
  </n-layout>
</template>

<script lang="ts" setup>
import {exec_sql} from "@render/api/datacenter";
import {datasourceOptions} from "@render/typings/datacenterOptions";
import {FormInst, useMessage} from "naive-ui";
import {ref} from "vue";

const message = useMessage()

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  dataSourceId: '6',
  sql: ''
})

const rules = {
  dataSourceId: {
    required: true,
    trigger: ['change'],
    message: '请选择数据源'
  },
  sql: {
    key: 'table',
    required: true,
    trigger: ['change'],
    message: '请输入SQL'
  }
}

let paramModel = {
  sourceId: '',
  dbType: '',
  sourceName: '',
  dataTierCode: '',
  dataTierName: '',
  namedJson: '',
  datamodelTableFieldsVoList: [],
  lifeCycle: '1',
  ddlSql: '',
  tableName: 'execSql'
}

const resRef = ref('');

const isLoading = ref(false)

const exec = () => {
  isLoading.value = true
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      paramModel.sourceId = formModel.value.dataSourceId
      paramModel.dbType = datasourceOptions.find(option => option.value === formModel.value.dataSourceId).datasource as string
      paramModel.ddlSql = formModel.value.sql.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ')

      await exec_sql(paramModel).then((res) => {
        if ((res.code == 500 && res.message === '服务器内部错误') || (res.code == 200 && res.success)) {
          message.success('执行成功')
        } else {
          message.error('执行失败，具体看返回结果')
          resRef.value = res.message.replace(/建表失败，/g, '')
        }

      }).finally(() => {
        isLoading.value = false
      })
    } else {
      console.log(errors)
    }
  })
}


</script>

<style scoped>

</style>
