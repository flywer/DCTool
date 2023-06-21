<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
    <n-layout has-sider style="height: calc(100vh - 92px);">
      <n-layout-sider content-style="padding: 4px 12px 12px 12px;overflow:hidden">
        <n-grid :cols="6" :x-gap="8">
          <n-gi :span="5">
            <n-input v-model:value="pattern" placeholder="搜索">
              <template #prefix>
                <n-icon :component="Search"/>
              </template>
              <template #suffix>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button text type="default" ghost
                              @click="filterNode = !filterNode"
                    >
                      <n-icon>
                        <Filter v-show="filterNode"/>
                        <FilterOff v-show="!filterNode"/>
                      </n-icon>
                    </n-button>
                  </template>
                  是否过滤无关节点
                </n-tooltip>
              </template>
            </n-input>
          </n-gi>
          <n-gi :span="1">
            <n-button @click="handleTreeNodeInit">
              <n-icon>
                <Refresh/>
              </n-icon>
            </n-button>
          </n-gi>
        </n-grid>

        <n-tree
            ref="tree"
            class="mt-2 pr-2"
            block-line
            :data="useProjectTreeStore().treeNodes"
            expand-on-click
            selectable
            :pattern="pattern"
            :show-irrelevant-nodes="!filterNode"
            virtual-scroll
            @load="handleLoad"
            style="height: calc(100vh - 150px);"
            :default-expanded-keys="useProjectTreeStore().defaultExpandedKeys"
            :default-selected-keys="useProjectTreeStore().defaultSelectedKeys"
            @update:expandedKeys="handleExpandedKeys"
            @update:selectedKeys="handleSelectedKeys"
        />
      </n-layout-sider>
      <n-layout-content content-style="padding: 12px;border-left: 1px solid rgb(237 237 237)">
        <n-tabs type="line" animated>
          <n-tab-pane name="1" tab="数据归集任务">
            <job-tab/>
          </n-tab-pane>
          <!--            <n-tab-pane name="2" tab="执行日志">

                      </n-tab-pane>-->
          <n-tab-pane name="3" tab="中台相关表">
            <project-tables-tab/>
          </n-tab-pane>

        </n-tabs>
      </n-layout-content>
    </n-layout>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {find_by_project_id} from "@render/api/auxiliaryDb";
import {get_cj_job_page, get_sched_job_page, get_workflow_page} from "@render/api/datacenter";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {projectIdOptions, projectIdOptionsUpdate} from "@render/typings/datacenterOptions";
import JobTab from "@render/views/projectMgt/jobTab.vue";
import ProjectTablesTab from "@render/views/projectMgt/projectTablesTab.vue";
import {onMounted, ref} from 'vue'
import {NButton, TreeOption, TreeInst} from 'naive-ui'
import {Search, Refresh} from '@vicons/ionicons5'
import {Filter, FilterOff} from '@vicons/tabler'

const tree = ref<TreeInst | null>(null)

const basicTableAbbrs = ['g1010', 'g1020', 'y2010', 'y2020', 'y2030', 'y3010', 'y4010', 'z2010', 'z2020',
  'z2030', 'z2050', 'z3010', 'f2010', 'f2010', 'f2020', 'f1010', 'f1011', 'f1012', 'f1016', 'f3010', 'f3011',
  'd1010', 'd1020', 'd1030', 'd1040']

const pattern = ref()

const filterNode = ref(false)

onMounted(() => {
  useProjectTreeStore().projectTreeInit()
  projectIdOptionsUpdate()

  // 初始化滚动到选中的节点上
  tree.value.scrollTo({key: useProjectTreeStore().defaultSelectedKeys[0]})
})

const handleTreeNodeInit = () => {
  useProjectTreeStore().$reset()
  useProjectTreeStore().treeNodesInit()
}

const handleLoad = (node: TreeOption) => {
  return new Promise<void>(async (resolve) => {
    if (node.key.toString() === '1-0') {
      // 省直
      node.children = projectIdOptions.filter((element) =>
          !["5", "6", "11"].includes(element.value as string) &&
          (element.label as string).includes('数据归集') &&
          (element.label as string).includes('广东省')
      ).map((element) => ({
        label: element.label,
        key: `${node.key}-${element.value}`,
        isLeaf: false
      })) as TreeOption[]
    } else if (node.key.toString() === '1-1') {
      // 地市
      node.children = projectIdOptions.filter((element) =>
          !["5", "6", "11"].includes(element.value as string) &&
          (element.label as string).includes('数据归集') &&
          !(element.label as string).includes('广东省') &&
          (element.label as string).includes('市')
      ).map((element) => ({
        label: element.label,
        key: `${node.key}-${element.value}`,
        isLeaf: false
      })) as TreeOption[]
    } else {
      // node.children = await getExistTableProject(node)
      node.children = setDefaultActionTable(node)
    }
    resolve()
  })
}

//通过节点key获取此项目下所有已存在的表名
const getExistTableProject = async (node: TreeOption) => {
  const projectId = node.key.toString().split('-')[2]
  const projectAbbr = (await find_by_project_id(projectId))?.projectAbbr || ''
  if (projectAbbr !== '') {

    //工作流任务
    const workflowJobs = (await get_workflow_page({
      page: 1,
      size: 10000,
      status: null,
      procName: projectAbbr
    })).data.records.filter(element => element.projectId == projectId).map((v) => ({
      tableAbbr: v.procName.split('_')[2]
    })).filter((obj, index, array) => {
      return index === array.findIndex(item => item.tableAbbr === obj.tableAbbr);
    })

    // 采集任务
    const cjJobs = (await get_cj_job_page({
      current: 1,
      size: 10000,
      blurry: projectAbbr,
      subsystemName: "采集"
    })).data.records.map((v) => ({
      tableAbbr: v.jobDesc.split('_')[2]
    })).filter(item => !basicTableAbbrs.includes(item.tableAbbr.toLowerCase())).filter((obj, index, array) => {
      return index === array.findIndex(item => item.tableAbbr === obj.tableAbbr);
    })

    //调度任务
    const SchedJobs = (await get_sched_job_page(
        {
          current: 1,
          size: 10000,
          blurry: projectAbbr
        }
    )).data.records.map((v) => ({
      tableAbbr: v.jobContent.split('_')[2]
    })).filter(item => !basicTableAbbrs.includes(item.tableAbbr.toLowerCase())).filter((obj, index, array) => {
      return index === array.findIndex(item => item.tableAbbr === obj.tableAbbr);
    })

    const newArr = Array.from(new Set([...workflowJobs, ...cjJobs, ...SchedJobs])).filter((obj, index, array) => {
      return index === array.findIndex(item => item.tableAbbr === obj.tableAbbr);
    })

    return newArr.map((v) => ({
      label: v.tableAbbr.toUpperCase(),
      key: `${node.key}-${v.tableAbbr}`,
      isLeaf: true
    })) as TreeOption[]
  }
}

const setDefaultActionTable = (node: TreeOption): TreeOption[] => {
  const tables = ['c1010', 'c2010', 'c2011', 'c2020', 'c2030', 'c2040', 'c2050', 'c2051', 'c2060', 'c2070', 'c2080', 'c2100', 'c2090', 'c3010', 'c3011', 'c3020', 'c3030', 'c3040', 'c4010', 'c4110', 'c6010', 'c6020', 'c6030', 'c6040', 'c7090']

  return tables.map((v): TreeOption => ({
    label: v.toUpperCase(),
    key: `${node.key}-${v}`,
    isLeaf: true
  }))

}

const handleExpandedKeys = (keys: Array<string>) => {
  useProjectTreeStore().defaultExpandedKeys = keys as string[]
}

const handleSelectedKeys = (keys: Array<string>) => {
  useProjectTreeStore().defaultSelectedKeys = keys as string[]
}


</script>

<style scoped>

</style>
