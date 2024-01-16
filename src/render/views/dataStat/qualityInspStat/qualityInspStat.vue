<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 160px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      所选单位在该时间内的每个数据表的数据质检情况，生成规则如下:<br/>
      1.若同一业务表的多条质检记录中质检时间为同一天且质检总量相同时，则只保留质检时间最新的那一条记录；<br/>
      2.若同一业务表的多条质检记录中质检总量与合格数量皆相同时，则只保留质检时间最新的那一条记录。
    </n-alert>
    <n-card class="mt-2" :content-style="{paddingBottom:0}">
      <n-form ref="formRef"
              inline
              :size="'small'"
              :model="formModel"
              label-placement="left"
      >
        <n-grid :cols="10" :x-gap="12">
          <n-form-item-gi :span="4" label="组织机构选择">
            <n-tree-select
                v-model:value="formModel.orgIds"
                multiple
                cascade
                checkable
                :check-strategy="'child'"
                :options="orgSelectOptionsRef"
                :size="'small'"
                clearable
                filterable
                :consistent-menu-width="false"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="4" label="时间范围">
            <n-date-picker v-model:value="formModel.timeRange" type="datetimerange"/>
          </n-form-item-gi>

          <n-form-item-gi :span="2">
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

    <n-card class="mt-4" v-if="summary.length>0">
      <n-thing>
        <template #header>
          {{ summary }}
        </template>
        <template #header-extra>
          <n-button circle size="small" @click="copyText(summary)">
            <template #icon>
              <Copy24Regular/>
            </template>
          </n-button>
        </template>
      </n-thing>
    </n-card>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {InspectionRecord} from "@common/types/datacenter/qaportal";
import {InspectionDataExcelModel} from "@common/types/dataStat";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {get_inps_record_page, insp_home_list} from "@render/api/datacenter.api";
import {create_data_inps_stat} from "@render/api/xlsx.api";
import {formatDate, getMondayOfCurrentWeek} from "@render/utils/common/dateUtils";
import {isBasicTable} from "@render/utils/common/isBasicTable";
import {actionTableNames, basicTableNames} from "@render/utils/datacenter/constants";
import {isEmpty} from "lodash-es";
import {FormInst, TreeSelectOption} from "naive-ui";
import {onMounted, ref} from "vue";
import {copyText} from "@render/utils/common/clipboard";
import {Copy24Regular} from '@vicons/fluent'

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  orgIds: [],
  timeRange: [getMondayOfCurrentWeek(), new Date()],
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
      label: '已质检组织机构',
      key: '0',
      children: []
    }
  ]

  orgSelectOptionsRef.value[0].children = (await insp_home_list()).data
      .sort(customSort)
      .map((v: { orgName: any; orgId: any; }): TreeSelectOption => ({
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
const summary = ref('')
const summaryItem = ref({
  // 省直部门数量
  provinceNums: 0,
  // 地市单位数量
  cityNums: 0,
  // 共质检编目数量
  tableNums: 0,
  // 基础数据数量
  basicDataNums: 0,
  // 基础数据合格数量
  basicAimDataSums: 0,
  // 基础数据合格率 带百分号
  basicDataPassRate: '0%',
  // 行为数据数量
  actionDataNums: 0,
  // 行为数据合格数量
  actionAimDataSums: 0,
  // 行为数据合格率 带百分号
  actionDataPassRate: '0%',
})

const createExcel = async () => {

  isBuilding.value = true
  isClick.value = true

  percentage.value = 0
  progressText.value = '正在获取数据...'
  summary.value = ''

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

      let dataSata: InspectionDataExcelModel[] = []

      // 遍历各个组织机构
      for (let i = 0; i < formModel.value.orgIds.length; i++) {
        const orgId = formModel.value.orgIds[i]
        // 遍历各个组织机构的各个表
        for (let j = 0; j < tableNames.length; j++) {

          percentage.value = Number((((i * tableNames.length + j + 1) / (formModel.value.orgIds.length * tableNames.length)) * 100).toFixed(1));

          const tableName = tableNames[j]

          // 获取质检记录
          let records: InspectionRecord[] = (await get_inps_record_page({
            page: 1,
            size: 10000,
            orgIds: [orgId],
            inspTime: timeRangeConvert(formModel.value.timeRange),
            likeName: `${tableName}_temp_ods`
          })).data.records

          if (!isEmpty(records)) {

            records = records.filter(item => item.isProcessor == 0) //统计过滤

            const comment = tableComments.find(item => item.tableName.toLowerCase() == tableName)?.comment as string || tableName

            progressText.value = `正在分析「${records[0].orgName}」的「${comment}」`

            // 过滤质检总量相同且处于同一天的数据的记录
            const processedData = processInspectionRecords(records)

            // 将 processedData 转换并添加到 dataSata 中
            const convertedDataArray: InspectionDataExcelModel[] = processedData.map(record => {
              return {
                orgName: record.orgName,
                tableComment: comment,
                tableName: record.sourceTableName,
                totalRecordSum: record.totalRecordSum,
                aimRecordSum: record.aimRecordSum,
                wrongRecordSum: record.wrongRecordSum,
                inspectionTime: record.inspectionTime
              };
            });

            dataSata.push(...convertedDataArray)
          }
        }
      }

      summaryCompute(dataSata)

      summary.value = `总结：对${summaryItem.value.provinceNums}个省直部门，${summaryItem.value.cityNums}个地市挂接数据进行质检，共质检${summaryItem.value.tableNums}个编目；
      基础数据${summaryItem.value.basicDataNums}条，合格数量为${summaryItem.value.basicAimDataSums}条，合规率${summaryItem.value.basicDataPassRate}；
      行为数据共${summaryItem.value.actionDataNums}条，合格数为${summaryItem.value.actionAimDataSums}条，合规率${summaryItem.value.actionDataPassRate}。`

      await create_data_inps_stat(dataSata)

    } else {
      window.$message.warning('未选择数据类型')
    }
  } else {
    window.$message.warning('未选择组织机构')
  }

  isBuilding.value = false

  percentage.value = 100
  progressText.value = '分析完成'

}

// 若某些元素totalRecordSum相同且在同一天，则只取inspectionTime最大的，若totalRecordSum 和 aimRecordSum 皆相同，取inspectionTime最大的
const processInspectionRecords = (records: InspectionRecord[]): InspectionRecord[] => {
  // records.sort((a, b) => new Date(b.inspectionTime).getTime() - new Date(a.inspectionTime).getTime());

  const processedArray: InspectionRecord[] = [];
  const inspectionTimeMap: Map<string, InspectionRecord> = new Map();

  for (const record of records) {
    const key = record.inspectionTime.split(' ')[0];
    if (!inspectionTimeMap.has(key) || inspectionTimeMap.get(key)!.totalRecordSum !== record.totalRecordSum) {
      // 若之前没有记录或者总记录数不同，直接添加到结果数组
      inspectionTimeMap.set(key, record);
      processedArray.push(record);
    }
  }

  const processedArray2: InspectionRecord[] = [];
  const recordMap: Map<string, InspectionRecord> = new Map();
  // 遍历排序后的数组，处理相同 totalRecordSum 和 aimRecordSum 的记录
  for (const record of processedArray) {
    const key = `${record.totalRecordSum}_${record.aimRecordSum}`;
    if (!recordMap.has(key)) {
      recordMap.set(key, record);
      processedArray2.push(record);
    }
  }

  return processedArray2;
}

const summaryCompute = (records: InspectionDataExcelModel[]) => {

  summaryItem.value.provinceNums = countUniqueDeparts(records.filter((item) => item.orgName.startsWith('广东省')));
  summaryItem.value.cityNums = countUniqueDeparts(records.filter((item) => !item.orgName.startsWith('广东省')));

  summaryItem.value.tableNums = countUniqueTables(records)

  const basicData: InspectionDataExcelModel[] = records.filter((item) => isBasicTable(item.tableName));

  summaryItem.value.basicDataNums = calculateTotalRecordSum(basicData)
  summaryItem.value.basicAimDataSums = calculateAimRecordSum(basicData)

  if (summaryItem.value.basicDataNums != 0) {
    summaryItem.value.basicDataPassRate = (summaryItem.value.basicAimDataSums / summaryItem.value.basicDataNums).toFixed(2) + '%'
  } else {
    summaryItem.value.basicDataPassRate = '0%'
  }

  const actionData: InspectionDataExcelModel[] = records.filter((item) => !isBasicTable(item.tableName));

  summaryItem.value.actionDataNums = calculateTotalRecordSum(actionData)
  summaryItem.value.actionAimDataSums = calculateAimRecordSum(actionData)
  if (summaryItem.value.actionDataNums != 0) {
    summaryItem.value.actionDataPassRate = (summaryItem.value.actionAimDataSums / summaryItem.value.actionDataNums).toFixed(2) + '%'
  } else {
    summaryItem.value.actionDataPassRate = '0%'
  }
}

const countUniqueDeparts = (records: InspectionDataExcelModel[]): number => {
  const uniqueTables: Set<string> = new Set();

  for (const record of records) {
    uniqueTables.add(record.orgName);
  }

  return uniqueTables.size;
}

const countUniqueTables = (records: InspectionDataExcelModel[]): number => {
  const uniqueTables: Set<string> = new Set();

  for (const record of records) {
    uniqueTables.add(record.tableName);
  }

  return uniqueTables.size;
}

const calculateTotalRecordSum = (records: InspectionDataExcelModel[]): number => {
  let totalSum = 0;

  for (const record of records) {
    totalSum += Math.abs(record.totalRecordSum);
  }

  return totalSum;
}

const calculateAimRecordSum = (records: InspectionDataExcelModel[]): number => {
  let totalSum = 0;

  for (const record of records) {
    totalSum += Math.abs(record.aimRecordSum);
  }

  return totalSum;
}

const timeRangeConvert = (timeRange: (number | Date)[]) => {

  let res: string[] = []

  timeRange.forEach(time => {
    if (time instanceof Date) {
      res.push(formatDate(time))
    } else {
      res.push(formatDate(new Date(time)))
    }
  })

  return res
}

</script>

<style scoped>

</style>
