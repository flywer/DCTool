<template>
  <n-data-table
      :size="'small'"
      :columns="columns"
      :data="rulesList"
      :pagination="paginationReactive"
  />
</template>

<script setup lang="ts">
import {ZjRulesList} from "@render/utils/datacenter/ZjRulesList";
import {DataTableColumns, NButton, NSelect, NThing} from "naive-ui";
import {h, ref, onMounted, reactive} from 'vue'

type ZjJob = {
  id: number
  tableName: string
  json: string
  updateTime: string
}

type Rule = {

  field: string

  ruleList: {
    dimension: string
    inspectionRuleId: string
    impactLevel: string
    fromTableDataSourceId: string
    prefix?: []
    suffix?: []
    enumsValue?: []
    maxSize?: number
    minSize?: number
  }
}

const props = defineProps({
  job: {
    type: Object as () => ZjJob,
    default: null
  }
})

const rulesList = ref<Rule[]>(JSON.parse(props.job.json).dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList || [])

const fieldOptions = ref([])

onMounted(() => {
  fieldOptions.value = rulesList.value.map((v => ({
    label: v.field.split('.')[1]==undefined?v.field:v.field.split('.')[1],
    value: v.field
  })))
})

const createColumns = (): DataTableColumns<Rule> => [
  {
    title: '质检字段',
    key: 'column',
    render(row, index) {
      return h(NSelect, {
        value: row.field,
        options: fieldOptions.value,
        filterable: true,
        onUpdateValue(v: string) {
          if (!rulesList.value.some(rule => rule.field == v)) {
            rulesList.value[index].field = v
          } else {
            window.$message.warning(`[${v.split('.')[1]}]已存在`)
          }
        }
      })
    }
  },
  {
    title: '质检规则',
    key: 'rule',
    render(row) {
      return h(NThing, {}, {
        header: () => {
          return ZjRulesList.find(rule => rule.id == row.ruleList[0].inspectionRuleId)?.ruleName || ''
        },
        'header-extra': () => {
          return h(NButton, {
            size: 'small',
            onClick: () => {

            }
          }, {default: () => '编辑'})
        }
      })
    }
  }
]

const columns = ref(createColumns())

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: async (page: number) => {
    paginationReactive.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
  }
})

</script>

<style scoped>

</style>
