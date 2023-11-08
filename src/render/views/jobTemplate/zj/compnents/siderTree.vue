<template>
  <n-grid :cols="8" :y-gap="4">
    <n-gi :span="8">
      <n-input
          id="searchInput"
          ref="searchInput"
          v-model:value="pattern"
          :placeholder="searchInputPlaceHolder"
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
            @click="reloadTree"
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
            v-if="showAddButton"
            quaternary
            size="small"
            @click="handleAddTreeNode"
            title="添加"
            :disabled="addButtonDisable"
        >
          <n-icon>
            <Add24Filled/>
          </n-icon>
        </n-button>

        <n-button
            v-if="showRemoveButton"
            quaternary
            size="small"
            @click="handleRemoveTreeNode"
            title="删除"
            :disabled="removeButtonDisable"
        >
          <n-icon>
            <RemoveRound/>
          </n-icon>
        </n-button>

      </n-space>
    </n-gi>
  </n-grid>
  <n-divider style="margin: 2px 0 0 0"/>
  <template v-if="treeNodes.length>0">
    <n-tree
        ref="tree"
        class="pr-2"
        block-line
        :expand-on-click="expandOnClick"
        :cancelable="false"
        selectable
        virtual-scroll

        style="height: calc(100vh - 225px);user-select: none"

        :data="treeNodes"

        :pattern="pattern"
        :show-irrelevant-nodes="!filterNode"

        :expanded-keys="expandedKeys"
        @update:expanded-keys="handleUpdateExpandedKeys"

        :selected-keys="_selectedKeys"
        @update:selected-keys="handleUpdateSelectedKeys"

        @focus="handleTreeFocus"

        :render-switcher-icon="renderSwitcherIcon"

        :render-label="renderLabel"
    />
  </template>
  <template v-else>
    <n-empty class="mt-2" :description="emptyDescription">
    </n-empty>
  </template>

</template>

<script setup lang="ts">
import {
  ArrowMinimizeVertical24Regular,
  ArrowRepeatAll24Regular,
  ChevronRight24Regular,
  Add24Filled
} from "@vicons/fluent"
import {RemoveRound} from '@vicons/material'
import {Search} from "@vicons/ionicons5"
import {Filter, FilterOff, Focus2} from "@vicons/tabler"
import {NButton, NIcon, NSpace, TreeInst, TreeOption} from "naive-ui"
import {h, ref, watch} from "vue";

const props = defineProps({
  treeNodes: {
    type: Array<TreeOption>,
    default: [],
    required: true
  },
  selectedKeys: {
    type: Array<string | number>,
    default: ['root'],
    required: true
  },
  searchInputPlaceHolder: {
    type: String,
    default: '搜索'
  },
  emptyDescription: {
    type: String,
    default: '这里什么都没有'
  },
  showAddButton: {
    type: Boolean,
    default: false
  },
  addButtonDisable: {
    type: Boolean,
    default: false
  },
  showRemoveButton: {
    type: Boolean,
    default: false
  },
  removeButtonDisable: {
    type: Boolean,
    default: false
  },
  renderLabel: {
    default: undefined
  },
  expandOnClick: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'reloadTree',
  'onSelectedKeysUpdate',
  'onTreeNodeAdd',
  'onTreeNodeRemove'
])

const tree = ref<TreeInst | null>(null)

const expandedKeys = ref(['root'])
const _selectedKeys = ref<(string | number)[]>(['root'])

watch(() => props.selectedKeys, (v) => {
  _selectedKeys.value = v
})

const handleUpdateExpandedKeys = (keys: Array<string>) => {
  expandedKeys.value = keys
}

const handleUpdateSelectedKeys = (keys: Array<string | number>) => {
  emit('onSelectedKeysUpdate', keys)
}

const renderSwitcherIcon = () => {
  return h(NIcon, null, {default: () => h(ChevronRight24Regular)})
}

// region 节点搜索
const searchInput = ref(null)
const pattern = ref()
const filterNode = ref(false)

const handleTreeFocus = () => {
  searchInput.value.focus()
}
// endregion

// region 按钮栏

// 刷新
const reloadTree = () => {
  emit('reloadTree')
}

// 滚动聚焦至当前选中节点
const handleTreeFocusNode = () => {
  const opt = nTreeFindOptionByKey(props.treeNodes, props.selectedKeys[0])
  pattern.value = opt.label
  tree.value.scrollTo({key: props.selectedKeys[0]})
}

const nTreeFindOptionByKey = (treeOptions: TreeOption[], key: any): TreeOption => {
  for (const option of treeOptions) {
    if (option.key as string === key) {
      return option
    }
    if (option.children) {
      // 继续递归查找子节点
      const opt = nTreeFindOptionByKey(option.children, key);
      if (opt) {
        return opt
      }
    }
  }
}

// 树全部收起
const handleTreeCollapseAll = () => {
  expandedKeys.value = []
}

// 添加
const handleAddTreeNode = () => {
  emit('onTreeNodeAdd')
}

const handleRemoveTreeNode = () => {
  emit('onTreeNodeRemove')
}

// endregion

</script>

<style scoped>

</style>
