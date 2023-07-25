<template>
  <n-layout class="mt-2 ml-2 mb-2">
    <n-scrollbar style="height: calc(100vh - 50px);" trigger="hover">
      <n-layout style="width: 98%">
        <n-alert type="default" :show-icon="false">
          在这里配置每个项目的缩写简称
        </n-alert>
        <n-space justify="end" class="mt-2">
          <n-button secondary strong @click="tableDataInit">
            刷新
            <template #icon>
              <n-icon>
                <Refresh/>
              </n-icon>
            </template>
          </n-button>
        </n-space>
        <n-data-table
            ref="tableRef"
            :key="(row) => row.projectId"
            class="mt-2"
            :columns="columnsRef"
            :data="tableDataRef"
            :pagination="paginationReactive"
            :bordered="true"
            :size="'small'"
            :loading="isLoading"
            :striped="true"
        />
      </n-layout>
    </n-scrollbar>
  </n-layout>

</template>

<script setup lang="ts">
import {
  get_project_by_pro_abbr,
  get_project_by_table_abbr,
  get_project_info,
  update_project_info
} from "@render/api/auxiliaryDb";
import {get_job_project_list} from "@render/api/datacenter";
import showOrEdit from "@render/views/projectAbbr/showOrEdit.vue";
import {isNull} from "lodash-es";
import type {DataTableColumns} from 'naive-ui'
import {h, onMounted, ref, reactive} from 'vue'
import {Refresh} from '@vicons/ionicons5'

const tableRef = ref()

const tableDataRef = ref([])

const isLoading = ref(true)

type ProjectInfo = {
  id: number
  projectId: string
  projectName: string
  projectAbbr: string
  tableAbbr: string
}

onMounted(async () => {
  await tableDataInit()
})

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

const tableDataInit = async () => {
  isLoading.value = true
  const map = (await get_job_project_list()).map(
      (v => ({
        projectName: v.name,
        projectId: v.id.toString(),
        projectAbbr: '',
        tableAbbr: ''
      })));

  const projectInfo: ProjectInfo[] = await get_project_info()

  // 融合辅助库内没有的项目
  tableDataRef.value = projectInfo.concat(map.filter((m) => {
    return !projectInfo.some((p) => p.projectId === m.projectId);
  }))
  isLoading.value = false
}

const createColumns = ({}: {
  edit: (row: ProjectInfo) => void
}): DataTableColumns<ProjectInfo> => {
  return [
    {
      title: 'ID',
      key: 'projectId',
      width: '5%',
      align: 'center'
    },
    {
      title: '项目名称',
      key: 'projectName',
      width: '40%'
    },
    {
      title: '项目简称',
      key: 'projectAbbr',
      width: '30%',
      render(row) {
        return h(showOrEdit, {
          value: row.projectAbbr,
          async onUpdateValue(v) {
            get_project_by_pro_abbr(v).then(res => {
              if (isNull(res)) {
                tableDataRef.value.find(item => item.projectId == row.projectId).projectAbbr = v

                update_project_info(JSON.stringify([tableDataRef.value.find(item => item.projectId == row.projectId)])).then(() => {
                  tableDataInit().then(() => {
                    window.$message.success('修改成功')
                  })
                })
              } else {
                window.$dialog.warning({
                  title: '警告',
                  content: `检测到[${v}]已被使用，是否继续？`,
                  positiveText: '确定',
                  negativeText: '取消',
                  onPositiveClick: () => {
                    tableDataRef.value.find(item => item.projectId == row.projectId).projectAbbr = v

                    update_project_info(JSON.stringify([tableDataRef.value.find(item => item.projectId == row.projectId)])).then(() => {
                      tableDataInit().then(() => {
                        window.$message.success('修改成功')
                      })
                    })
                  }
                })
              }
            })

          }
        })
      }
    },
    {
      title: '表名简称',
      key: 'tableAbbr',
      width: '30%',
      render(row) {
        return h(showOrEdit, {
          value: row.tableAbbr,
          async onUpdateValue(v) {
            get_project_by_table_abbr(v).then(res => {
              if (isNull(res)) {
                tableDataRef.value.find(item => item.projectId == row.projectId).tableAbbr = v
                update_project_info(JSON.stringify([tableDataRef.value.find(item => item.projectId == row.projectId)])).then(() => {
                  tableDataInit().then(() => {
                    window.$message.success('修改成功')
                  })
                })
              } else {
                window.$dialog.warning({
                  title: '警告',
                  content: `检测到[${v}]已被使用，是否继续？`,
                  positiveText: '确定',
                  negativeText: '取消',
                  onPositiveClick: () => {
                    tableDataRef.value.find(item => item.projectId == row.projectId).tableAbbr = v
                    update_project_info(JSON.stringify([tableDataRef.value.find(item => item.projectId == row.projectId)])).then(() => {
                      tableDataInit().then(() => {
                        window.$message.success('修改成功')
                      })
                    })
                  }
                })
              }
            })
          }
        })
      }
    }
  ]
}

const columnsRef = ref(createColumns({
  edit(row: ProjectInfo) {
    window.$message.success(`Edit ${row.projectName}`)
  }
}))

</script>

<style scoped>

</style>
