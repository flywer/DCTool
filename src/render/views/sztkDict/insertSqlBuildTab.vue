<template>
  <n-layout>
    <n-alert type="default" :show-icon="false">
      插入语句生成
    </n-alert>
    <n-card class="mt-2" :content-style="{paddingBottom:0}">
      <n-form-item label="代码集选择">
        <n-tree-select
            v-model:value="dictSelectRef"
            multiple
            cascade
            checkable
            :check-strategy="'child'"
            :options="dictSelectOptionsRef"
            :size="'small'"
            clearable
        />
      </n-form-item>
    </n-card>

    <n-space class="mt-2" justify="center" align="center">
      <n-checkbox :checked="true" :disabled="true">
        删除插入语句中的ID字段
      </n-checkbox>
      <n-button class="w-28" type="primary" :disabled="dictSelectRef.length===0" @click="buildSql"
                :loading="isBuildSql"
      >
        生成SQL
      </n-button>
      <n-button :disabled="sqlRef === ''" class="w-28" @click="copyText(sqlRef)">
        复制结果
      </n-button>
    </n-space>

    <n-input
        v-model:value="sqlRef"
        class="mt-2"
        type="textarea"
        placeholder=""
        readonly
        :autosize="{ minRows:5,maxRows:17}"
    />
  </n-layout>
</template>

<script setup lang="ts">
import {get_dict_by_bz_id, get_dict_by_parent_id, get_parent_dict} from "@render/api/auxiliaryDb";
import {copyText} from "@render/utils/common/clipboard";
import {isNull} from "lodash-es";
import {TreeSelectOption} from "naive-ui";
import {ref, onMounted} from "vue";

const dictSelectRef = ref([])

const dictSelectOptionsRef = ref<TreeSelectOption[]>([])

const sqlRef = ref('')

onMounted(() => {
  dictSelectOptionsInit()
})

const dictSelectOptionsInit = async () => {
  dictSelectOptionsRef.value = [
    {
      label: '所有代码集',
      key: '0',
      children: []
    }
  ]

  dictSelectOptionsRef.value[0].children = (await get_parent_dict())
      .sort((a, b) => a.dictCode.split('.')[1] > b.dictCode.split('.')[1])
      .map((v): TreeSelectOption => ({
        label: `${v.dictName}-${v.dictCode}`,
        key: v.bzId
      }))
}

const isBuildSql = ref(false)

const buildSql = async () => {
  isBuildSql.value = true

  let insertSql = ''

  for (const dictId of dictSelectRef.value) {

    const parentData = (await get_dict_by_bz_id(dictId))[0]
    const {
      dictName,
      dictCode
    } = parentData;

    insertSql += `-- ${dictName}-${dictCode}\n`

    insertSql += createSql(parentData)

    const childDatas = await get_dict_by_parent_id(dictId)

    childDatas.forEach(data => {
      insertSql += createSql(data)
    })

  }

  sqlRef.value = insertSql

  isBuildSql.value = false
}

const createSql = (data) => {
  let {
    bzId,
    dictName,
    dictCode,
    parentId,
    orderNum,
    addTime,
    cdTime,
    cdOperation,
    cdBatch
  } = data;

  return `INSERT INTO gdsztk_dict (bz_id, dict_name, dict_code, parent_id, order_num, add_time, cd_time, cd_operation, cd_batch) VALUES (${valueConvert(bzId)}, ${valueConvert(dictName)}, ${valueConvert(dictCode)}, ${valueConvert(parentId)}, ${valueConvert(orderNum)}, '${new Date(addTime).toISOString().replace('T', ' ').slice(0, -5)}', '${new Date(cdTime).toISOString().replace('T', ' ').slice(0, -5)}', '${cdOperation}', '${cdBatch}');\n`
}

const valueConvert = (value) => {
  if (isNull(value)) {
    return null
  } else {
    return `'${value}'`
  }
}

</script>

<style scoped>

</style>
