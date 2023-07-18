<template>
  <n-layout>
    <n-alert type="default" :show-icon="false">
      根据中台标准代码集的JSON，提取代码值保存到辅助库字典表中
    </n-alert>
    <n-card class="mt-2" :content-style="{paddingBottom:0}">
      <n-form-item label="代码集">
        <n-select
            :size="'small'"
            v-model:value="codeSetIdRef"
            :options="codeSetOptionsRef"
            filterable
            remote
            @search="handleCodeSetSearch"
            @update:value="handleCodeSetUpdate"
            :consistent-menu-width="false"
        />
      </n-form-item>
    </n-card>

    <n-space class="mt-2" justify="center" align="center">
      <n-button class="w-28" type="primary" :disabled="codeSetIdRef.length===0" @click="save"
                :loading="isSaving"
      >
        保存
      </n-button>
    </n-space>

  </n-layout>
</template>

<script setup lang="ts">
import {getCurrentDateTime, getDayString} from "@main/utils/dateUtils";
import {get_sztk_dict, save_sztk_dict} from "@render/api/auxiliaryDb";
import {get_dict_by_name, get_dict_list_by_id} from "@render/api/datacenter";
import {isEmpty} from "lodash-es";
import {SelectGroupOption, SelectOption} from "naive-ui";
import {onMounted, ref} from "vue";
import {uuid} from "vue3-uuid";

const codeSetIdRef = ref('')

const codeSetOptionsRef = ref<Array<SelectOption | SelectGroupOption>>()

type SztkDictType = {
  bzId: string
  dictName: string
  dictCode: string
  parentId: string | null
  orderNum: number
  addTime: string
  cdTime: string
  cdOperation: string
  cdBatch: string
}

const sztkDictArrRef = ref<SztkDictType[]>([])

onMounted(async () => {
  handleCodeSetSearch('')
})

const handleCodeSetSearch = async (v) => {
  const records = (await get_dict_by_name({
    codeSetName: v,
    page: 1,
    size: 100
  })).data.records

  codeSetOptionsRef.value = records.map((v) => ({
    label: `${v.codeSetName}-${v.codeSetCode}`,
    value: v.id.toString()
  }))
}

const handleCodeSetUpdate = (v) => {
  if (v != null) {
    get_dict_list_by_id(v).then(async res => {
      if (res.code == 200) {

        sztkDictArrRef.value = []

        const parentId = uuid.v4()
        const splitArray = codeSetOptionsRef.value.filter(opt => opt.value == v)[0].label.toString().split('-')
        const addTime = getCurrentDateTime()
        const cdTime = getCurrentDateTime()
        const cdBatch = `${getDayString(false)}0000001`
        sztkDictArrRef.value.push({
          bzId: parentId,
          dictName: splitArray[0],
          dictCode: splitArray[1] || null,
          parentId: null,
          orderNum: 0,
          addTime: addTime,
          cdTime: cdTime,
          cdOperation: 'I',
          cdBatch: cdBatch
        })

        res.data.forEach((v, index) => {
          sztkDictArrRef.value.push({
            bzId: uuid.v4(),
            dictName: v.name,
            dictCode: v.code,
            parentId: parentId,
            orderNum: index + 1,
            addTime: addTime,
            cdTime: cdTime,
            cdOperation: 'I',
            cdBatch: cdBatch
          })
        })
        const firstItem = sztkDictArrRef.value[0]; // 保存第一个元素

        sztkDictArrRef.value = sztkDictArrRef.value.filter(dict => dict.bzId != firstItem.bzId).sort((a, b) => a.dictCode.localeCompare(b.dictCode))

        // 将第一个元素放在新排序后的数组的首位
        sztkDictArrRef.value.unshift(firstItem);

      } else {
        window.$message.error(res.message)
      }
    })
  }
}

const isSaving = ref(false)
const save = async () => {
  isSaving.value = true
  const splitArray = codeSetOptionsRef.value.filter(opt => opt.value == codeSetIdRef.value)[0].label.toString().split('-')

  await get_sztk_dict({
    dictName: splitArray[0],
    dictCode: splitArray[1] || null,
  }).then(res => {
    if (isEmpty(res)) {
      save_sztk_dict(sztkDictArrRef.value).then(() => {
        window.$message.success('保存成功')
      }).finally(() => isSaving.value = false)
    } else {
      window.$dialog.warning({
        title: '警告',
        content: `${splitArray[0]}已存在，现不支持更新代码集`,
        positiveText: '确定',
        onPositiveClick: () => {
          isSaving.value = false
        }
      })
    }
  }).catch((e) => {
    console.error(e)
    isSaving.value = false
  })
}

</script>

<style scoped>

</style>
