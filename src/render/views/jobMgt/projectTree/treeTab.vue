<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
    <n-layout has-sider style="height: calc(100vh - 92px);">
      <n-layout-sider content-style="padding: 0 8px 8px 8px;overflow:hidden">
        <n-grid :cols="8" :y-gap="4">
          <n-gi :span="8">
            <n-input
                id="searchInput"
                ref="searchInput"
                v-model:value="pattern"
                placeholder="搜索"
                style="height:30px;"
                clearable
            >
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
          <n-gi :span="8">
            <n-space id="toolBtnBar" style="gap:2px">
              <n-button
                  quaternary
                  size="small"
                  @click="handleTreeNodeInit"
                  title="刷新"
              >
                <n-icon>
                  <ArrowRepeatAll24Regular/>
                </n-icon>
              </n-button>

              <n-divider vertical style="margin: 0 2px 0 2px"/>
              <n-button
                  quaternary
                  size="small"
                  @click="handleTreeFocusNode"
                  title="定位至当前节点"
              >
                <n-icon>
                  <Focus2/>
                </n-icon>
              </n-button>
              <n-button
                  quaternary
                  size="small"
                  @click="handleTreeCollapseAll"
                  title="全部收起"
              >
                <n-icon>
                  <ArrowMinimizeVertical24Regular/>
                </n-icon>
              </n-button>

              <n-divider vertical style="margin: 0 2px 0 2px"/>

              <n-button
                  quaternary
                  size="small"
                  @click="handleTreeOnlyShowUserJob"
                  :title="useProjectTreeStore().onlyShowUserJob?'切换到:显示全部任务':'切换到:仅显示当前用户任务'"
              >
                <n-icon>
                  <Bookmark24Regular v-if="useProjectTreeStore().onlyShowUserJob"/>
                  <BookmarkOff24Regular v-else/>
                </n-icon>
              </n-button>

              <n-button
                  quaternary
                  size="small"
                  @click="handleHideEmptyNodes"
                  :title="useProjectTreeStore().hideEmptyNodes?'切换到:显示无任务空节点':'切换到:隐藏无任务空节点'"
              >
                <n-icon>
                  <CircleOff20Regular v-if="useProjectTreeStore().hideEmptyNodes"/>
                  <Circle20Regular v-else/>
                </n-icon>
              </n-button>

            </n-space>
          </n-gi>
        </n-grid>
        <n-divider style="margin: 2px 0 0 0"/>
        <n-tree
            ref="tree"
            class="pr-2"
            style="height: calc(100vh - 162px);user-select: none"
            block-line
            expand-on-click
            selectable
            :cancelable="false"
            virtual-scroll
            :data="useProjectTreeStore().treeNodes"
            @load="handleLoad"

            :selected-keys="useProjectTreeStore().selectedKeys"

            @update:selectedKeys="handleSelectedKeys"

            :expanded-keys="useProjectTreeStore().expandedKeys"

            @update:expandedKeys="handleExpandedKeys"

            :pattern="pattern"
            :show-irrelevant-nodes="!filterNode"

            :render-suffix="renderSuffix"
            :render-switcher-icon="renderSwitcherIcon"

            @focus="handleTreeFocus"

        />
      </n-layout-sider>
      <n-layout-content content-style="padding: 12px;border-left: 1px solid rgb(237 237 237)">
        <template v-if="!useProjectTreeStore().selectedKeys[0].startsWith('2-')">
          <n-tabs type="line" animated>
            <n-tab-pane name="1" tab="数据归集任务">
              <job-tab/>
            </n-tab-pane>
            <n-tab-pane name="2" tab="中台相关表">
              <project-tables-tab/>
            </n-tab-pane>
            <!--            <n-tab-pane name="3" tab="质检情况">
                          <job-inspection-tab/>
                        </n-tab-pane>-->
          </n-tabs>
        </template>
        <!--省政数局主体信息采集-->
        <szsj-subject-tab v-if="useProjectTreeStore().selectedKeys[0]==='2-0'"/>

        <front-end-data-vol-tab v-if="useProjectTreeStore().selectedKeys[0]==='2-1-0'"/>
        <data-lake-data-vol-tab v-if="useProjectTreeStore().selectedKeys[0]==='2-1-1'"/>

      </n-layout-content>
    </n-layout>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {get_job_project_list_all, get_workflow_list_by_project_id} from "@render/api/datacenter.api";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {useUserStore} from "@render/stores/user";
import {projectIdOptions, projectIdOptionsUpdate} from "@render/typings/datacenterOptions";
import {nTreeFindOptionByKey} from "@render/utils/naiveui/treeOption";
import JobTab from "@render/views/jobMgt/projectTree/jobTab.vue";
import DataLakeDataVolTab from "@render/views/jobMgt/projectTree/other/dataLakeDataVolTab.vue";
import FrontEndDataVolTab from "@render/views/jobMgt/projectTree/other/frontEndDataVolTab.vue";
import ProjectTablesTab from "@render/views/jobMgt/projectTree/projectTablesTab.vue";
import SzsjSubjectTab from "@render/views/jobMgt/projectTree/other/szsjSubjectTab.vue";
import {
  Bookmark24Filled,
  ArrowMinimizeVertical24Regular,
  ArrowRepeatAll24Regular,
  ChevronRight24Regular,
  Bookmark24Regular,
  BookmarkOff24Regular,
  Circle20Regular,
  CircleOff20Regular
} from "@vicons/fluent";
import {isEmpty} from "lodash-es";
import {onMounted, ref, h} from 'vue'
import {NButton, NIcon, TreeOption, TreeInst, NTag, SelectOption} from 'naive-ui'
import {Search} from '@vicons/ionicons5'
import {Filter, FilterOff, Focus2} from '@vicons/tabler'

// 任务树
const tree = ref<TreeInst | null>(null)

// region 节点搜索
const searchInput = ref(null)
const pattern = ref()
const filterNode = ref(false)

const handleTreeFocus = () => {
  searchInput.value.focus()
}
// endregion

// region 按钮栏

// 树刷新
const handleTreeNodeInit = () => {
  useProjectTreeStore().$reset()
  useProjectTreeStore().treeNodesInit()
}

// 滚动聚焦至当前选中节点
const handleTreeFocusNode = () => {
  const opt = nTreeFindOptionByKey(useProjectTreeStore().treeNodes, useProjectTreeStore().selectedKeys[0])
  pattern.value = opt.label
  tree.value.scrollTo({key: useProjectTreeStore().selectedKeys[0]})
}

// 树全部收起
const handleTreeCollapseAll = () => {
  useProjectTreeStore().expandedKeys = []
}

// 仅显示当前用户任务
const handleTreeOnlyShowUserJob = async () => {
  useProjectTreeStore().onlyShowUserJob = !useProjectTreeStore().onlyShowUserJob

  useProjectTreeStore().treeNodesInit()
  tree.value?.scrollTo({key: useProjectTreeStore().selectedKeys[0]})
}

// 隐藏无任务空节点
const handleHideEmptyNodes = () => {
  useProjectTreeStore().hideEmptyNodes = !useProjectTreeStore().hideEmptyNodes
  useProjectTreeStore().treeNodesInit()
  tree.value?.scrollTo({key: useProjectTreeStore().selectedKeys[0]})
}

// endregion

// region 项目与用户关系
const user = useUserStore()
const projectUserOptions = ref<Array<SelectOption>>()

const projectUserOptionsInit = async () => {
  projectUserOptions.value = (await get_job_project_list_all())?.map(
      ((v: {
        userId: any;
        name: any;
        id: number
      }) => ({
        label: v.name.replace('广东', '').replace('数据归集', '').replace('行政行为', ''),
        userId: v.userId,
        value: v.id.toString()
      }))
  ) || []
}

// endregion

onMounted(async () => {

  await projectUserOptionsInit()

  useProjectTreeStore().treeNodesInit()
  await projectIdOptionsUpdate()

  // 初始化滚动到选中的节点上
  tree.value?.scrollTo({key: useProjectTreeStore().selectedKeys[0]})
})

const handleLoad = (node: TreeOption) => {
  return new Promise<void>(async (resolve) => {
    const userProjectIds = projectUserOptions.value?.filter(opt => opt.userId == user.dcUserInfo.user.id).map(opt => opt.value)

    if (node.key.toString() === '1-0') {
      // 省直行为数据
      let nodes: TreeOption[] = projectIdOptions.filter((element) =>
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
      }))

      if (useProjectTreeStore().onlyShowUserJob && userProjectIds) {
        nodes = nodes.filter(node => userProjectIds.includes(node.key.toString().split('-')[2]))
      }

      node.children = nodes
    } else if (node.key.toString() === '1-1') {
      // 地市行为数据
      let nodes: TreeOption[] = projectIdOptions.filter((element) =>
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
      }))

      if (useProjectTreeStore().onlyShowUserJob) {
        nodes = nodes.filter(node => userProjectIds.includes(node.key.toString().split('-')[2]))
      }

      node.children = nodes
    } else {
      node.children = await setDefaultActionTable(node)
    }
    resolve()
  })
}

const setDefaultActionTable = async (node: TreeOption): Promise<TreeOption[]> => {
  const projectId = node.key.toString().split('-')[2]
  // 工作流任务
  const allActionRkJobNames = (await get_workflow_list_by_project_id(projectId)).data.map(job => job.procName.toLowerCase().split('_')[2])

  let children: TreeOption[] = []

  let c10Options: TreeOption = {
    label: '行政许可',
    key: `${node.key}-c10`,
    isLeaf: false,
    children: [{
      label: 'C1010',
      key: `${node.key}-c1010`,
      isLeaf: true
    }]
  }

  if (useProjectTreeStore().hideEmptyNodes) {
    const c10Nodes = c10Options.children.filter(node => allActionRkJobNames.includes(node.label.toLowerCase()))
    if (!isEmpty(c10Nodes)) {
      c10Options.children = c10Nodes
      children.push(c10Options)
    }
  } else {
    children.push(c10Options)
  }

  const c20Tables = ['c2010', 'c2011', 'c2020', 'c2030', 'c2040', 'c2050', 'c2051', 'c2060', 'c2070', 'c2080', 'c2100', 'c2090']
  let c20Options: TreeOption = {
    label: '行政处罚',
    key: `${node.key}-c20`,
    isLeaf: false,
    children: c20Tables.map((v): TreeOption => ({
      label: v.toUpperCase(),
      key: `${node.key}-${v}`,
      isLeaf: true
    }))
  }

  if (useProjectTreeStore().hideEmptyNodes) {
    const c20Nodes = c20Options.children.filter(node => allActionRkJobNames.includes(node.label.toLowerCase()))
    if (!isEmpty(c20Nodes)) {
      c20Options.children = c20Nodes
      children.push(c20Options)
    }
  } else {
    children.push(c20Options)
  }

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

  if (useProjectTreeStore().hideEmptyNodes) {
    const c30Nodes = c30Options.children.filter(node => allActionRkJobNames.includes(node.label.toLowerCase()))
    if (!isEmpty(c30Nodes)) {
      c30Options.children = c30Nodes
      children.push(c30Options)
    }
  } else {
    children.push(c30Options)
  }

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

  if (useProjectTreeStore().hideEmptyNodes) {
    const c40Nodes = c40Options.children.filter(node => allActionRkJobNames.includes(node.label.toLowerCase()))
    if (!isEmpty(c40Nodes)) {
      c40Options.children = c40Nodes
      children.push(c40Options)
    }
  } else {
    children.push(c40Options)
  }

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

  if (useProjectTreeStore().hideEmptyNodes) {
    const nodes = c41Options.children.filter(node => allActionRkJobNames.includes(node.label.toLowerCase()))
    if (!isEmpty(nodes)) {
      c41Options.children = nodes
      children.push(c41Options)
    }
  } else {
    children.push(c41Options)
  }

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

  if (useProjectTreeStore().hideEmptyNodes) {
    const nodes = c60Options.children.filter(node => allActionRkJobNames.includes(node.label.toLowerCase()))
    if (!isEmpty(nodes)) {
      c60Options.children = nodes
      children.push(c60Options)
    }
  } else {
    children.push(c60Options)
  }

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

  if (useProjectTreeStore().hideEmptyNodes) {
    const nodes = c70Options.children.filter(node => allActionRkJobNames.includes(node.label.toLowerCase()))
    if (!isEmpty(nodes)) {
      c70Options.children = nodes
      children.push(c70Options)
    }
  } else {
    children.push(c70Options)
  }

  return children
}

const handleExpandedKeys = (keys: Array<string>) => {
  useProjectTreeStore().expandedKeys = keys
}

const handleSelectedKeys = (keys: Array<string>) => {
  useProjectTreeStore().selectedKeys = keys
}

const renderSuffix = ({option}: {
  option: TreeOption
}) => {
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
          {default: () => h(Bookmark24Filled)}
      )
    }
  }
}

const renderSwitcherIcon = () => {
  return h(NIcon, null, {default: () => h(ChevronRight24Regular)})
}
</script>

<style scoped>
:deep(#searchInput .n-input-wrapper) {
  padding-left: 8px;
  padding-right: 8px;

}

:deep(#searchInput .n-input__input-el) {
  height: 30px;
  line-height: 30px;
}

:deep(#toolBtnBar .n-button) {
  padding-left: 6px;
  padding-right: 6px;
  font-size: 18px;
}

</style>
