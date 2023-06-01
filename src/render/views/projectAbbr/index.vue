<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 50px);" trigger="hover">
      <n-alert title="说明" type="default" :show-icon="false">
        在这里配置每个项目的缩写简称
      </n-alert>
      <n-data-table
          class="mt-2 mb-2"
          :columns="columnsRef"
          :data="tableDataRef"
          :pagination="false"
          :bordered="false"
          :size="'small'"
          :loading="isLoading"
      />
    </n-scrollbar>
  </n-layout>

</template>

<script setup lang="ts">
import {get_project_info, update_project_info} from "@render/api/auxiliaryDb";
import {get_job_project_list} from "@render/api/datacenter";
import showOrEdit from "@render/views/projectAbbr/showOrEdit.vue";
import type {DataTableColumns} from 'naive-ui'
import {useMessage} from 'naive-ui'
import pinyin from "pinyin";
import {computed, h, onMounted, ref, watch} from 'vue'

const message = useMessage()

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
            tableDataRef.value.find(item => item.projectId == row.projectId).projectAbbr = v
            update_project_info(JSON.stringify([tableDataRef.value.find(item => item.projectId == row.projectId)])).then(() => {
              tableDataInit().then(() => {
                message.success('修改成功')
              })

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
            tableDataRef.value.find(item => item.projectId == row.projectId).tableAbbr = v
            update_project_info(JSON.stringify([tableDataRef.value.find(item => item.projectId == row.projectId)])).then(() => {
              tableDataInit().then(() => {
                message.success('修改成功')
              })
            })
          }
        })
      }
    }
  ]
}

const columnsRef = ref(createColumns({
  edit(row: ProjectInfo) {
    message.success(`Edit ${row.projectName}`)
  }
}))

const onUpdateTableData = () => {

}

</script>

<style scoped>

</style>
