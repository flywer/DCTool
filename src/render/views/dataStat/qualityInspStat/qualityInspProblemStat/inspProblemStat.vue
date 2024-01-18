<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 160px);" trigger="hover">
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
                :loading="isOrgSelectOptionsLoading"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="4" label="时间范围">
            <n-date-picker v-model:value="formModel.timeRange" type="datetimerange"/>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" @click="createExcel" :loading="isBuilding">{{ buttonText }}</n-button>
    </n-space>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {FormInst, TreeSelectOption} from "naive-ui";
import {formatDate} from "@render/utils/common/dateUtils";
import {
  get_inps_record_page,
  get_inspection_config_by_table,
  get_inspection_record_detail,
  insp_home_list
} from "@render/api/datacenter.api";
import {isEmpty} from "lodash-es";
import {InspectionRecord} from "@common/types/datacenter/qaportal";
import {InspectionWrongFieldDataExcelModel} from "@common/types/dataStat";
import {
  find_wrong_record_by_inspection_record_id,
  save_wrong_records
} from "@render/api/auxiliaryDb/inspectionWrongRecord.api";
import {InspectionWrongRecord} from "@main/entity/InspectionWrongRecord";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {find_field_insp_rule} from "@render/api/auxiliaryDb/fieldInspectionRule.api";
import {export_insp_wrong_field_data} from "@render/api/xlsx.api";

type WrongFieldRecord = {
  wrongFieldName: string,
  wrongReason: string,
  departName: string,
  wrongFieldCount: number,
  pKeys: string[]
}

// region 表单

onMounted(() => {
  orgSelectOptionsInit()
})

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  orgIds: [],
  timeRange: [new Date('2023-11-10 00:00:00'), new Date()],
})

const orgSelectOptionsRef = ref<TreeSelectOption[]>([])
const isOrgSelectOptionsLoading = ref(false)

const orgSelectOptionsInit = async () => {

  isOrgSelectOptionsLoading.value = true

  orgSelectOptionsRef.value = [
    {
      label: '已质检组织机构',
      key: '0',
      children: []
    }
  ]

  orgSelectOptionsRef.value[0].children = (await insp_home_list()).data
      .sort(customSort)
      .map((v: {
        orgName: any;
        orgId: any;
      }): TreeSelectOption => ({
        label: v.orgName,
        key: v.orgId
      }))

  isOrgSelectOptionsLoading.value = false
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

// endregion

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

const buttonText = ref('生成Excel')
const isBuilding = ref(false)
const createExcel = async () => {
  if (!isEmpty(formModel.value.orgIds)) {
    isBuilding.value = true

    const getTableInspRecordPromise = new Promise<InspectionWrongFieldDataExcelModel[]>(async (resolve, reject) => {

      let tableInspWrongRecords: InspectionWrongFieldDataExcelModel[] = []

      try {
        // 遍历各个组织机构
        for (let i = 0; i < formModel.value.orgIds.length; i++) {
          const orgId = formModel.value.orgIds[i]

          const orgName = (await insp_home_list()).data.find((v: { orgId: string; }) => v.orgId === orgId).orgName

          buttonText.value = `正在处理[${orgName}]质检问题...`

          const tableInspectionRecords = await getTableInspectionRecords(orgId)

          for (let [key, value] of tableInspectionRecords) {

            console.log(key)

            const recordDetails: InspectionWrongFieldDataExcelModel[] = await Promise.all((await getRecordDetailByInspIds(key, value)).map((async v => ({
              ownDepartName: orgName,
              catalogDepartName: v.departName,
              actionType: key.split('_')[2].toUpperCase(),
              tableName: key,
              tableNameCn: (await get_table_sql({tableName: key.split('_')[2].toUpperCase()}))[0].comment,
              wrongFieldName: v.wrongFieldName,
              wrongFieldNameCn: (await find_field_insp_rule({fieldName: v.wrongFieldName}))[0]?.fieldComment || '',
              wrongReason: v.wrongReason,
              count: v.wrongFieldCount
            }))))

            tableInspWrongRecords.push(...recordDetails)

          }
        }
      } catch (e) {
        reject(e)
      }
      resolve(tableInspWrongRecords)
    })

    getTableInspRecordPromise
        .then((res) => {
          buttonText.value = `正在生成Excel...`
          export_insp_wrong_field_data(res)
              .then(() => {
              })
              .finally(() => {
                buttonText.value = `生成Excel`
                isBuilding.value = false
              })
        })
        .catch((error) => {
          window.$notification.create({
            title: "处理质检问题异常",
            content: error.toString(),
            type: "error"
          })
          buttonText.value = `生成Excel`
          isBuilding.value = false
        })
  } else {
    window.$message.warning('未选择组织机构')
  }
}

/**
 * 通过机构ID获取对应质检表与质检记录
 **/
const getTableInspectionRecords = async (orgId: string) => {
  const tableInspectionRecordsMap = new Map<string, string[]>();

  let curPage = 1
  const size = 1000

  while (1) {
    // 获取质检记录
    const data = (await get_inps_record_page({
      page: curPage,
      size: size,
      orgIds: [orgId],
      inspTime: timeRangeConvert(formModel.value.timeRange)
    })).data

    const records: InspectionRecord[] = data.records

    records.forEach((record) => {
      /**
       * 过滤质检记录
       * 1.质检数据总量大于0
       * 2.校验通过数量大于等于0
       * 3.校验失败数量大于0
       * 4.未处理
       **/
      if (record.totalRecordSum > 0 && record.aimRecordSum >= 0 && record.wrongRecordSum > 0 && record.isProcessor === 0) {

        if (tableInspectionRecordsMap.has(record.sourceTableName)) {

          const inspectionRecordIds = tableInspectionRecordsMap.get(record.sourceTableName)
          inspectionRecordIds.push(record.inspectionRecordId)

          tableInspectionRecordsMap.set(record.sourceTableName, inspectionRecordIds)
        } else {
          tableInspectionRecordsMap.set(record.sourceTableName, [record.inspectionRecordId])
        }
      }
    })

    if (curPage * size >= data.total) {
      break
    } else {
      curPage++
    }
  }

  return tableInspectionRecordsMap
}

/**
 * 通过表名对应所有质检记录ID数组获取对应的质检明细，并合并
 * @param tableName 表名
 * @param inspectionIds 质检记录ID数组
 * @returns 质检明细
 **/
const getRecordDetailByInspIds = async (tableName: string, inspectionIds: string[]) => {

  let wrongFieldRecords: WrongFieldRecord[] = []

  for (const inspectionId of inspectionIds) {

    // 查询是否已统计此质检记录
    const wrongRecords = await find_wrong_record_by_inspection_record_id(inspectionId)

    if (wrongRecords.length > 0) {

      const records: WrongFieldRecord[] = wrongRecords.map((v => ({
        wrongFieldName: v.wrongFieldName,
        wrongReason: v.wrongReason,
        departName: v.catalogDepartName,
        wrongFieldCount: v.count,
        pKeys: v.pKeys.split(',')
      })))

      wrongFieldRecords = mergeAndDistinctWrongFieldRecord(wrongFieldRecords, records)

    } else {
      // 获取此质检记录的问题统计
      const records = await getInspRecordDetail(inspectionId, tableName)

      if (records.length > 0) {
        // 保存此质检问题统计记录
        await saveWrongRecords(tableName, inspectionId, records)

        wrongFieldRecords = mergeAndDistinctWrongFieldRecord(wrongFieldRecords, records)
      }
    }

  }

  return wrongFieldRecords
}

/**
 * 保存质检明细
 **/
const saveWrongRecords = async (tableName: string, inspectionRecordId: string, wrongFieldRecords: WrongFieldRecord[]) => {

  const config = await get_inspection_config_by_table(6, tableName);

  const inspectionWrongRecords: Partial<InspectionWrongRecord[]> = []

  wrongFieldRecords.forEach(record => {
    inspectionWrongRecords.push({
      id: null,
      tableName: tableName,
      inspectionRecordId: inspectionRecordId,
      catalogDepartName: record.departName,
      ownDepartName: config.success ? config.data.mechanismName : '未知',
      wrongFieldName: record.wrongFieldName,
      wrongReason: record.wrongReason,
      pKeys: record.pKeys.join(','),
      count: record.wrongFieldCount,
      createTime: new Date()
    });
  })

  await save_wrong_records(inspectionWrongRecords)
}

/**
 * 获取质检记录明细问题数据
 **/
const getInspRecordDetail = async (inspectionRecordId: string, tableName: string): Promise<WrongFieldRecord[]> => {

  // 为防止乱码，每次获取数据需进行检查
  const fetchData = async (inspectionRecordId: string, curPage: number, size: number, field: string): Promise<any> => {
    const dataRes = await get_inspection_record_detail({
      inspectionRecordId: inspectionRecordId,
      page: curPage,
      size: size,
      likeName: field,
      likeType: 0
    });

    const data = dataRes.data;

    let departFieldName = null

    if (data) {
      const judges = await Promise.all(data.records.map(async (record) => {
        if (!departFieldName) {
          const tableAbbr = tableName.split('_')[2];
          departFieldName = (await get_table_sql({tableName: tableAbbr}))[0].sql.split('\n').find(str => str.includes("'数据编目挂接单位名称'")).trim().split(' ')[0];
        }
        const departColName: string = record[departFieldName.toLowerCase()];
        return departColName.includes('�')
      }));

      const hasWrongChar = judges.some(judge => judge);

      if (hasWrongChar) {
        console.log(`page:${curPage},Data error, refetching...`);
        return await fetchData(inspectionRecordId, curPage, size, field);
      } else {
        return data;
      }
    } else {
      return null
    }
  };

  const wrongFieldsStat: WrongFieldRecord[] = []

  const data = (await get_inspection_record_detail({
    inspectionRecordId: inspectionRecordId,
    page: 1,
    size: 1
  })).data

  if (data && data.fields) {
    // 数据编目挂接单位字段名称
    const departFieldName = (await get_table_sql({tableName: tableName.split('_')[2]}))[0].sql.split('\n').find(str => str.includes("'数据编目挂接单位名称'")).trim().split(' ')[0]

    const config = await get_inspection_config_by_table(6, tableName);

    // 表字段
    const fields = data.fields

    for (const field of fields) {
      if (field === '主键' || field === '问题原因' || field === '状态' || field === '批次号') {
        continue
      }

      let curPage = 1
      const size = 10000

      // 根据主键去重
      const pKeyMap = new Map<string, string>();
      let wrongReason = null

      // 统计此字段问题数据量
      while (1) {
        const data = await fetchData(inspectionRecordId, curPage, size, field)

        if (data && data.records && data.records.length > 0) {
          if (curPage == 1) {
            wrongReason = data.records[0]['问题原因'].replace(`${field}:`, '').replace(';', '')
            if (wrongReason.includes('、') && wrongReason.split('、')[0] === wrongReason.split('、')[1]) {
              wrongReason = wrongReason.split('、')[0]
            }
          }

          for (const record of data.records) {
            const pKey: string = record['主键']

            let departColName: string = record[departFieldName.toLowerCase()]

            if (departColName.length > 125) {
              if (config.success) {
                departColName = config.data.mechanismName
              } else {
                continue
              }
            }

            if (!pKeyMap.has(pKey)) {
              pKeyMap.set(pKey, departColName)
            }
          }
        } else {
          break
        }

        if (data.page >= data.total * data.size) {
          break
        } else {
          curPage++
        }
      }

      if (pKeyMap.size > 0) {

        let newMap: Map<string, string[]> = new Map();

        for (let [key, value] of pKeyMap) {
          if (newMap.has(value)) {
            newMap.get(value)?.push(key)
          } else {
            newMap.set(value, [key]);
          }
        }

        for (let [key, value] of newMap) {
          wrongFieldsStat.push({
            wrongFieldName: field,
            wrongReason: wrongReason,
            wrongFieldCount: value.length,
            departName: key,
            pKeys: value
          })
        }
      }
    }
  } else {
    // console.log(inspectionRecordId, data?.fields)
  }

  return wrongFieldsStat
}

/**
 * 合并质检明细
 **/
const mergeAndDistinctWrongFieldRecord = (A: WrongFieldRecord[], B: WrongFieldRecord[]) => {

  // 创建一个 Map 用于存储合并后的结果
  let map = new Map<string, {
    set: Set<string>;
    wrongReason: string
  }>();
  let C: WrongFieldRecord[] = [];

  [A, B].forEach(arr => {
    arr.forEach(item => {
      // 创建 key，使得数据可以根据 wrongFieldName 和 departName 进行分组
      let key = `${item.wrongFieldName}-${item.departName}`;

      // 还未添加过 key，则创建新的 Set 放入 Map
      if (!map.has(key)) {
        map.set(key, {set: new Set(item.pKeys), wrongReason: item.wrongReason});
      } else {
        // 已经添加过 key，则更新 Set
        let obj = map.get(key)!;
        item.pKeys.forEach(pKey => obj.set.add(pKey));
      }
    });
  });

// 转换 Map 为需要的数组形式
  map.forEach((value, key) => {
    let [wrongFieldName, departName] = key.split('-');
    C.push({
      wrongFieldName: wrongFieldName,
      wrongReason: value.wrongReason,
      wrongFieldCount: value.set.size,
      departName: departName,
      pKeys: Array.from(value.set)
    });
  });

  return C
}

</script>

<style scoped>

</style>
