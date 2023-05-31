<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-alert title="说明" type="default" :show-icon="false">
        在这里配置每个项目的缩写简称
      </n-alert>
      <n-data-table
          class="mt-2"
          :columns="columnsRef"
          :data="tableDataRef"
          :pagination="false"
          :bordered="false"
          :size="'small'"
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

type ProjectInfo = {
  id: number
  projectId: string
  projectName: string
  projectAbbr: string
  tableAbbr: string
}

onMounted(async () => {
  const map = (await get_job_project_list()).map(
      (v => ({
        projectName: v.name,
        projectId: v.id.toString(),
        projectAbbr: pinyin(
            v.name.replaceAll(/行政行为/g, 'xzxw')
                .replaceAll(/省政务服务数据管理局/g, '省政数局')
                .replaceAll(/数据归集/g, '')
                .replaceAll(/广东/g, '')
            , {
              style: pinyin.STYLE_FIRST_LETTER,
            }).join(''),
        tableAbbr: pinyin(
            v.name.replaceAll(/行政行为/g, '')
                .replaceAll(/省政务服务数据管理局/g, '省政数局')
                .replaceAll(/数据归集/g, '')
                .replaceAll(/广东/g, '')
            , {
              style: pinyin.STYLE_FIRST_LETTER,
            }).join('')
      })));

  const projectInfo: ProjectInfo[] = await get_project_info()

  tableDataRef.value = projectInfo.concat(map.filter((m) => {
    return !projectInfo.some((p) => p.projectId === m.projectId);
  }))
})

let tableDataWatch = computed(() => {
  return JSON.parse(JSON.stringify(tableDataRef.value));
})

watch(tableDataWatch, async (newValue, oldValue) => {
  if (oldValue.length != 0 && newValue !== oldValue) {
    await update_project_info(newValue)
  }
}, {deep: true})

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
          onUpdateValue(v) {
            tableDataRef.value.find(item => item.projectId == row.projectId).projectAbbr = v
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
          onUpdateValue(v) {
            tableDataRef.value.find(item => item.projectId == row.projectId).tableAbbr = v
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

</script>

<style scoped>

</style>
