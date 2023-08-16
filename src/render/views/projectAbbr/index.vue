<template>
  <n-layout class="mt-2 ml-2 mb-2 mr-4 root-layout">
    <n-scrollbar style="height: calc(100vh - 50px);" trigger="hover">

        <n-space justify="end" class="mt-2">
          <n-input
              v-model:value="queryParam"
              placeholder="搜索"
              @update:value="tableDataInit"
              clearable
              :readonly="isLoading"
          >
            <template #prefix>
              <n-icon>
                <Search/>
              </n-icon>
            </template>
          </n-input>
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
            :bordered="true"
            :size="'small'"
            :loading="isLoading"
            :striped="true"
        />
        <n-space class="mt-4" justify="end">
          <n-pagination
              v-model:page="paginationReactive.page"
              v-model:page-size="paginationReactive.pageSize"
              :item-count="paginationReactive.itemCount"
              :page-sizes="[10, 20, 30, 40]"
              show-size-picker
              @update:page="paginationReactive.onChange"
              @update:page-size="paginationReactive.onUpdatePageSize"
          />
        </n-space>

    </n-scrollbar>
  </n-layout>

</template>

<script setup lang="ts">
import {
  find_by_project_id,
  get_project_by_pro_abbr,
  get_project_by_table_abbr,
  get_project_info, get_project_info_by_project_name,
  update_project_info
} from "@render/api/auxiliaryDb";
import {get_job_project_list_all, get_job_project_list_by_page} from "@render/api/datacenter";
import showOrEdit from "@render/views/projectAbbr/showOrEdit.vue";
import {isNull} from "lodash-es";
import type {DataTableColumns} from 'naive-ui'
import {h, onMounted, ref, reactive} from 'vue'
import {Refresh, Search} from '@vicons/ionicons5'

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

const queryParam = ref('')

onMounted(async () => {
  await tableDataInit(queryParam.value)
})

const tableDataInit = async (param: string) => {
  isLoading.value = true
  /*   const map = (await get_job_project_list_all()).map(
        (v => ({
          projectName: v.name,
          projectId: v.id.toString(),
          projectAbbr: '',
          tableAbbr: ''
        }))); */

  const data = (await get_job_project_list_by_page({
    pageNo: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
    searchParam: param
  }))

  const records = data?.records
      .map(
          (v => ({
            projectName: v.name,
            projectId: v.id.toString(),
            projectAbbr: '',
            tableAbbr: ''
          }))) || [];

  paginationReactive.itemCount = data.total || 0

  // 已配置项
  // const projectInfo: ProjectInfo[] = await get_project_info_by_project_name(param)

  for (let i = 0; i < records.length; i++) {
    const project = await find_by_project_id(records[i].projectId)
    if (!isNull(project)) {
      records[i].projectAbbr = project.projectAbbr
      records[i].tableAbbr = project.tableAbbr
    }
  }

  // 融合辅助库内没有的项目
  /*   tableDataRef.value = projectInfo.concat(records.filter((m) => {
      return (!projectInfo.some((p) => p.projectId === m.projectId));
    })) */
  tableDataRef.value = records
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
                  tableDataInit(queryParam.value).then(() => {
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
                      tableDataInit(queryParam.value).then(() => {
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
                  tableDataInit(queryParam.value).then(() => {
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
                      tableDataInit(queryParam.value).then(() => {
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

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  onChange: async (page: number) => {
    paginationReactive.page = page
    await tableDataInit(queryParam.value)
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    tableDataInit(queryParam.value)
  }
})

</script>

<style scoped>

</style>
