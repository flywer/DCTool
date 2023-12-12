<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <n-space inline class="float-right">
          <n-dropdown :options="toolOptions" trigger="click" @select="handleToolSelect">
            <n-button secondary strong type="info">
              实用方法
            </n-button>
          </n-dropdown>
          <n-button secondary strong @click="tableDataInit">
            刷新
            <template #icon>
              <n-icon>
                <Refresh/>
              </n-icon>
            </template>
          </n-button>
        </n-space>
      </div>

      <n-data-table
          :key="(row) => row.id"
          class="mt-2 mb-2"
          :columns="columnsRef"
          :data="tableDataRef"
          :bordered="true"
          :size="'small'"
          :loading="isTableLoading"
          :striped="true"
      >
      </n-data-table>

    </n-scrollbar>
  </n-layout>

  <table-preview-modal
      v-model:show="tablePreviewConfig.show"
      :datasource-id="tablePreviewConfig.datasourceId"
      :table-name="tablePreviewConfig.tableName"
  />

</template>

<script setup lang="ts">
import {DC_Datasource} from "@common/types/datacenter/common";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {get_tables_info_page, table_delete} from "@render/api/datacenter.api";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {renderIcon} from "@render/utils/common/renderIcon";
import {CreateDCTable} from "@render/utils/datacenter/CreateDCTable";
import {ExecuteDCSql} from "@render/utils/datacenter/ExecuteDCSql";
import {showButton, showConfirmation} from "@render/utils/datacenter/jobTabUtil";
import TablePreviewModal from "@render/views/jobMgt/components/tablePreviewModal.vue";
import {Clean} from '@vicons/carbon'
import {Refresh} from '@vicons/ionicons5'
import {ArrowBackUp} from '@vicons/tabler'
import {TableAdd24Regular} from '@vicons/fluent'
import {isEmpty} from "lodash-es";
import {DataTableColumns, NButton, NPopconfirm, NSpace} from "naive-ui";
import {computed, h, onMounted, ref, watch} from "vue";

const queryParam = ref('')

const projectTree = useProjectTreeStore()

// 创建计算属性来获取 Pinia 存储中的值
const defaultSelectedKeys = computed(() => projectTree.selectedKeys)

watch(defaultSelectedKeys, async (newValue) => {
  if (newValue[0] != null) {
    const segments = newValue[0].split('-');
    const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
    if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
      const projectId = segments[segments.length - 2]
      const project = (await find_by_project_id(projectId))
      if (project) {
        queryParam.value = `${project.tableAbbr}_${segments[segments.length - 1].toLowerCase()}`
        await tableDataInit()
      } else {
        tableDataRef.value = []
      }
    }

  }
})

type Table = {
  id: string
  tableName: string
  tableComment: string
  createTime: string
}

onMounted(async () => {
  const segments = useProjectTreeStore().selectedKeys[0].split('-');
  const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
  if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
    const projectId = segments[segments.length - 2]
    const project = (await find_by_project_id(projectId))
    if (project) {
      queryParam.value = `${project.tableAbbr}_${segments[segments.length - 1].toLowerCase()}`
      await tableDataInit()
    }

  }
})

const isTableLoading = ref(false)

const tableDataRef = ref<Table[]>([])

const tableDataInit = async () => {
  isTableLoading.value = true

  if (queryParam.value.length > 0) {
    const records = (await get_tables_info_page({
      size: 10000,
      page: 1,
      sourceId: 6,
      likeValue: queryParam.value
    })).data?.records || []

    if (!isEmpty(records)) {
      tableDataRef.value = customSort(records);
    } else {
      tableDataRef.value = []
    }
  }

  isTableLoading.value = false
}

const customSort = (arr: any[]): any[] => {
  const map = new Map<string, number>();

  [
    'temp_ods',
    'ods',
    'right_dwd',
    'error_dwd',
    'dwb',
    'right_dwb',
    'error_dwb',
    'odstj_dws'
  ].forEach((item, index) => {
    map.set(item, index);
  });

  const getSuffix = (tableName: string) => {
    if (tableName.endsWith('temp_ods')) {
      return 'temp_ods'
    } else if (tableName.endsWith('ods')) {
      return 'ods'
    } else if (tableName.endsWith('right_dwd')) {
      return 'right_dwd'
    } else if (tableName.endsWith('error_dwd')) {
      return 'error_dwd'
    } else if (tableName.endsWith('right_dwb')) {
      return 'right_dwb'
    } else if (tableName.endsWith('error_dwb')) {
      return 'error_dwb'
    } else if (tableName.endsWith('dwb')) {
      return 'dwb'
    } else if (tableName.endsWith('odstj_dws')) {
      return 'odstj_dws'
    } else {
      return ''
    }
  }

  return arr.sort((a, b) => {
    const aSuffix = getSuffix(a.tableName)
    const bSuffix = getSuffix(b.tableName)
    const aIndex = map.get(aSuffix)
    const bIndex = map.get(bSuffix)
    return aIndex - bIndex
  });
}

const createColumns = (): DataTableColumns<Table> => {
  return [
    {
      title: '表名称',
      key: 'tableName',
      width: '25%'
    },
    {
      title: '表描述',
      key: 'tableComment',
      width: '22%',
      render(row) {
        if (row.tableName.startsWith('di_') && row.tableName.endsWith('_temp_ods')) {
          return 'ODS层临时表'
        } else if (row.tableName.startsWith('di_') && row.tableName.endsWith('_ods')) {
          return 'ODS层备份表'
        } else if (row.tableName.startsWith('di_') && row.tableName.endsWith('_right_dwd')) {
          return 'DWD层合格表'
        } else if (row.tableName.startsWith('di_') && row.tableName.endsWith('_error_dwd')) {
          return 'DWD层不合格表'
        } else if (row.tableName.startsWith('df_') && row.tableName.endsWith('_right_dwb')) {
          return 'DWB层合格表'
        } else if (row.tableName.startsWith('df_') && row.tableName.endsWith('_error_dwb')) {
          return 'DWB层不合格表'
        } else if (row.tableName.startsWith('df_') && row.tableName.endsWith('_dwb')) {
          return 'DWB层融合表'
        } else if (row.tableName.startsWith('df_') && row.tableName.endsWith('_dm')) {
          return 'DM层全量表'
        } else if (row.tableName.startsWith('df_') && row.tableName.endsWith('_odstj_dws')) {
          return 'DWS层ODS数据量统计表'
        }
      }
    },
    {
      title: '创建时间',
      key: 'createTime',
      width: '17%',
    },
    {
      title: '操作',
      key: 'actions',
      width: '21%',
      align: 'center',
      render(row) {
        return h(NSpace, {
          justify: 'center'
        }, [
          showButton('预览', () => {
            tablePreview(row)
          }),
          h(NPopconfirm, {
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: async () => {
              await tableTruncate(row)
            },
          }, {
            trigger: () => {
              return h(NButton, {size: 'small'}, {default: () => '清空'})
            },
            default: () => `确定要使用[TRUNCATE]命令清空吗？`
          }),
          showConfirmation('删除', () => {
            tableDelete(row)
          })
        ],)
      }
    }
  ]
}

const columnsRef = ref(createColumns())

//region 预览
const tablePreviewConfig = ref({
  show: false,
  tableName: null,
  datasourceId: null
})

const tablePreview = (row: Table) => {
  tablePreviewConfig.value.show = true
  tablePreviewConfig.value.tableName = row.tableName
  tablePreviewConfig.value.datasourceId = DC_Datasource.tbds
}

// endregion

// region 删除
const tableDelete = (row: Table) => {
  table_delete(row.id).then(res => {
    if (res.code == 200 && res.success) {
      window.$message.success("删除成功")
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  })
}
//endregion

//region  清空表
const tableTruncate = async (row: Table) => {
  const executeDcSql = new ExecuteDCSql()
  await executeDcSql.execSql(`TRUNCATE TABLE ${row.tableName}`, true)
}

//endregion

// region 实用方法
const toolOptions = [
  {
    label: 'ODS数据回流至临时表',
    key: 'ODS',
    icon: renderIcon(ArrowBackUp)
  },
  {
    label: '清空所有相关表',
    key: 'ALL_CLEAN',
    icon: renderIcon(Clean)
  },
  {
    label: '创建未创建的相关表',
    key: 'ALL_CREATE',
    icon: renderIcon(TableAdd24Regular)
  }
]

const handleToolSelect = async (key: string) => {
  if (key === 'ODS') {
    await odsDataBack2Temp()
  } else if (key === 'ALL_CLEAN') {
    allClean()
  } else if (key === 'ALL_CREATE') {
    allCreate().then(() => {
      tableDataInit()
    })
  }
}

const odsDataBack2Temp = async () => {
  const tempOdsTable = tableDataRef.value.find(row => row.tableName.includes('_temp_ods'))
  const odsTable = tableDataRef.value.find(row => row.tableName.includes('_ods') && !row.tableName.includes('_temp_'))

  if (tempOdsTable && odsTable) {
    const pColName = (await get_table_sql({
      tableName: tempOdsTable.tableName.split('_')[2]
    }))[0].pColName

    const sql = `insert into ${tempOdsTable.tableName}
      select t1.* from ${odsTable.tableName} t1
      INNER JOIN (SELECT ${pColName}, MAX(cd_time) AS max_cd_time
                               FROM ${odsTable.tableName}
                               GROUP BY ${pColName}) t2
                              ON t1.${pColName} = t2.${pColName} AND t1.cd_time = t2.max_cd_time`

    window.$message.info('执行需要时间...')

    const executeDcSql = new ExecuteDCSql()
    await executeDcSql.execSql(sql, true)
  } else {
    window.$message.error(`表不存在，无法执行`)
  }
}

const allClean = () => {
  tableDataRef.value.forEach(table => {
    const executeDcSql = new ExecuteDCSql()
    executeDcSql.execSql(`TRUNCATE TABLE ${table.tableName}`, false).then(() => {
      window.$message.success(`已清空${table.tableName}`)
    })
  })
}

const allCreate = async () => {
  const tables = [
    `di_${queryParam.value}_temp_ods`,
    `di_${queryParam.value}_ods`,
    `di_${queryParam.value}_right_dwd`,
    `di_${queryParam.value}_error_dwd`,
    `df_${queryParam.value}_dwb`,
    `df_${queryParam.value}_right_dwb`,
    `df_${queryParam.value}_error_dwb`
  ]

  const existTables = tableDataRef.value.map(table => table.tableName)

  const absentTables = tables.filter(table => !existTables.includes(table))

  await Promise.all(absentTables.map(async table => {
    const tableSql = (await get_table_sql({tableName: queryParam.value.split('_')[1]}))[0]

    const res = await CreateDCTable.createTable(table, tableSql.sql, table.startsWith('df_'))
    if (res.success) {
      window.$message.success(`创建${table}成功`)
    } else {
      window.$message.error(`创建${table}失败`)
    }
  }))

}

// endregion
</script>

<style scoped>

</style>
