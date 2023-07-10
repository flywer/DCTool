<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 165px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      所选地市在该时间内的每个数据表<b>最新</b>的数据质检情况生成Excel
    </n-alert>
    <n-card class="mt-2" :content-style="{paddingBottom:0}">
      <n-form ref="formRef"
              inline
              :size="'small'"
              :model="formModel"
              label-placement="left"
      >
        <n-grid :cols="5" :x-gap="12">
          <n-form-item-gi :span="2" label="部门选择">
            <n-tree-select
                v-model:value="formModel.orgIds"
                multiple
                cascade
                checkable
                :check-strategy="'child'"
                :options="orgSelectOptionsRef"
                :size="'small'"
                clearable
                :consistent-menu-width="false"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="2" label="时间范围">
            <n-date-picker v-model:value="formModel.timeRange" type="datetimerange"/>
          </n-form-item-gi>

          <n-form-item-gi :span="1">
            <n-checkbox-group
                v-model:value="formModel.dataTypeGroupValue"
            >
              <n-space>
                <n-checkbox value="basic">
                  基础数据
                </n-checkbox>
                <n-checkbox value="action">
                  行为数据
                </n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" class="w-28" @click="createExcel" :loading="isBuilding">生成Excel</n-button>
    </n-space>
    <n-grid :cols="1" class="mt-5" v-if="isClick">
      <n-gi class="pl-5 pr-5">
        <n-progress
            type="line"
            :percentage="percentage"
            :status="percentage === 100 ?'success':'info'"
            :indicator-placement="'inside'"
            processing
        >
        </n-progress>
      </n-gi>
      <n-gi class="pl-5 pr-5">
        <span style="color: #999999">{{ progressText }}</span>
      </n-gi>

    </n-grid>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {get_table_sql} from "@render/api/auxiliaryDb";
import {get_inps_record_page, insp_home_list} from "@render/api/datacenter";
import {create_data_inps_stat} from "@render/api/xlsx";
import {getDateStringByDate} from "@render/utils/common/dateUtils";
import {getFirstDayOfMonth} from "@render/utils/common/getFirstDayOfMonth";
import {actionTableNames} from "@render/utils/datacenter/actionTableNames";
import {basicTableNames} from "@render/utils/datacenter/basicTableNames";
import {isEmpty} from "lodash-es";
import {FormInst, TreeSelectOption} from "naive-ui";
import {onMounted, ref} from "vue";

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  orgIds: [],
  timeRange: [getFirstDayOfMonth(), new Date()],
  dataTypeGroupValue: [
    'basic',
    'action'
  ],
  type: 1
})

const orgSelectOptionsRef = ref<TreeSelectOption[]>([])

onMounted(() => {
  orgSelectOptionsInit()
})

const orgSelectOptionsInit = async () => {
  orgSelectOptionsRef.value = [
    {
      label: '所有已质检部门',
      key: '0',
      children: []
    }
  ]

  orgSelectOptionsRef.value[0].children = (await insp_home_list()).data
      .sort(customSort)
      .map((v): TreeSelectOption => ({
        label: v.orgName,
        key: v.orgId
      }))
}

const customSort = (a: any, b: any) => {
  // Check if both strings start with '广东省'
  const startsWithGuangDongA = a.orgName.startsWith('广东省');
  const startsWithGuangDongB = b.orgName.startsWith('广东省');

  if (startsWithGuangDongA && !startsWithGuangDongB) {
    return -1; // Move `a` before `b`
  } else if (!startsWithGuangDongA && startsWithGuangDongB) {
    return 1; // Move `b` before `a`
  } else {
    // Both start with '广东省' or don't start with it
    return a.orgName.localeCompare(b.orgName);
  }
};
const isClick = ref(false)
const isBuilding = ref(false)
const percentage = ref(0)
const progressText = ref('')

const createExcel = async () => {

  isBuilding.value = true
  isClick.value = true

  percentage.value = 0
  progressText.value = '正在获取数据...'

  if (!isEmpty(formModel.value.orgIds)) {
    if (!isEmpty(formModel.value.dataTypeGroupValue)) {

      let tableComments = []
      get_table_sql().then(res => {
        tableComments = res
      })

      let tableNames = []

      if (formModel.value.dataTypeGroupValue.some(item => item === 'basic')) {
        tableNames.push(...basicTableNames)
      }

      if (formModel.value.dataTypeGroupValue.some(item => item === 'action')) {
        tableNames.push(...actionTableNames)
      }

      let dataSata = []

      for (let i = 0; i < formModel.value.orgIds.length; i++) {
        const orgId = formModel.value.orgIds[i]
        for (let j = 0; j < tableNames.length; j++) {

          percentage.value = Number((((i * tableNames.length + j + 1) / (formModel.value.orgIds.length * tableNames.length)) * 100).toFixed(1));

          const tableName = tableNames[j]
          const records = (await get_inps_record_page({
            page: 1,
            size: 1,
            orgIds: [orgId],
            inspTime: timeRangeConvert(formModel.value.timeRange),
            likeName: tableName
          })).data.records

          if (!isEmpty(records)) {

            const comment = tableComments.find(item => item.tableName.toLowerCase() == tableName)?.comment as string || tableName

            progressText.value = `正在分析【${records[0].orgName}】的【${comment}】`

            dataSata.push({
              orgName: records[0].orgName,
              tableName: comment,
              totalRecordSum: records[0].totalRecordSum,
              aimRecordSum: records[0].aimRecordSum,
              wrongRecordSum: records[0].wrongRecordSum
            })
          }
        }
      }

      await create_data_inps_stat(dataSata)

    } else {
      window.$message.warning('未选择数据类型')
    }
  } else {
    window.$message.warning('未选择部门')
  }

  isBuilding.value = false

  percentage.value = 100
  progressText.value = '分析完成'

}

const timeRangeConvert = (timeRange: (number | Date)[]) => {

  let res: string[] = []

  timeRange.forEach(time => {
    if (time instanceof Date) {
      res.push(getDateStringByDate(time))
    } else {
      res.push(getDateStringByDate(new Date(time)))
    }
  })

  return res
}

</script>

<style scoped>

</style>
