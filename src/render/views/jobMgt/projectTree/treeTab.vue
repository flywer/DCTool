<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
    <n-layout has-sider style="height: calc(100vh - 92px);">
      <n-layout-sider content-style="padding: 4px 12px 12px 12px;overflow:hidden">
        <n-grid :cols="8" :x-gap="4">
          <n-gi :span="6">
            <n-input v-model:value="pattern" placeholder="搜索">
              <template #prefix>
                <n-icon>
                  <Search/>
                </n-icon>
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
            <n-button
                quaternary circle
                style="font-size: 18px;"
                @click="tree.scrollTo({key: useProjectTreeStore().defaultSelectedKeys[0]})"
            >
              <n-icon>
                <Focus2/>
              </n-icon>
            </n-button>
          </n-gi>
          <n-gi :span="1">
            <n-button
                quaternary circle
                style="font-size: 18px;margin-left: 4px"
                @click="handleTreeNodeInit"
            >
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
            :cancelable="false"
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
            :render-suffix="renderSuffix"
        />
      </n-layout-sider>
      <n-layout-content content-style="padding: 12px;border-left: 1px solid rgb(237 237 237)">
        <template v-if="!useProjectTreeStore().defaultSelectedKeys[0].startsWith('2-')">
          <n-tabs type="line" animated>
            <n-tab-pane name="1" tab="数据归集任务">
              <job-tab/>
            </n-tab-pane>
            <n-tab-pane name="2" tab="中台相关表">
              <project-tables-tab/>
            </n-tab-pane>
            <n-tab-pane name="3" tab="质检情况">
              <job-inspection-tab/>
            </n-tab-pane>
          </n-tabs>
        </template>
        <!--省政数局主体信息采集-->
        <szsj-subject-tab v-if="useProjectTreeStore().defaultSelectedKeys[0]==='2-0'"/>

        <front-end-data-vol-tab v-if="useProjectTreeStore().defaultSelectedKeys[0]==='2-1-0'"/>
        <data-lake-data-vol-tab v-if="useProjectTreeStore().defaultSelectedKeys[0]==='2-1-1'"/>

      </n-layout-content>
    </n-layout>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {get_job_project_list_all} from "@render/api/datacenter.api";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {useUserStore} from "@render/stores/user";
import {projectIdOptions, projectIdOptionsUpdate} from "@render/typings/datacenterOptions";
import JobInspectionTab from "@render/views/jobMgt/projectTree/jobInspectionTab.vue";
import JobTab from "@render/views/jobMgt/projectTree/jobTab.vue";
import DataLakeDataVolTab from "@render/views/jobMgt/projectTree/other/dataLakeDataVolTab.vue";
import FrontEndDataVolTab from "@render/views/jobMgt/projectTree/other/frontEndDataVolTab.vue";
import ProjectTablesTab from "@render/views/jobMgt/projectTree/projectTablesTab.vue";
import SzsjSubjectTab from "@render/views/jobMgt/projectTree/other/szsjSubjectTab.vue";
import {Star24Filled} from "@vicons/fluent";
import {onMounted, ref, h} from 'vue'
import {NButton, NIcon, TreeOption, TreeInst, NTag, SelectOption} from 'naive-ui'
import {Search, Refresh} from '@vicons/ionicons5'
import {Filter, FilterOff, Focus2} from '@vicons/tabler'

const tree = ref<TreeInst | null>(null)

const pattern = ref()

const filterNode = ref(false)

// 项目与用户关系
const projectUserOptions = ref<Array<SelectOption>>()

const user = useUserStore()

onMounted(async () => {

  await projectUserOptionsInit()

  useProjectTreeStore().projectTreeInit()
  await projectIdOptionsUpdate()

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
      // 省直行为数据
      node.children = projectIdOptions.filter((element) =>
          !["5", "6", "11"].includes(element.value as string) &&
          (element.label as string).includes('数据归集') &&
          (element.label as string).includes('广东省')
      ).map((element) => ({
        label: (element.label as string).replace('广东', '').replace('数据归集', '').replace('行政行为', ''),
        key: `${node.key}-${element.value}`,
        prefix: () => {
          return h(NTag, {
                size: 'small',
                bordered: false,
                type: "info"
              },
              {default: () => (element.label as string).charAt(3)})
        },
        isLeaf: false
      })) as TreeOption[]
    } else if (node.key.toString() === '1-1') {
      // 地市行为数据
      node.children = projectIdOptions.filter((element) =>
          !["5", "6", "11"].includes(element.value as string) &&
          (element.label as string).includes('数据归集') &&
          !(element.label as string).includes('广东省') &&
          (element.label as string).includes('市')
      ).map((element) => ({
        label: (element.label as string).replace('数据归集', '').replace('行政行为', ''),
        key: `${node.key}-${element.value}`,
        prefix: () => {
          return h(NTag, {
                size: 'small',
                bordered: false,
                type: "info"
              },
              {default: () => (element.label as string).charAt(0)})
        },
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
/*
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
      jobDesc: projectAbbr,
      subsystemName: "采集"
    })).data.records.map((v) => ({
      tableAbbr: v.jobDesc.split('_')[2]
    })).filter(item => !basicTableNames.includes(item.tableAbbr.toLowerCase())).filter((obj, index, array) => {
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
    })).filter(item => !basicTableNames.includes(item.tableAbbr.toLowerCase())).filter((obj, index, array) => {
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
*/

const setDefaultActionTable = (node: TreeOption): TreeOption[] => {

  let children: TreeOption[] = []

  const c10Options: TreeOption = {
    label: '行政许可',
    key: `${node.key}-c10`,
    isLeaf: false,
    children: [{
      label: 'C1010',
      key: `${node.key}-c1010`,
      isLeaf: true
    }]
  }
  children.push(c10Options)

  const c20Tables = ['c2010', 'c2011', 'c2020', 'c2030', 'c2040', 'c2050', 'c2051', 'c2060', 'c2070', 'c2080', 'c2100', 'c2090']
  const c20Options: TreeOption = {
    label: '行政处罚',
    key: `${node.key}-c20`,
    isLeaf: false,
    children: c20Tables.map((v): TreeOption => ({
      label: v.toUpperCase(),
      key: `${node.key}-${v}`,
      isLeaf: true
    }))
  }
  children.push(c20Options)

  const c30Tables = ['c3010', 'c3011', 'c3020', 'c3030', 'c3040']
  const c30Options: TreeOption = {
    label: '行政强制',
    key: `${node.key}-c30`,
    isLeaf: false,
    children: c30Tables.map((v): TreeOption => ({
      label: v.toUpperCase(),
      key: `${node.key}-${v}`,
      isLeaf: true
    }))
  }
  children.push(c30Options)

  const c40Options: TreeOption = {
    label: '行政征收',
    key: `${node.key}-c40`,
    isLeaf: false,
    children: [{
      label: 'C4010',
      key: `${node.key}-c4010`,
      isLeaf: true
    }]
  }
  children.push(c40Options)

  const c41Options: TreeOption = {
    label: '行政征用',
    key: `${node.key}-c41`,
    isLeaf: false,
    children: [{
      label: 'C4110',
      key: `${node.key}-c4110`,
      isLeaf: true
    }]
  }
  children.push(c41Options)

  const c60Tables = ['c6010', 'c6020', 'c6030', 'c6040']
  const c60Options: TreeOption = {
    label: '行政检查',
    key: `${node.key}-c60`,
    isLeaf: false,
    children: c60Tables.map((v): TreeOption => ({
      label: v.toUpperCase(),
      key: `${node.key}-${v}`,
      isLeaf: true
    }))
  }
  children.push(c60Options)

  const c70Options: TreeOption = {
    label: '行为救济',
    key: `${node.key}-c70`,
    isLeaf: false,
    children: [{
      label: 'C7090',
      key: `${node.key}-c7090`,
      isLeaf: true
    }]
  }
  children.push(c70Options)

  return children
}

const handleExpandedKeys = (keys: Array<string>) => {
  useProjectTreeStore().defaultExpandedKeys = keys as string[]
}

const handleSelectedKeys = (keys: Array<string>) => {
  useProjectTreeStore().defaultSelectedKeys = keys as string[]
}

const projectUserOptionsInit = async () => {
  projectUserOptions.value = (await get_job_project_list_all())?.map(
      ((v: {
        userId: any; name: any; id: number
      }) => ({
        label: v.name.replace('广东', '').replace('数据归集', '').replace('行政行为', ''),
        userId: v.userId,
        value: v.id.toString()
      }))
  ) || []
}

function renderSuffix({option}: { option: TreeOption }) {
  // 所属任务后缀
  if ((option.key.toString() == '0-6') ||
      (option.key.toString() == '0-11') ||
      (option.key.toString() == '0-5') ||
      (option.key.toString().startsWith('1-0') && option.key.toString().split('-').length == 3) ||
      (option.key.toString().startsWith('1-1') && option.key.toString().split('-').length == 3) ||
      (option.key.toString() == '2-0') ||
      (option.key.toString() == '2-1')
  ) {
    const userProjects = projectUserOptions.value?.filter(opt => opt.userId == user.dcUserInfo.user.id) || []
    if (userProjects.some(project => project.label == option.label)) {
      return h(
          NIcon,
          {color: '#80e8b1'},
          {default: () => h(Star24Filled)}
      )
    }
  }
}

</script>

<style scoped>

</style>
