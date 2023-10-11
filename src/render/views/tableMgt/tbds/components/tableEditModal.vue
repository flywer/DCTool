<template>
  <n-modal
      v-model:show="_show"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="title"
      :size="'small'"
      style="width: 850px"
  >
    <div class="container mt-4" ref="container">
      <div class="left-panel bg-amber-400" :style="{ flex: `${leftWidth}px` }">
        <!-- 左侧内容 -->
        <n-layout>
          <n-layout-header class="header">
            <n-space>
              <n-button quaternary :size="'small'" type="primary" :round="false" @click="handleAddField">
                <template #icon>
                  <n-icon>
                    <Add24Regular/>
                  </n-icon>
                </template>
              </n-button>
            </n-space>
          </n-layout-header>
          <n-layout-content class="content" style="overflow: hidden">
            <n-tree
                ref="tableTree"
                class="pb-3"
                :data="treeData"
                style="user-select: none;height: 415px;"
                selectable
                block-line
                :virtual-scroll="true"
                :scrollbar-props="{
                    xScrollable:true
                }"
                :draggable="false"
                :cancelable="false"
                :default-expanded-keys="['root','fields']"
                :render-switcher-icon="renderSwitcherIcon"
                @update:selected-keys="handleSelectedKeys"
                :selected-keys="curKey"
                :render-label="renderLabel"
                @drop="handleDrop"
                :allow-drop="handleAllowDrop"
            />
          </n-layout-content>
        </n-layout>
      </div>
      <div class="divider" @mousedown="startDragging"></div>
      <div class="right-panel" :style="{ flex: `${rightWidth}px` }">
        <!-- 右侧内容 -->
        <n-layout>
          <n-layout-header class="header">
            <component :is="contentTitle" class="select-none"/>
          </n-layout-header>
          <n-layout-content class="content">
            <n-scrollbar v-if="curKey[0] !='fields'" style="max-height: 430px" trigger="hover">
              <n-alert v-if="showFromAlert" title="表单信息存在问题" class="m-2" type="error" closable
                       @close="showFromAlert = false"
              />
              <n-form
                  ref="formRef"
                  :size="'small'"
                  :model="formModel"
                  :rules="formRules"
                  label-placement="left"
                  label-width="90"
                  label-align="left"
                  :show-require-mark="false"
                  style="padding: 12px"
              >
                <template v-if="curKey[0] === 'root' ">
                  <n-form-item label="名称" path="tableName">
                    <n-input
                        v-model:value="formModel.tableName"
                        placeholder=""
                        @update:value="handleUpdateName"
                    />
                  </n-form-item>
                  <n-form-item label="注释" path="tableComment">
                    <n-input v-model:value="formModel.tableComment" placeholder=""/>
                  </n-form-item>
                  <n-form-item label="存储格式" path="storageFormat">
                    <n-select
                        v-model:value="formModel.storageFormat"
                        placeholder=""
                        :options="storeFormatOptions"
                    />
                  </n-form-item>
                </template>


                <template v-if="curKey[0].startsWith('field-') ">
                  <template v-for="(field,index) in formModel.fieldsList">
                    <template v-if="curKey[0] === `field-${field.id}`">
                      <n-form-item label="名称" :path="'fieldsList['+index+'].fieldName'">
                        <n-input v-model:value="field.fieldName" placeholder="" @update:value="handleUpdateName"/>
                      </n-form-item>
                      <n-form-item label="注释">
                        <n-input v-model:value="field.fieldDescribe" placeholder=""/>
                      </n-form-item>
                      <n-form-item label="数据类型" :path="'fieldsList['+index+'].fieldType'">
                        <n-select
                            v-model:value="field.fieldType"
                            placeholder=""
                            filterable
                            :options="fieldTypeOptions"
                        />
                      </n-form-item>
                      <n-form-item
                          label="长度"
                          :path="'fieldsList['+index+'].fieldSize'"
                          v-if="setFieldSizeFlag(field)"
                      >
                        <n-input-number
                            v-model:value="field.fieldSize"
                            placeholder=""
                            :min="1"
                            :max="setFieldMaxSize(field)"
                        />
                      </n-form-item>
                      <n-form-item
                          label="精度"
                          :path="'fieldsList['+index+'].fieldPrecision'"
                          v-if="setFieldPrecision(field)"
                      >
                        <n-input-number
                            v-model:value="field.fieldPrecision"
                            placeholder=""
                            :min="1"
                            :max="1"
                        />
                      </n-form-item>
                      <n-form-item label="是否必填" path="fieldsList.emptyFlag">
                        <n-checkbox
                            v-model:checked="field.emptyFlagChecked"
                            @update:checked="handleEmptyFlagCheckedUpdate"
                        />
                      </n-form-item>
                      <!-- <n-form-item label="默认值" path="fieldsList.defaultValue">
                                              <n-input v-model:value="field.defaultValue" placeholder=""/>
                                            </n-form-item>-->
                    </template>
                  </template>
                </template>


              </n-form>
            </n-scrollbar>

            <template v-if="curKey[0]==='fields'">
              <n-data-table
                  id="fieldsTable"
                  :size="'small'"
                  class="overflow-x-auto"
                  :columns="fieldColumnsRef"
                  :data="formModel.fieldsList"
                  :max-height="387"
              />
            </template>
          </n-layout-content>
        </n-layout>

      </div>
    </div>

    <template #action>
      <n-button type="primary" :size="'small'" @click="handleSave" :loading="isSaving">保存
      </n-button>
      <n-button :size="'small'" @click="_show=!_show">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {TableFieldType} from "@common/datacenter.types";
import {
  get_table_field_type,
  get_table_info_by_id,
  get_table_store_format,
  update_table
} from "@render/api/datacenter.api";
import {
  FormInst,
  NButton,
  NIcon,
  TreeOption,
  useThemeVars,
  NSpace,
  NFormItem,
  NInput,
  TreeInst,
  SelectOption, SelectGroupOption, DataTableColumns, TreeDropInfo
} from "naive-ui";
import {ref, watch, onMounted, onUnmounted, h} from "vue";
import {
  Folder24Filled,
  ChevronRight24Regular,
  TableInsertColumn24Regular,
  Table24Filled,
  Add24Regular,
  ArrowSort24Regular,
  ArrowSortDown24Regular,
  ArrowSortUp24Regular
} from '@vicons/fluent'
import {uuid} from "vue3-uuid";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  },
  title: {
    type: String,
    default: '编辑'
  },
  tableId: {
    type: String,
    required: true,
  }
})

const emit = defineEmits(['update:show', 'onAfterLeave'])

const _show = ref(false)

watch(() => props.show, (v) => {
  _show.value = v
})
watch(_show, (v) => {
  if (v) {
    formModelInit().then(() => {
      treeInit().then(() => {
        rightContentInit()
      })
    })

  } else {
    modalReset()
  }
  emit('update:show', v)
})

// region 横向宽度调整

const container = ref<HTMLElement | null>(null);

const leftWidth = ref(0); // 左侧布局的默认宽度
const rightWidth = ref(360);

let isDragging = false;

const startDragging = () => {
  isDragging = true;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;

  const containerRect = container.value.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const mouseX = e.clientX;

  const minLeftWidth = 160; // 左侧布局的最小宽度

  const newLeftWidth = Math.max(
      minLeftWidth,
      Math.min(mouseX - containerRect.left, containerWidth - minLeftWidth)
  );

  leftWidth.value = newLeftWidth;
  rightWidth.value = containerWidth - newLeftWidth;
};

const stopDragging = () => {
  isDragging = false;
};

onMounted(() => {
  container.value = document.querySelector('.container');
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopDragging);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopDragging);
});
// endregion

// region 表结构树
const tableTree = ref<TreeInst>(null)
const treeData = ref<TreeOption[]>([])
const contentTitle = ref(null) // 右侧标题
const curKey = ref(['root'])
const treeInit = async () => {
  treeData.value = [
    {
      label: formModel.value.tableName,
      key: 'root',
      isLeaf: false,
      prefix: () => {
        return h(
            NIcon,
            {color: useThemeVars().value.primaryColor},
            {default: () => h(Table24Filled)}
        )
      },
      children: [
        {
          label: '列',
          key: 'fields',
          isLeaf: false,
          prefix: () => {
            return h(
                NIcon,
                {color: useThemeVars().value.primaryColor},
                {default: () => h(Folder24Filled)}
            )
          },
          children: formModel.value.fieldsList.map((v) => ({
            label: v.fieldName,
            key: `field-${v.id}`,
            prefix: () => {
              return h(
                  NIcon,
                  {color: useThemeVars().value.primaryColor},
                  {default: () => h(TableInsertColumn24Regular)}
              )
            },
          }))
        }
      ]
    }
  ]

  contentTitle.value = h(NSpace, {
        align: 'center',
        style: {
          paddingLeft: '12px'
        }
      },
      [
        h(
            NIcon,
            {
              style: {
                lineHeight: '30px'
              }
            },
            {default: () => h(Table24Filled)}
        ),
        h('div', {}, formModel.value.tableName)
      ])
}
const renderSwitcherIcon = () => {
  return h(NIcon, null, {default: () => h(ChevronRight24Regular)})
}
const renderLabel = (info: { option: TreeOption, checked: boolean, selected: boolean }) => {
  if (info.option.key === 'root') {
    return formModel.value.tableName
  } else if (info.option.key === 'fields') {
    return h('div', {}, [
      h('span', {class: 'pr-2'}, info.option.label),
      h('span', {
        style: {
          color: useThemeVars().value.textColor3,
          fontSize: '12px'
        }
      }, formModel.value.fieldsList.length)
    ])

  } else if (info.option.key.toString().startsWith('field-')) {
    const fieldId = info.option.key.toString().split('-')[1]
    const fieldData = formModel.value.fieldsList.find(field => field.id == fieldId)

    let fieldType: string

    if (fieldData == undefined) {
      return info.option.label
    } else {
      if (fieldData.fieldType.includes('(')) {
        fieldType = fieldData.fieldType
      } else {
        if (fieldData.fieldSize == null) {
          fieldType = `${fieldData.fieldType}`
        } else {
          fieldType = `${fieldData.fieldType}(${fieldData.fieldSize})`
        }
      }
      return h('div', {}, [
        h('span', {class: 'pr-2'}, fieldData.fieldName),
        h('span', {
          style: {
            color: useThemeVars().value.textColor3,
            fontSize: '12px'
          }
        }, fieldType)
      ])
    }
  } else {
    return info.option.label
  }

}
const handleSelectedKeys = (keys: Array<string>) => {
  if (formRef.value != null) {
    formRef.value?.validate((errors) => {
      if (!errors) {
        showFromAlert.value = false
        curKey.value = keys
        handleContentTitleUpdate()
      } else {
        showFromAlert.value = true
      }
    })
  } else {
    curKey.value = keys
    handleContentTitleUpdate()
  }
}

function findSiblingsAndIndex(
    node: TreeOption,
    nodes?: TreeOption[]
): [TreeOption[], number] | [null, null] {
  if (!nodes) return [null, null]
  for (let i = 0; i < nodes.length; ++i) {
    const siblingNode = nodes[i]
    if (siblingNode.key === node.key) return [nodes, i]
    const [siblings, index] = findSiblingsAndIndex(node, siblingNode.children)
    if (siblings && index !== null) return [siblings, index]
  }
  return [null, null]
}

const handleDrop = ({
                      node,
                      dragNode,
                      dropPosition
                    }: TreeDropInfo) => {

  const [dragNodeSiblings, dragNodeIndex] = findSiblingsAndIndex(
      dragNode,
      treeData.value
  )

  if (dragNodeSiblings === null || dragNodeIndex === null) return
  dragNodeSiblings.splice(dragNodeIndex, 1)
  if (dropPosition === 'inside') {
    if (node.children) {
      node.children.unshift(dragNode)
    } else {
      node.children = [dragNode]
    }
  } else if (dropPosition === 'before') {
    const [nodeSiblings, nodeIndex] = findSiblingsAndIndex(
        node,
        treeData.value
    )
    if (nodeSiblings === null || nodeIndex === null) return
    nodeSiblings.splice(nodeIndex, 0, dragNode)

    if (dragNode.key.toString().startsWith('field-')) {
      const draggedField = formModel.value.fieldsList.splice(dragNodeIndex, 1)[0];
      formModel.value.fieldsList.splice(nodeIndex, 0, draggedField)
    }

  } else if (dropPosition === 'after') {
    const [nodeSiblings, nodeIndex] = findSiblingsAndIndex(
        node,
        treeData.value
    )
    if (nodeSiblings === null || nodeIndex === null) return
    nodeSiblings.splice(nodeIndex + 1, 0, dragNode)

    if (dragNode.key.toString().startsWith('field-')) {
      const draggedField = formModel.value.fieldsList.splice(dragNodeIndex, 1)[0];
      formModel.value.fieldsList.splice(nodeIndex + 1, 0, draggedField)
    }
  }

  treeData.value = Array.from(treeData.value)
}

const handleAllowDrop = (info: {
  dropPosition: 'before' | 'inside' | 'after',
  node: TreeOption,
  phase: 'drag' | 'drop'
}) => {
  if (info.phase === 'drag') {
    // 根节点、列节点不能drop
    if (info.node.key === 'root' || info.node.key === 'fields') {
      return false
    } else {
      return !(info.node.key.toString().startsWith('field-') && info.dropPosition === 'inside');
    }
  }
  return true
}

const handleContentTitleUpdate = () => {
  if (curKey.value[0] === 'root') {
    contentTitle.value = h(NSpace, {
      align: 'center',
      style: {
        paddingLeft: '12px'
      }
    }, [
      h(
          NIcon,
          {
            style: {
              lineHeight: '30px'
            }
          },
          {default: () => h(Table24Filled)}
      ),
      h('div', {}, formModel.value.tableName)
    ])
  } else if (curKey.value[0] === 'fields') {
    contentTitle.value = h(NSpace, {
      align: 'center',
      style: {
        paddingLeft: '12px'
      }
    }, [
      h(
          NIcon,
          {
            style: {
              lineHeight: '30px'
            }
          },
          {default: () => h(Folder24Filled)}
      ),
      h('div', {}, `列(${treeData.value[0].label})`)
    ])
  } else if (curKey.value[0].startsWith('field-')) {
    const fieldData = formModel.value.fieldsList.find(field => field.id == curKey.value[0].split('-')[1])

    contentTitle.value = h(NSpace, {
      align: 'center',
      style: {
        paddingLeft: '12px'
      }
    }, [
      h(
          NIcon,
          {
            style: {
              lineHeight: '30px'
            }
          },
          {default: () => h(TableInsertColumn24Regular)}
      ),
      h('div', {}, fieldData.fieldName)
    ])
  }
}
const handleUpdateName = () => {
  handleContentTitleUpdate()
}
const nTreeFindOptionByKey = (treeOptions: TreeOption[], key: any): TreeOption => {
  for (const option of treeOptions) {
    if (option.key as string === key) {
      return option
    }
    if (option.children) {
      // 继续递归查找子节点
      return nTreeFindOptionByKey(option.children, key);
    }
  }
}

const handleAddField = () => {
  const newField = {
    id: uuid.v4().replace(/-/g, ''),
    fieldOldName: null,
    fieldName: `列_name${formModel.value.fieldsList.length + 1}`,
    fieldType: 'int',
    fieldSize: null,
    fieldDescribe: null,
    fieldPrecision: null,
    emptyFlag: 0,
    keyFlag: 0,
    tableId: formModel.value.tableId,
    defaultValue: null,
    emptyFlagChecked: false,
    isTemp: true
  }

  formModel.value.fieldsList.push(newField)

  treeInit().then(() => {
    rightContentInit()
    curKey.value = [`field-${newField.id}`]
    tableTree.value.scrollTo({key: `field-${newField.id}`})
    handleContentTitleUpdate()
  })

}

const modalReset = () => {
  // 当前选中值
  curKey.value = ['root']

  formModel.value.tableComment = null
  formModel.value.tableName = null
  formModel.value.storageFormat = null
  formModel.value.fieldsList = []

}

// endregion

// region 表单
const formRef = ref<FormInst | null>(null)
const formModel = ref({
  tableId: null,
  tableName: null,
  tableComment: null,
  storageFormat: null,
  fieldsList: [] as TableFieldType[]
})
const formRules = ref({})
const showFromAlert = ref(false)
const storeFormatOptions = ref<Array<SelectOption | SelectGroupOption>>()
const fieldTypeOptions = ref<Array<SelectOption | SelectGroupOption>>()
const rightContentInit = () => {
  storeFormatOptionsInit()
  fieldTypeOptionsInit()
  formRulesInit()
}
const formModelInit = async () => {
  await get_table_info_by_id(props.tableId).then(res => {
    if (res.success) {
      const tableData = res.data
      const setFieldSize = (field: TableFieldType) => {
        // 判断字段长度写在哪
        if (field.fieldType.split('(').length > 1) {
          const match = field.fieldType.match(/\((\d+)\)/);
          if (match) {
            return parseInt(match[1]);
          }
        } else {
          return field.fieldSize
        }
      }

      formModel.value.tableId = tableData.id
      formModel.value.tableComment = tableData.tableComment
      formModel.value.tableName = tableData.tableName
      formModel.value.storageFormat = tableData.storageFormat
      formModel.value.fieldsList = tableData.datamodelTableFieldsVoList.map(field => ({
        id: field.id,
        fieldOldName: field.fieldOldName,
        fieldName: field.fieldName,
        fieldType: field.fieldType.split('(')[0],
        fieldSize: setFieldSize(field),
        fieldDescribe: field.fieldDescribe,
        fieldPrecision: field.fieldPrecision,
        emptyFlag: field.emptyFlag,
        emptyFlagChecked: field.emptyFlag == 1,
        keyFlag: field.keyFlag,
        tableId: field.tableId,
        defaultValue: field.defaultValue
      }))
    } else {
      window.$message.error(res.message)
    }
  })

}
const storeFormatOptionsInit = () => {
  get_table_store_format().then(res => {
    if (res.success) {
      storeFormatOptions.value = res.data.map((v) => ({
        label: v.label,
        value: v.label
      }))
    } else {
      window.$message.error(res.message)
    }
  })
}
const fieldTypeOptionsInit = () => {
  get_table_field_type('tbds-hive').then(res => {
    if (res.success) {
      fieldTypeOptions.value = res.data.map((v) => ({
        label: v.name,
        value: v.name,
        sizeFlag: v.sizeFlag,
        sizeMax: v.sizeMax,
        precisionFlag: v.precisionFlag
      }))
    } else {
      window.$message.error(res.message)
    }
  })
}

const createColumns = (): DataTableColumns<TableFieldType> => {
  const renderSorterIcon = (order: string | boolean) => {
    const style = ''
    if (order === false) return h(NIcon, {style}, h(ArrowSort24Regular))
    if (order === 'ascend') return h(NIcon, {style}, h(ArrowSortDown24Regular))
    if (order === 'descend') return h(NIcon, {style}, h(ArrowSortUp24Regular))
  }

  return [
    {
      title: '名称',
      key: 'fieldName',
      sorter: 'default',
      renderSorterIcon: ({order}) => renderSorterIcon(order),
      resizable: true,
      ellipsis: {tooltip: true},
      width: 150
    },
    {
      title: '注释',
      key: 'fieldDescribe',
      sorter: 'default',
      renderSorterIcon: ({order}) => renderSorterIcon(order),
      resizable: true,
      width: 150,
      ellipsis: {tooltip: true}
    },
    {
      title: '数据类型',
      key: 'fieldType',
      sorter: 'default',
      renderSorterIcon: ({order}) => renderSorterIcon(order),
      resizable: true,
      ellipsis: {tooltip: true},
      width: 150,
      render: (row) => {
        if (row.fieldSize == null) {
          return row.fieldType
        } else {
          return `${row.fieldType.split('(')[0]}(${row.fieldSize})`
        }
      }
    },
    {
      title: '是否为空',
      key: 'emptyFlag',
      sorter: 'default',
      renderSorterIcon: ({order}) => renderSorterIcon(order),
      resizable: true,
      ellipsis: {tooltip: true},
      width: 110,
      render: (row) => {
        if (row.emptyFlag == 0) {
          return '是'
        } else {
          return '否'
        }
      }
    }
  ]
}
const fieldColumnsRef = ref(createColumns())

const formRulesInit = () => {
  formRules.value = {
    tableName: {
      required: true,
      trigger: ['blur'],
      message: '输入表名'
    },
    fieldsList: fieldsListRulesInit()
  }
}

const fieldsListRulesInit = () => {
  const rules = {
    fieldName: {
      required: true,
      trigger: ['blur'],
      message: '输入字段名称'
    },
    fieldType: {
      required: true,
      trigger: ['change'],
      message: '选择数据类型'
    },
    fieldSize: {
      type: 'number',
      required: true,
      trigger: ['input'],
      message: '输入字段长度'
    },
    fieldPrecision: {
      type: 'number',
      required: true,
      trigger: ['input'],
      message: '输入字段精度'
    },
  }

  let fieldsListRules = []

  for (let i = 0; i < formModel.value.fieldsList.length; i++) {
    fieldsListRules.push(rules)
  }

  return fieldsListRules

}

const setFieldSizeFlag = (field: TableFieldType) => {
  return fieldTypeOptions.value.find(opt => opt.value == field.fieldType).sizeFlag != 0
}
const setFieldMaxSize = (field: TableFieldType) => {
  const sizeMax = fieldTypeOptions.value.find(opt => opt.value == field.fieldType).sizeMax
  if (sizeMax == null) {
    return 1
  } else {
    return sizeMax
  }
}
const setFieldPrecision = (field: TableFieldType) => {
  return fieldTypeOptions.value.find(opt => opt.value == field.fieldType).precisionFlag != 0
}

const handleEmptyFlagCheckedUpdate = (v: boolean) => {
  const index = formModel.value.fieldsList.findIndex(field => field.id == curKey.value.toString().split('-')[1])
  formModel.value.fieldsList[index].emptyFlag = v ? 1 : 0
}

// endregion

const isSaving = ref(false)
const handleSave = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      isSaving.value = true

      await get_table_info_by_id(props.tableId).then(res => {
        if (res.success) {
          const tableData = res.data
          Object.assign(tableData, formModel.value)
          delete tableData.ddlSql
          tableData.datamodelTableFieldsVoList = formModel.value.fieldsList
          delete tableData['fieldsList']

          update_table(JSON.stringify(tableData)).then(res => {
            if (res.success) {
              _show.value = false
              emit('onAfterLeave')
              window.$message.success(res.message)
            } else {
              window.$message.error(res.message)
            }
          }).finally(() => isSaving.value = false)
        } else {
          isSaving.value = false
          window.$message.error(res.message)
        }
      })

    } else {
      showFromAlert.value = true
    }
  })
}

</script>

<style scoped lang="less">
.container {
  display: flex;
  height: 100%;
}

.left-panel,
.right-panel {
  height: 100%;
  white-space: nowrap; /* 不换行 */
  overflow-x: auto; /* 横向滚动条 */
}


.left-panel {
  .header {
    height: 30px;
    border-top: 1px #eaeaea solid;
    border-left: 1px #eaeaea solid;
    border-right: 1px #eaeaea solid;
    padding: 1px;
  }

  .content {
    border: 1px #eaeaea solid;
    height: 430px // calc(100vh - 300px - 30px);
  }
}

.right-panel {
  .header {
    margin-top: 1px;
    height: 30px;
  }

  .content {
    border: 1px #eaeaea solid;
    height: 430px //  calc(100vh - 300px - 31px);
  }
}

.divider {
  width: 10px; /* 分割线的宽度 */
  cursor: col-resize; /* 鼠标样式为水平调整 */
  background-color: #ffffff;
}

:deep(  #fieldsTable .n-data-table-th) {
  user-select: none;
}
</style>
