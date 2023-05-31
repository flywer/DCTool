<template>
  <n-layout style="margin: 10px 10px 0 10px">
    <n-scrollbar style="height: calc(100vh - 42px); padding-right: 10px;" trigger="hover">
      <n-alert title="说明" type="default" :show-icon="false">
        校验SQL是否正确
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
                  :autosize=" {  minRows: 5,maxRows:14 }"
              />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-card>
      <n-space justify="center" align="center" style="margin-top: 10px">
        <n-button type="primary" style="width: 120px" @click="exec" :loading="isLoading">校验</n-button>
      </n-space>

      <n-input
          v-show="resRef.length > 0"
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

<script setup lang="ts">
import {exec_sql, sql_valid} from "@render/api/datacenter";
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
  id: '',
  sql: ''
}

const resRef = ref('');

const isLoading = ref(false)

const exec = () => {
  isLoading.value = true
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      paramModel.id = formModel.value.dataSourceId
      paramModel.sql = formModel.value.sql.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ')

      await sql_valid(paramModel).then((res) => {
        if (res.code == 0) {
          message.success('校验成功')
        } else {
          message.error('校验失败，具体看返回结果')
          resRef.value = res.msg
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
