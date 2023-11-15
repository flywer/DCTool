<template>
  <n-layout id="main-layout" class="animate__animated animate__slideInRight  animate__faster ">
    <n-layout-header>
      <n-page-header @back="back" :title="template?.templateName||''" class="select-none">
        <template #extra>
          <n-button type="info" secondary class="mr-2" @click="showInspVariablesDrawer = true">质检全局变量</n-button>
        </template>
      </n-page-header>
      <n-divider style="margin: 8px 0 8px 0"/>
    </n-layout-header>

    <n-layout has-sider style="height: calc(100vh - 145px);">
      <n-layout-sider
          :width="480"
          content-style="padding: 8px 8px 8px 8px;overflow:hidden"
      >
        <n-grid :cols="35">
          <n-gi :span="16">
            <sider-tree
                :tree-nodes="structTableTreeNodes"
                :search-input-place-holder="'搜索结构表'"
                :empty-description="'未选择任务模板'"

                :show-add-button="true"
                @onTreeNodeAdd="handleStructTableTreeNodeAdd"

                :show-remove-button="true"
                :remove-button-disable="typeof selectedStructTableId !== 'number'"
                @onTreeNodeRemove="handleStructTableTreeNodeRemove"

                v-model:selected-keys="structTableTreeSelectedKeys"
                @onSelectedKeysUpdate="handleStructTableTreeKeyUpdate"

                @reload-tree="structTableTreeNodesInit"

                :render-label="structTableTreeRenderLabel"
            />
          </n-gi>
          <n-gi :span="1">
            <arrow-divider/>
          </n-gi>
          <n-gi :span="18">
            <sider-tree
                :tree-nodes="tableFieldTreeNodes"
                :search-input-place-holder="'搜索表字段'"
                :empty-description="selectedStructTableId==null?'未选择结构表' : '结构表无字段'"
                :expand-on-click="false"

                :show-add-button="true"
                :add-button-disable="typeof selectedStructTableId !== 'number'"
                @onTreeNodeAdd="handleTableFieldTreeNodeAdd"

                :show-remove-button="true"
                :remove-button-disable="selectedTableFieldId === 'root' ||typeof selectedStructTableId !== 'number'  || tableFieldTreeNodes.length === 0"
                @onTreeNodeRemove="handleTableFieldTreeNodeRemove"

                v-model:selected-keys="tableFieldTreeSelectedKeys"
                @onSelectedKeysUpdate="handleTableFieldTreeKeyUpdate"

                @reload-tree="tableFieldTreeNodesInit"

                :render-label="tableFieldTreeRenderLabel"
            />
          </n-gi>
        </n-grid>
      </n-layout-sider>

      <n-layout-content content-style="padding:0 0 0 8px;border-left: 1px solid rgb(237 237 237)">
        <n-card :content-style="{padding:'8px',overflow:'hidden'}">
          <template v-if="selectedTableFieldId!='root'">
            <n-tabs
                v-if="selectedTableFieldId != null"
                type="segment"
                v-model:value="selectedRuleType"
                :animated="true"
                :size="'small'"
                @update:value="handleRuleTypeUpdate"
            >
              <n-tab-pane :name="1" tab="自定义">
                <n-scrollbar style="height: calc(100vh - 212px);" trigger="hover">
                  <n-form ref="customFormRef"
                          class="mt-4 pr-4"
                          :size="'small'"
                          :model="customFormModel"
                          :rules="customFormRules"
                  >
                    <n-grid :cols="12" :x-gap="12">
                      <n-form-item-gi :span="12" label="质检字段名称" path="fieldName">
                        <n-input ref="fieldNameInputRef" v-model:value="customFormModel.fieldName" clearable/>
                      </n-form-item-gi>
                      <n-form-item-gi :span="12" label="质检字段注释">
                        <n-input v-model:value="customFormModel.fieldComment" placeholder="" :maxlength="128"
                                 clearable
                        />
                      </n-form-item-gi>
                      <n-form-item-gi :span="12" label="质检规则" path="inspRuleId">
                        <n-cascader
                            v-model:value="customFormModel.inspRuleId"
                            placeholder="选择质检规则"
                            :expand-trigger="'click'"
                            :options="inspRuleOptions"
                            :check-strategy="'child'"
                            :show-path="true"
                            :filterable="true"
                            :multiple="false"
                            @update:value="handleInspRuleUpdate"
                        />
                      </n-form-item-gi>

                      <n-gi :span="12" v-if="customFormModel.inspRuleId">
                        <n-card :content-style="{padding:'8px'}">

                          <n-alert type="default" :show-icon="false" class="mb-4">
                            {{ zjRulesList.find(rule => rule.id == customFormModel.inspRuleId)?.templateDescription }}
                          </n-alert>

                          <!--及时性质检-->
                          <template v-if="customFormModel.inspRuleId === '1'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="6" label="比较方式" path="ruleOperator">
                                <n-select
                                    v-model:value="customFormModel.ruleOperator"
                                    placeholder="选择运算符"
                                    :options="ruleOperatorOptions"
                                    :consistent-menu-width="false"
                                    filterable
                                />
                              </n-form-item-gi>
                              <n-form-item-gi :span="6" label="比较时间" path="ruleOperatorRightValue">
                                <n-select
                                    v-model:value="customFormModel.ruleOperatorRightValue"
                                    placeholder="选择时间"
                                    :options="ruleOperatorRightValueOptions"
                                    :consistent-menu-width="false"
                                    filterable
                                />
                              </n-form-item-gi>
                            </n-grid>
                          </template>

                          <!--主外键一致性质检-->
                          <template v-else-if="customFormModel.inspRuleId === '2'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="12" label="从表数据源" path="fromTableDataSourceId">
                                <n-select
                                    v-model:value="customFormModel.fromTableDataSourceId"
                                    :options="datasourceOptions"
                                    :size="'small'"
                                />
                              </n-form-item-gi>
                              <n-form-item-gi :span="6" label="从表数据表" path="fromTableDataTable">
                                <n-input v-model:value="customFormModel.fromTableDataTable"/>
                              </n-form-item-gi>

                              <n-form-item-gi :span="6" label="从表字段" path="fromTableField">
                                <n-input v-model:value="customFormModel.fromTableField"/>
                              </n-form-item-gi>
                            </n-grid>
                          </template>

                          <!--主外键一致性质检-->
                          <template v-else-if="customFormModel.inspRuleId === '3'"/>

                          <!--唯一值质检-->
                          <template v-else-if="customFormModel.inspRuleId === '4'"/>

                          <!--值域校验-->
                          <template v-else-if="customFormModel.inspRuleId === '5'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="12" label="标准规范" path="standardSpecificationId">
                                <n-select
                                    v-model:value="customFormModel.standardSpecificationId"
                                    placeholder="选择标准规范"
                                    :options="normOptions"
                                    :consistent-menu-width="false"
                                    filterable
                                    @update:value="normCodeSetOptionsInit"
                                />
                              </n-form-item-gi>
                              <n-form-item-gi :span="12" label="标准代码集" path="standardCodeSetId">
                                <n-select
                                    v-model:value="customFormModel.standardCodeSetId"
                                    placeholder="选择标准代码集"
                                    :options="normCodeSetOptions"
                                    :consistent-menu-width="false"
                                    filterable
                                />
                              </n-form-item-gi>
                            </n-grid>
                          </template>

                          <!--重复值质检-->
                          <template v-else-if="customFormModel.inspRuleId === '6'"/>

                          <!--身份证校验-->
                          <template v-else-if="customFormModel.inspRuleId === '7'"/>

                          <!--手机号校验-->
                          <template v-else-if="customFormModel.inspRuleId === '8'"/>

                          <!--邮箱校验-->
                          <template v-else-if="customFormModel.inspRuleId === '9'"/>

                          <!--标准数据元校验-->
                          <template v-else-if="customFormModel.inspRuleId === '10'">
                            <n-alert type="default" :show-icon="false" class="mb-4">
                              暂不支持
                            </n-alert>
                          </template>

                          <!--前缀/后缀质检-->
                          <template v-else-if="customFormModel.inspRuleId === '11'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="12" label="前缀可为" path="prefix">
                                <n-dynamic-tags v-model:value="customFormModel.prefix"/>
                              </n-form-item-gi>
                              <n-form-item-gi :span="12" label="后缀可为" path="suffix">
                                <n-dynamic-tags v-model:value="customFormModel.suffix"/>
                              </n-form-item-gi>
                            </n-grid>
                          </template>

                          <!--前缀/后缀（非）质检-->
                          <template v-else-if="customFormModel.inspRuleId === '12'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="12" label="前缀不可为" path="prefix">
                                <n-dynamic-tags v-model:value="customFormModel.prefix"/>
                              </n-form-item-gi>
                              <n-form-item-gi :span="12" label="后缀不可为" path="suffix">
                                <n-dynamic-tags v-model:value="customFormModel.suffix"/>
                              </n-form-item-gi>
                            </n-grid>
                          </template>

                          <!--最大/最小长度质检-->
                          <template v-else-if="customFormModel.inspRuleId === '13'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="12" label="大于等于" path="minSize">
                                <n-input
                                    v-model:value="customFormModel.minSize"
                                    placeholder="请输入最小值"
                                    :allow-input="(value: string) => !value || /^\d+$/.test(value)"
                                >
                                  <template #prefix>
                                    <n-icon>
                                      <GreaterThanEqualRound/>
                                    </n-icon>
                                  </template>
                                </n-input>
                              </n-form-item-gi>
                              <n-form-item-gi :span="12" label="小于等于" path="maxSize">
                                <n-input
                                    v-model:value="customFormModel.maxSize"
                                    placeholder="请输入最大值"
                                    :allow-input="(value: string) => !value || /^\d+$/.test(value)"
                                >
                                  <template #prefix>
                                    <n-icon>
                                      <LessThanEqualRound/>
                                    </n-icon>
                                  </template>
                                </n-input>
                              </n-form-item-gi>
                            </n-grid>
                          </template>

                          <!--数字字段质检-->
                          <template v-else-if="customFormModel.inspRuleId === '14'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="12" label="数值类型" path="numType">
                                <n-select
                                    v-model:value="customFormModel.numType"
                                    placeholder="选择数值类型"
                                    :options="[{label:'全为数值',value:'1'},{label:'全不为数值',value:'2'}]"
                                    :consistent-menu-width="false"
                                    filterable
                                />
                              </n-form-item-gi>
                            </n-grid>
                          </template>

                          <!--枚举质检-->
                          <template v-else-if="customFormModel.inspRuleId === '15'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="12" label="枚举值" path="enumsValue">
                                <n-dynamic-tags v-model:value="customFormModel.enumsValue"/>
                              </n-form-item-gi>
                            </n-grid>
                          </template>

                          <!--正则质检-->
                          <template v-else-if="customFormModel.inspRuleId === '16'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="12" label="正则表达式" path="regularValue">
                                <n-input type="textarea" v-model:value="customFormModel.regularValue"
                                         placeholder="请输入正则表达式"
                                />
                              </n-form-item-gi>
                            </n-grid>
                          </template>

                          <!--自定义质检-->
                          <template v-else-if="customFormModel.inspRuleId === '17'">
                            <n-grid :cols="12" :x-gap="12">
                              <n-form-item-gi :span="12" label="质检表主键" path="customSqlKey">
                                <n-auto-complete
                                    v-model:value="customFormModel.customSqlKey"
                                    :options="[{label: 'id',value: 'id'}]"
                                    placeholder="质检表主键"
                                    clearable
                                />
                              </n-form-item-gi>
                              <n-form-item-gi :span="12" label="质检SQL" path="customSql" id="customSqlFormItem">
                                <n-grid :cols="12" :x-gap="12" class="mb-2">
                                  <n-gi :span="10">
                                    <n-input :value="customSqlPrefix" readonly/>
                                  </n-gi>
                                  <n-gi :span="2">
                                    <n-space justify="end">
                                      <n-button @click="customSqlFormat" v-if="false">格式化</n-button>
                                      <n-button type="info" @click="customSqlValid" :loading="customSqlValidLoading">
                                        测试
                                      </n-button>
                                    </n-space>
                                  </n-gi>
                                </n-grid>

                                <n-input type="textarea" v-model:value="customFormModel.customSql"
                                         placeholder="请输入WHERE子句"
                                         spellcheck="false"
                                         :show-count="true"

                                />
                              </n-form-item-gi>
                              <n-form-item-gi :span="12" label="质检规则描述" path="customDescribe">
                                <n-input type="textarea" v-model:value="customFormModel.customDescribe"
                                         placeholder="质检规则描述"
                                         maxlength="200"
                                         show-count
                                         clearable
                                         :autosize="{minRows: 2,maxRows: 5}"
                                />
                              </n-form-item-gi>
                            </n-grid>

                          </template>

                          <template v-else>
                            <n-empty class="mt-2" description="未知质检规则"></n-empty>
                          </template>

                        </n-card>
                      </n-gi>
                    </n-grid>
                  </n-form>
                  <n-space justify="center" class="mt-2 pr-4">
                    <n-button type="primary" class="w-36" @click="handleFieldInspRuleSave"
                              :loading="fieldInspRuleSaving"
                    >
                      保存
                    </n-button>
                  </n-space>
                </n-scrollbar>
              </n-tab-pane>
              <n-tab-pane :name="2" tab="引用">
                <n-scrollbar style="height: calc(100vh - 212px);" trigger="hover">
                  <n-form ref="referenceFormRef"
                          class="mt-4 pr-4"
                          :size="'small'"
                          :model="referenceFormModel"
                          :rules="referenceFormRules"
                  >
                    <n-grid :cols="12" :x-gap="12">
                      <n-form-item-gi :span="12" label="质检字段名称" path="fieldName">
                        <n-input ref="fieldNameInputRef" v-model:value="referenceFormModel.fieldName" clearable/>
                      </n-form-item-gi>
                      <n-form-item-gi :span="12" label="质检字段注释">
                        <n-input v-model:value="referenceFormModel.fieldComment" placeholder="" :maxlength="128"
                                 clearable
                        />
                      </n-form-item-gi>
                      <n-form-item-gi :span="12" label="质检模板" path="jobTemplateId">
                        <n-select
                            v-model:value="referenceFormModel.jobTemplateId"
                            placeholder="选择质检模板"
                            :options="jobTemplateOptions"
                            :consistent-menu-width="false"
                            filterable
                            @update:value="handleReferenceFormTemplateIdUpdate"
                        />
                      </n-form-item-gi>
                      <n-form-item-gi :span="12" label="结构表名" path="structTableId">
                        <n-select
                            v-model:value="referenceFormModel.structTableId"
                            placeholder="选择结构表"
                            :options="structTableOptions"
                            :consistent-menu-width="false"
                            filterable
                            @update:value="handleReferenceFormStructTableIdUpdate"
                        />
                      </n-form-item-gi>
                      <n-form-item-gi :span="12" label="引用规则" path="referenceRuleId">
                        <n-select
                            v-model:value="referenceFormModel.referenceRuleId"
                            placeholder="选择规则"
                            :options="ruleIdOptions"
                            :consistent-menu-width="false"
                            filterable
                            @update:value="handleReferenceFormRuleIdUpdate"
                        />
                      </n-form-item-gi>
                    </n-grid>
                  </n-form>
                  <n-space justify="center" class="mt-2 pr-4">
                    <n-button type="primary" class="w-36" @click="handleFieldInspRuleSave"
                              :loading="fieldInspRuleSaving"
                    >
                      保存
                    </n-button>
                  </n-space>
                </n-scrollbar>

              </n-tab-pane>
            </n-tabs>
            <n-empty v-else class="mt-2" description="未选择字段"/>
          </template>
          <template v-else>
            <n-scrollbar style="height: calc(100vh - 170px);" trigger="hover">
              <struct-table-info :struct-table-id="selectedStructTableId"/>
            </n-scrollbar>
          </template>
        </n-card>

      </n-layout-content>
    </n-layout>

  </n-layout>

  <n-drawer
      v-model:show="showInspVariablesDrawer"
      :width="260"
      :block-scroll="false"
      to="#main-layout"
  >
    <n-drawer-content
        title="质检全局变量"
        :native-scrollbar="false"
        :header-style="{fontSize:'16px'}"
        :body-content-style="{fontSize:'12px',padding:'4px'}"
    >
      <n-list hoverable :show-divider="true">
        <n-list-item>
          <n-thing content-style="margin: 0;padding:0">
            <n-space justify="space-between">
              <n-tag :bordered="false" type="info" size="small">
                {PROJECT}
              </n-tag>
              <n-button text type="info" :size="'small'" @click="nativeCopyText('{PROJECT}')">复制</n-button>
            </n-space>
            <template #footer>
              若质检规则中使用此变量，在生成任务时，会将此值转换为对应<b>表名内部门缩写</b>
              <div>例如：di_<b>ssft</b>_c1010_dwd</div>
            </template>
          </n-thing>
        </n-list-item>
        <n-list-item>
          <n-thing content-style="margin: 0;padding:0">
            <n-space justify="space-between">
              <n-tag :bordered="false" type="info" size="small">
                {TABLE_NAME}
              </n-tag>
              <n-button text type="info" :size="'small'" @click="nativeCopyText('{TABLE_NAME}')">复制</n-button>
            </n-space>
            <template #footer>
              若质检规则中使用此变量，在生成任务时，会将此值转换为对应<b>表名内结构表缩写</b>
              <div>例如：di_ssft_<b>c1010</b>_dwd</div>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
    </n-drawer-content>
  </n-drawer>

  <n-modal
      v-model:show="showAddStructTableModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="'添加质检字段'"
      :size="'small'"
  >
    <n-form
        class="mt-4"
        ref="addStructTableModalFormRef"
        :model="addStructTableFormModel"
        :rules="addStructTableModalFormRules"
        :size="'small'"
    >
      <n-grid :cols="2" :x-gap="4">
        <n-form-item-gi :span="2" label="结构表名" path="tableName">
          <n-select
              v-model:value="addStructTableFormModel.tableName"
              placeholder="选择结构表名"
              :options="addStructTableOptions"
              filterable
              :consistent-menu-width="false"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #action>
      <n-button type="primary" :size="'small'" @click="handleAddFieldModalFormSave"
                :loading="isAddFieldModalFormSaving"
      >保存
      </n-button>
      <n-button :size="'small'" @click="showAddStructTableModalRef = !showAddStructTableModalRef">返回</n-button>
    </template>
  </n-modal>

</template>

<script setup lang="ts">
import {FieldInspectionRule} from "@main/entity/jobTemplate/FieldInspectionRule";
import {JobTemplate} from "@main/entity/jobTemplate/JobTemplate";
import {StructTableFieldType, TemplateStructTable} from "@main/entity/jobTemplate/TemplateStructTable";
import {
  field_insp_rule_delete,
  field_insp_rule_save,
  find_field_insp_rule
} from "@render/api/auxiliaryDb/fieldInspectionRule.api";
import {find_job_template} from "@render/api/auxiliaryDb/jobTemplate.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {
  find_template_struct_table,
  struct_table_delete,
  struct_table_save
} from "@render/api/auxiliaryDb/templateStructTable.api";
import {get_norm, get_norm_code_set, sql_valid} from "@render/api/datacenter.api";
import {datasourceOptions} from "@render/typings/datacenterOptions";
import {nativeCopyText} from "@render/utils/common/clipboard";
import {actionTableNames, basicTableNames} from "@render/utils/datacenter/constants";
import {zjRulesList} from "@render/utils/datacenter/zjRulesList";
import ArrowDivider from "@render/views/jobTemplate/zj/compnents/arrowDivider.vue";
import SiderTree from "@render/views/jobTemplate/zj/compnents/siderTree.vue";
import StructTableInfo from "@render/views/jobTemplate/zj/compnents/structTableInfo.vue";
import {cloneDeep, isEmpty} from "lodash-es";
import {
  FormInst,
  TreeOption,
  CascaderOption,
  SelectOption,
  NIcon,
  NButton,
  FormItemRule,
  useThemeVars,
} from "naive-ui";
import {format} from "sql-formatter";
import {onMounted, ref, h} from "vue";
import {GreaterThanEqualRound, LessThanEqualRound} from '@vicons/material'
import {uuid} from "vue3-uuid";
import {CircleSmall24Filled} from '@vicons/fluent'

type RuleListType = {
  dimension: string
  inspectionRuleId: string
  impactLevel: string

  // 及时性质检
  ruleOperatorRightValue?: string,
  ruleOperator?: string

  // 主外键一致性质检
  fromTableDataSourceId?: string
  fromTableDataTable?: string
  fromTableField?: string

  // 值域校验
  standardSpecificationId?: string
  standardCodeSetId?: string

  // 前缀/后缀质检
  prefix?: any[]
  suffix?: any[]

  // 最大/最小长度质检
  maxSize?: string
  minSize?: string

  // 数字字段质检
  numType?: '1' | '2'

  // 枚举质检
  enumsValue?: string[]

  // 正则质检
  regularValue?: string

  // 自定义质检
  customSqlKey?: string
  customSql?: string
  customDescribe?: string
}

class CustomFormModel {
  fieldName: string
  fieldComment: string
  // 规则类型
  // ruleType: number
  // 质检规则ID
  inspRuleId: string

  ruleOperator: string
  ruleOperatorRightValue: string

  fromTableDataSourceId: string
  fromTableDataTable: string
  fromTableField: string

  standardSpecificationId: string
  standardCodeSetId: string

  prefix: string[]
  suffix: string[]

  maxSize: string
  minSize: string

  numType: '1' | '2'

  enumsValue: string[]

  regularValue: string

  customSqlKey: string
  customSql: string
  customDescribe: string
}

const props = defineProps({
  templateId: {
    default: null,
    required: true
  }
})

const emit = defineEmits(['back'])

const back = () => {
  emit('back')
}

const template = ref<JobTemplate>(null)

onMounted(async () => {
  template.value = (await find_job_template({
    id: props.templateId
  }, {templateNameLike: false}))[0]

  await tableCommentsInit()

  tableFieldCommentMapInit()

  inspRuleOptionsInit()

  await structTableTreeNodesInit()
})

// region 左侧结构表树
const structTableTreeNodes = ref<TreeOption[]>([])
const selectedStructTableId = ref(null)
const structTableTreeSelectedKeys = ref<(string | number)[]>(['root'])
const tableFieldCommentMap = new Map<StructTableFieldType, string>()
const tableComments = new Map<string, string>()

// 结构表tree初始化
const structTableTreeNodesInit = async () => {
  structTableTreeNodes.value = [
    {
      label: `${template.value.templateName}`,
      key: 'root',
      isLeaf: false,
      children: []
    }
  ]

  const tables = await find_template_struct_table({
    templateId: props.templateId
  })

  const groupedArrays = tables
      .sort((a, b) => {
        return a.tableName.localeCompare(b.tableName)
      })
      .reduce((groups, item) => {
        const {fieldType} = item;
        const comment = tableFieldCommentMap.get(fieldType)
        if (!groups[comment]) {
          groups[comment] = [item];
        } else {
          groups[comment].push(item);
        }
        return groups;
      }, {});

  structTableTreeNodes.value[0].children = Object.keys(groupedArrays).map(key => ({
    label: key,
    key: key,
    isLeaf: false,
    children: groupedArrays[key].map((item: TemplateStructTable) => ({
      label: item.tableName,
      key: item.id,
      isLeaf: true
    }))
  }))

}

// 表领域注解初始化
const tableFieldCommentMapInit = () => {
  tableFieldCommentMap.set(StructTableFieldType.LAR, '法律法规')
  tableFieldCommentMap.set(StructTableFieldType.LASD, '执法和监督部门')
  tableFieldCommentMap.set(StructTableFieldType.LASS, '执法和监督人员')
  tableFieldCommentMap.set(StructTableFieldType.IAR, '互联网+监管')
  tableFieldCommentMap.set(StructTableFieldType.GEA, '行政职权类事项')
  tableFieldCommentMap.set(StructTableFieldType.DRPO, '"双随机、一公开"事项')
  tableFieldCommentMap.set(StructTableFieldType.TLO, '执法对象')

  tableFieldCommentMap.set(StructTableFieldType.AL, '行政许可')
  tableFieldCommentMap.set(StructTableFieldType.AP, '行政处罚')
  tableFieldCommentMap.set(StructTableFieldType.AE, '行政征收')
  tableFieldCommentMap.set(StructTableFieldType.AR, '行政征用')
  tableFieldCommentMap.set(StructTableFieldType.AF, '行政强制')
  tableFieldCommentMap.set(StructTableFieldType.AC, '行政检查')
  tableFieldCommentMap.set(StructTableFieldType.RI, '救济信息')

  tableFieldCommentMap.set(StructTableFieldType.RC, '监督投诉')

  tableFieldCommentMap.set(StructTableFieldType.DRA, '数据对账')
}

const getFieldTypeByTableName = (tableName: string): StructTableFieldType => {
  tableName = tableName.toUpperCase()

  if (tableName.startsWith('G')) {
    return StructTableFieldType.LAR
  } else if (tableName.startsWith('Z')) {
    return StructTableFieldType.LASD
  } else if (tableName.startsWith('Y')) {
    return StructTableFieldType.LASS
  } else if (tableName.startsWith('F2')) {
    return StructTableFieldType.IAR
  } else if (tableName.startsWith('F1')) {
    return StructTableFieldType.GEA
  } else if (tableName.startsWith('F3')) {
    return StructTableFieldType.DRPO
  } else if (tableName.startsWith('D')) {
    return StructTableFieldType.TLO
  } else if (tableName.startsWith('C1')) {
    return StructTableFieldType.AL
  } else if (tableName.startsWith('C2')) {
    return StructTableFieldType.AP
  } else if (tableName.startsWith('C3')) {
    return StructTableFieldType.AF
  } else if (tableName.startsWith('C40')) {
    return StructTableFieldType.AE
  } else if (tableName.startsWith('C41')) {
    return StructTableFieldType.AR
  } else if (tableName.startsWith('C6')) {
    return StructTableFieldType.AC
  } else if (tableName.startsWith('C7')) {
    return StructTableFieldType.RI
  } else if (tableName.startsWith('T')) {
    return StructTableFieldType.RC
  }

}

const handleStructTableTreeKeyUpdate = async (keys: (string | number)[]) => {
  const res = new Promise<boolean>((resolve) => {
    if (compareCustomFormModels(customFormModelBackup.value, customFormModel.value)) {
      resolve(true)
    } else {
      window.$dialog.warning({
        // title: '警告',
        content: `质检规则已修改未保存，是否放弃修改？`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          resolve(true);
        },
        onNegativeClick: () => {
          resolve(false);
        }
      })
    }
  })

  if (await res) {
    if (typeof keys[0] === 'number') {
      structTableTreeSelectedKeys.value = keys
      selectedStructTableId.value = keys[0]

      tableFieldTreeSelectedKeys.value = ['root']
      selectedTableFieldId.value = 'root'

      await tableFieldTreeNodesInit()
    }
  }
}

const handleStructTableTreeNodeAdd = () => {
  addStructTableModalInit()
}

const handleStructTableTreeNodeRemove = () => {
  window.$dialog.warning({
    title: '删除结构表',
    showIcon: false,
    content: `是否删除此结构表及其下质检字段？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      struct_table_delete(selectedStructTableId.value).then(res => {
        if (res.success) {
          window.$message.success('删除成功')
          structTableTreeSelectedKeys.value = ['root']
          selectedStructTableId.value = undefined
          structTableTreeNodesInit().then(() => {
            selectedTableFieldId.value = null
            tableFieldTreeNodes.value = []
          })
        } else {
          window.$message.error(res.message)
        }
      })
    }
  })
}

const tableCommentsInit = async () => {
  const tableData = await get_table_sql()

  tableData.forEach(data => {
    tableComments.set(data.tableName, data.comment)
  })
}

const structTableTreeRenderLabel = (info: {
  option: TreeOption,
  checked: boolean,
  selected: boolean
}) => {
  if (info.option.isLeaf && info.option.label.startsWith('C')) {
    return h('div', {}, [
      h('span', {class: 'pr-2'}, info.option.label),
      h('span', {
            style: {
              color: useThemeVars().value.textColor3,
              fontSize: '12px',
              float: 'right',
              lineHeight: '22px'
            }
          }, tableComments.get(info.option.label).slice(4)
      )
    ])
  } else {
    return info.option.label
  }
}

// endregion

// region 表字段树
const tableFieldTreeNodes = ref<TreeOption[]>([])
const tableFieldTreeSelectedKeys = ref<(string | number)[]>(['root'])
const selectedTableFieldId = ref(null)

const tableFieldTreeNodesInit = async () => {
  const inspRules = await find_field_insp_rule({tableId: selectedStructTableId.value})
  const structTableName = (await find_template_struct_table({id: selectedStructTableId.value}))[0].tableName

  tableFieldTreeNodes.value = [
    {
      label: structTableName,
      key: 'root',
      isLeaf: false,
      children: []
    }
  ]

  tableFieldTreeNodes.value[0].children = inspRules.map(v => ({
    label: v.fieldName,
    key: v.id,
    isLeaf: true,
    ruleType: v.ruleType,
    inspectionRuleId: v.ruleType == 1 ? JSON.parse(v.ruleList)[0].inspectionRuleId : null,
  }))

  if (tableFieldTreeNodes.value.length > 0) {
    if (selectedTableFieldId.value == null || typeof selectedTableFieldId.value != 'number') {
      tableFieldTreeSelectedKeys.value = [tableFieldTreeNodes.value[0].key]
      selectedTableFieldId.value = tableFieldTreeNodes.value[0].key
    }
    fieldInspectionRuleInit()
  } else {
    selectedTableFieldId.value = undefined
  }
}

const tableFieldTreeRenderLabel = (info: {
  option: TreeOption,
  checked: boolean,
  selected: boolean
}) => {
  if (info.option.key === 'root') {
    return h('div', {}, [
      h('span', {class: 'pr-2'}, info.option.label),
      h('span', {
        style: {
          color: useThemeVars().value.textColor3,
          fontSize: '12px',
          float: 'right',
          lineHeight: '22px'
        }
      }, tableFieldTreeNodes.value[0].children.length)
    ])
  } else {
    return h('div', {}, [
      h('span', {class: 'pr-2'}, info.option.label),
      h('span', {
            style: {
              color: useThemeVars().value.textColor3,
              fontSize: '12px',
              float: 'right',
              lineHeight: '22px'
            }
          }, info.option.ruleType == 1 ?
              zjRulesList.find(rule => rule.id === info.option.inspectionRuleId)?.ruleName || '' :
              '引用规则'
      )
    ])
  }

}

const handleTableFieldTreeKeyUpdate = async (keys: (string | number)[]) => {
  const res = new Promise<boolean>((resolve) => {
    if (compareCustomFormModels(customFormModelBackup.value, customFormModel.value)) {
      resolve(true)
    } else {
      window.$dialog.warning({
        // title: '警告',
        content: `质检规则已修改未保存，是否放弃修改？`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          resolve(true);
        },
        onNegativeClick: () => {
          resolve(false);
        }
      })
    }
  })

  if (await res) {
    tableFieldTreeSelectedKeys.value = keys
    selectedTableFieldId.value = keys[0]
    if (keys[0] != 'root') {
      // 跳转到其他字段
      fieldInspectionRuleInit()
    } else {
      // 跳转到root

    }

  }

}

const compareCustomFormModels = (obj1: CustomFormModel, obj2: CustomFormModel): boolean => {
  // 遍历对象的属性，并逐个比较它们的值
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
      if (key === 'enumsValue' || key === 'prefix' || key === 'suffix') {
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          return false;
        }
      } else if (obj1[key] !== obj2[key]) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

const handleTableFieldTreeNodeAdd = () => {
  const key = `temp-${uuid.v4()}`

  tableFieldTreeNodes.value[0].children.push({
    label: `Field_${tableFieldTreeNodes.value[0].children.length + 1}`,
    key: key,
    isLeaf: true,
    ruleType: 1,
    suffix: () => h(NIcon, {color: '#23bf19'}, h(CircleSmall24Filled))
  })

  tableFieldTreeSelectedKeys.value = [key]
  selectedTableFieldId.value = key

  fieldInspectionRuleInit()

  fieldNameInputRef.value?.select()
}

const handleTableFieldTreeNodeRemove = () => {
  if (typeof selectedTableFieldId.value === "number") {
    window.$dialog.warning({
      title: '删除字段',
      showIcon: false,
      content: `是否删除[${fieldInspectionRule.value.fieldName}]字段？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        field_insp_rule_delete(selectedTableFieldId.value).then(res => {
          if (res.success) {
            window.$message.success('删除成功')
            selectedTableFieldId.value = null
            tableFieldTreeNodesInit()
          } else {
            window.$message.error(res.message)
          }
        })
      }
    })
  } else {
    tableFieldTreeNodes.value = tableFieldTreeNodes.value.filter(node => node.key != selectedTableFieldId.value)
  }
  tableFieldTreeNodesInit()
}

// endregion

// region 自定义表单
const fieldInspectionRule = ref<FieldInspectionRule>(new FieldInspectionRule())
const selectedRuleType = ref(1)
const customFormModelBackup = ref(null)

const fieldNameInputRef = ref(null)

const fieldInspectionRuleInit = () => {
  if (typeof selectedTableFieldId.value === 'number' || !selectedTableFieldId.value.startsWith('temp-')) {
    find_field_insp_rule({id: parseInt(selectedTableFieldId.value)}).then(async res => {
      if (res.length > 0) {
        fieldInspectionRule.value = res[0]
        selectedRuleType.value = fieldInspectionRule.value.ruleType

        if (selectedRuleType.value == 1) {
          await customFormInit(fieldInspectionRule.value)
        } else {
          await referenceFormInit(fieldInspectionRule.value)
        }
      } else {
        fieldInspectionRule.value = new FieldInspectionRule()
      }
    })
  } else {
    fieldInspectionRule.value = new FieldInspectionRule()
    customFormModel.value = new CustomFormModel()

    customFormModel.value.fieldName = tableFieldTreeNodes.value[0].children.find(opt => opt.key == selectedTableFieldId.value).label
    customFormModel.value.fieldComment = null
    customFormModel.value.inspRuleId = null

    customFormModelBackup.value = cloneDeep(customFormModel.value)

    referenceFormModel.value.fieldName = tableFieldTreeNodes.value[0].children.find(opt => opt.key == selectedTableFieldId.value).label
    referenceFormModel.value.fieldComment = null

    referenceFormModel.value.jobTemplateId = null
    referenceFormModel.value.structTableId = null
    referenceFormModel.value.referenceRuleId = null

    jobTemplateOptionsInit()
  }
}

const customFormInit = async (fieldInspectionRule: FieldInspectionRule) => {
  customFormModel.value = new CustomFormModel()

  customFormModel.value.fieldName = fieldInspectionRule.fieldName
  customFormModel.value.fieldComment = fieldInspectionRule.fieldComment

  if (fieldInspectionRule.ruleList != null) {
    const ruleList: RuleListType = JSON.parse(fieldInspectionRule.ruleList)[0]
    customFormModel.value.inspRuleId = ruleList.inspectionRuleId

    switch (customFormModel.value.inspRuleId) {
      case '1':
        customFormModel.value.ruleOperator = ruleList.ruleOperator
        customFormModel.value.ruleOperatorRightValue = ruleList.ruleOperatorRightValue
        break
      case '2':
        customFormModel.value.fromTableDataSourceId = ruleList.fromTableDataSourceId
        customFormModel.value.fromTableDataTable = ruleList.fromTableDataTable
        customFormModel.value.fromTableField = ruleList.fromTableField
        break
      case '5':
        normOptionsInit()
        customFormModel.value.standardSpecificationId = ruleList.standardSpecificationId
        if (customFormModel.value.standardSpecificationId) {
          normCodeSetOptionsInit(customFormModel.value.standardSpecificationId)
        }
        customFormModel.value.standardCodeSetId = ruleList.standardCodeSetId
        break
      case '11':
        customFormModel.value.prefix = ruleList.prefix
        customFormModel.value.suffix = ruleList.suffix
        break
      case '12':
        customFormModel.value.prefix = ruleList.prefix
        customFormModel.value.suffix = ruleList.suffix
        break
      case '13':
        customFormModel.value.minSize = ruleList.minSize
        customFormModel.value.maxSize = ruleList.maxSize
        break
      case '14':
        customFormModel.value.numType = ruleList.numType
        break
      case '15':
        customFormModel.value.enumsValue = ruleList.enumsValue
        break
      case '16':
        customFormModel.value.regularValue = ruleList.regularValue
        break
      case '17':
        customFormModel.value.customSqlKey = ruleList.customSqlKey || 'id'
        customFormModel.value.customSql = ruleList.customSql
        customFormModel.value.customDescribe = ruleList.customDescribe
        const structTableName = (await find_template_struct_table({id: selectedStructTableId.value}))[0].tableName
        customSqlPrefix.value = `SELECT a.* FROM di_{PROJECT}_${structTableName.toLowerCase()}_temp_ods a`
        break
    }

  }
  customFormModelBackup.value = cloneDeep(customFormModel.value)
}

const referenceFormInit = async (fieldInspectionRule: FieldInspectionRule) => {
  await jobTemplateOptionsInit()

  referenceFormModel.value.fieldName = fieldInspectionRule.fieldName
  referenceFormModel.value.fieldComment = fieldInspectionRule.fieldComment
  referenceFormModel.value.ruleType = fieldInspectionRule.ruleType
  if (fieldInspectionRule.referenceRuleId) {
    referenceFormModel.value.referenceRuleId = fieldInspectionRule.referenceRuleId.toString()

    const inspRule = (await find_field_insp_rule({id: parseInt(referenceFormModel.value.referenceRuleId)}))[0]
    const structTable = (await find_template_struct_table({id: inspRule.tableId}))[0]

    referenceFormModel.value.structTableId = inspRule.tableId.toString()
    referenceFormModel.value.jobTemplateId = structTable.templateId.toString()

    await structTableOptionsInit(structTable.templateId)
    await ruleIdOptionsInit(inspRule.tableId)
  }

}

const handleRuleTypeUpdate = (v: number) => {
  if (typeof selectedTableFieldId.value === 'number' || !selectedTableFieldId.value.startsWith('temp-')) {
    find_field_insp_rule({id: parseInt(selectedTableFieldId.value)}).then(async res => {
      if (res.length > 0) {
        fieldInspectionRule.value = res[0]
        if (v == 1) {
          await customFormInit(fieldInspectionRule.value)
        } else {
          await referenceFormInit(fieldInspectionRule.value)
        }
      } else {
        fieldInspectionRule.value = new FieldInspectionRule()
      }
    })
  } else {
    fieldInspectionRule.value = new FieldInspectionRule()
    customFormModel.value = new CustomFormModel()

    customFormModel.value.fieldName = tableFieldTreeNodes.value[0].children.find(opt => opt.key == selectedTableFieldId.value).label
    customFormModel.value.fieldComment = null
    customFormModel.value.inspRuleId = null

    customFormModelBackup.value = cloneDeep(customFormModel.value)

    referenceFormModel.value.fieldName = tableFieldTreeNodes.value[0].children.find(opt => opt.key == selectedTableFieldId.value).label
    referenceFormModel.value.fieldComment = null
    referenceFormModel.value.ruleType = 2
    referenceFormModel.value.referenceRuleId = null

    jobTemplateOptionsInit()
  }
}

const customFormRef = ref<FormInst | null>(null);
const customFormModel = ref<CustomFormModel>({
  fieldName: null,
  fieldComment: null,
  inspRuleId: null,

  ruleOperator: null,
  ruleOperatorRightValue: null,

  fromTableDataSourceId: null,
  fromTableDataTable: null,
  fromTableField: null,

  standardSpecificationId: null,
  standardCodeSetId: null,

  prefix: null,
  suffix: null,

  maxSize: null,
  minSize: null,

  numType: null,

  enumsValue: null,

  regularValue: null,

  customSqlKey: null,
  customSql: null,
  customDescribe: null,
})
const customFormRules = ref({
  fieldName: {
    required: true,
    trigger: ['input'],
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error('请输入字段名')
      } else if (tableFieldTreeNodes.value.some(node => node.label.toUpperCase() === value.toUpperCase() && node.key != selectedTableFieldId.value)) {
        return new Error('字段名已存在')
      }
    }
  },
  inspRuleId: {
    required: true,
    trigger: ['input', 'change'],
    message: '请选择质检规则'
  },
  ruleOperator: {
    required: true,
    trigger: ['change'],
    message: '请选择运算符'
  },
  ruleOperatorRightValue: {
    required: true,
    trigger: ['change'],
    message: '请选择比较时间'
  },
  fromTableDataSourceId: {
    required: true,
    trigger: ['change'],
    message: '请选择数据源'
  },
  fromTableDataTable: {
    required: true,
    trigger: ['input'],
    message: '请输入从表数据表'
  },
  fromTableField: {
    required: true,
    trigger: ['input'],
    message: '请输入从表字段'
  },
  standardSpecificationId: {
    required: true,
    trigger: ['change'],
    message: '请选择标准规范'
  },
  standardCodeSetId: {
    required: true,
    trigger: ['change'],
    message: '请选择标准代码集'
  },
  minSize: {
    trigger: ['input', 'blur'],
    validator(rule: FormItemRule, value: string) {
      if (isEmpty(value) && isEmpty(customFormModel.value.maxSize)) {
        return new Error('最小值与最大值至少填写一个')
      } else if (value > customFormModel.value.maxSize) {
        return new Error('最小值不可大于最大值')
      }
    }
  },
  maxSize: {
    trigger: ['input', 'blur'],
    validator(rule: FormItemRule, value: string) {
      if (isEmpty(value) && isEmpty(customFormModel.value.minSize)) {
        return new Error('最小值与最大值至少填写一个')
      } else if (value < customFormModel.value.minSize) {
        return new Error('最小值不可大于最大值')
      }
    }
  },
  numType: {
    required: true,
    trigger: ['change'],
    message: '请选择数值类型'
  },
  enumsValue: {
    trigger: ['change'],
    validator(rule: unknown, value: string[]) {
      if (value.length == 0) return new Error('请输入枚举值')
      return true
    }
  },
  regularValue: {
    required: true,
    trigger: ['input'],
    message: '请输入正则表达式'
  },
  customSqlKey: {
    required: true,
    trigger: ['input'],
    message: '请输入质检表主键'
  },
  customSql: {
    required: true,
    trigger: ['input'],
    message: '请输入质检SQL'
  },
  customDescribe: {
    required: true,
    trigger: ['input'],
    validator(rule: unknown, value: string) {
      const pattern = /"/;
      if (pattern.test(value)) {
        return new Error('描述文本不可包含双引号')
      } else if (!value) {
        return new Error('请输入质检规则描述')
      }
    }
  },
})

const inspRuleOptions = ref<CascaderOption[]>([])
const ruleOperatorOptions = [
  {
    label: '大于',
    value: '大于',
  },
  {
    label: '大于等于',
    value: '大于等于',
  },
  {
    label: '等于',
    value: '等于',
  },
  {
    label: '不等于',
    value: '不等于',
  },
  {
    label: '小于',
    value: '小于',
  },
  {
    label: '小于等于',
    value: '小于等于',
  },
]
const ruleOperatorRightValueOptions = [
  {
    label: '上一周期',
    value: '上一周期'
  },
  {
    label: '昨日',
    value: '昨日'
  },
  {
    label: '今日',
    value: '今日'
  },
  {
    label: '明日',
    value: '明日'
  },
]

const normOptions = ref<Array<SelectOption>>()
const normOptionsInit = () => {
  get_norm().then(res => {
    if (res.success) {
      normOptions.value = res.data.map(v => ({
        label: v.normName,
        value: v.id
      }))
    } else {
      window.$message.error(res.message)
    }
  })
}

const normCodeSetOptions = ref<Array<SelectOption>>()
const normCodeSetOptionsInit = (normId: string) => {
  get_norm_code_set(normId).then(res => {
    if (res.success) {
      normCodeSetOptions.value = res.data.map(v => ({
        label: v.codeSetName,
        value: v.id
      }))
    } else {
      window.$message.error(res.message)
    }
  })
}

const inspRuleOptionsInit = () => {
  const groupedArrays = zjRulesList.reduce((groups, item) => {
    const {controlDimension} = item;
    if (!groups[controlDimension]) {
      groups[controlDimension] = [item];
    } else {
      groups[controlDimension].push(item);
    }
    return groups;
  }, {});

  inspRuleOptions.value = Object.keys(groupedArrays).map(key => ({
    label: key,
    value: key,
    isLeaf: false,
    children: groupedArrays[key].map((item: {
      ruleName: string;
      id: string;
    }) => ({
      label: item.ruleName,
      value: item.id
    }))
  }))
}

const customSqlPrefix = ref('')

const customSqlFormat = () => {
  customFormModel.value.customSql = format(customFormModel.value.customSql)
}

const customSqlValidLoading = ref(false)
const customSqlValid = () => {
  customSqlValidLoading.value = true

  sql_valid({
    id: 6,
    sql: `${customSqlPrefix.value.replaceAll('{PROJECT}', 'ssft')} ${customFormModel.value.customSql.replaceAll('{PROJECT}', 'ssft')} limit 10`
  }).then((res) => {
    if (res.code == 0) {
      window.$message.success('校验成功')
    } else if (res.code == 401) {
      window.$message.error('此Token无权')
    } else {
      window.$notification.create({
        title: "校验失败，具体看返回结果",
        content: res.msg,
        type: "error"
      })
    }
  }).finally(() => {
    customSqlValidLoading.value = false
  })
}

const handleInspRuleUpdate = async (v: string) => {
  normOptionsInit()
  if (customFormModel.value.standardSpecificationId) {
    normCodeSetOptionsInit(customFormModel.value.standardSpecificationId)
  }

  if (v == '17') {
    customFormModel.value.customSqlKey = 'id'
    const structTableName = (await find_template_struct_table({id: selectedStructTableId.value}))[0].tableName
    customSqlPrefix.value = `SELECT a.* FROM di_{PROJECT}_${structTableName.toLowerCase()}_temp_ods a`
  } else {
    customFormModel.value.customSqlKey = undefined
  }

}

const fieldInspRuleSaving = ref(false)
const handleFieldInspRuleSave = () => {

  const fieldInspectionRule = new FieldInspectionRule()

  fieldInspectionRule.tableId = selectedStructTableId.value
  fieldInspectionRule.updateTime = new Date()
  fieldInspectionRule.ruleType = selectedRuleType.value

  if (typeof selectedTableFieldId.value === 'number') {
    fieldInspectionRule.id = selectedTableFieldId.value
  } else {
    fieldInspectionRule.id = null
    fieldInspectionRule.createTime = new Date()
  }

  if (selectedRuleType.value == 1) {
    customFormRef.value?.validate(errors => {
      if (!errors) {
        fieldInspRuleSaving.value = true

        fieldInspectionRule.fieldName = customFormModel.value.fieldName
        fieldInspectionRule.fieldComment = customFormModel.value.fieldComment

        const ruleJson: any = cloneDeep(customFormModel.value)
        delete ruleJson.ruleType
        delete ruleJson.inspRuleId
        delete ruleJson.fieldName
        delete ruleJson.fieldComment

        ruleJson.dimension = inspRuleOptions.value.find(opt => opt.children.some(rule => rule.value == customFormModel.value.inspRuleId)).value
        ruleJson.inspectionRuleId = customFormModel.value.inspRuleId
        ruleJson.impactLevel = 'A'

        const {
          dimension,
          inspectionRuleId,
          impactLevel,
          ...rest
        } = ruleJson

        const reorderedData = {
          dimension,
          inspectionRuleId,
          impactLevel,
          ...rest
        }

        fieldInspectionRule.ruleList = JSON.stringify([reorderedData], null, 2)

        field_insp_rule_save(fieldInspectionRule).then(res => {
          if (res.success) {
            customFormModelBackup.value = cloneDeep(customFormModel.value)
            selectedTableFieldId.value = res.data.id
            tableFieldTreeSelectedKeys.value = [res.data.id]
            tableFieldTreeNodesInit()
            window.$message.success('保存成功')
          } else {
            window.$message.error(res.message)
          }
        }).finally(() => fieldInspRuleSaving.value = false)
      }
    })
  } else {
    referenceFormRef.value?.validate(errors => {
      if (!errors) {
        fieldInspRuleSaving.value = true

        fieldInspectionRule.fieldName = referenceFormModel.value.fieldName
        fieldInspectionRule.fieldComment = referenceFormModel.value.fieldComment

        fieldInspectionRule.referenceRuleId = parseInt(referenceFormModel.value.referenceRuleId)

        field_insp_rule_save(fieldInspectionRule).then(res => {
          if (res.success) {
            selectedTableFieldId.value = res.data.id
            tableFieldTreeSelectedKeys.value = [res.data.id]
            tableFieldTreeNodesInit()
            window.$message.success('保存成功')
          } else {
            window.$message.error(res.message)
          }
        }).finally(() => fieldInspRuleSaving.value = false)
      }
    })

  }
}

// endregion

// region 添加结构表Modal
const showAddStructTableModalRef = ref(false)

const addStructTableModalInit = () => {
  addStructTableOptionsInit()

  addStructTableFormModel.value.tableName = null
  addStructTableFormModel.value.templateId = props.templateId
  showAddStructTableModalRef.value = true
}

const addStructTableModalFormRef = ref<FormInst | null>(null);
const addStructTableFormModel = ref({
  id: null,
  tableName: null,
  fieldType: null,
  templateId: null,
  createTime: null,
  updateTime: null,
})
const addStructTableModalFormRules = ref({
  tableName: {
    required: true,
    trigger: ['change'],
    message: '请选择结构表名'
  }
})

const addStructTableOptions = ref<Array<SelectOption>>()

const addStructTableOptionsInit = async () => {
  const allTableNames = [...basicTableNames, ...actionTableNames]

  const createdTables = (await find_template_struct_table({
    templateId: props.templateId
  })).map(table => table.tableName)

  addStructTableOptions.value = allTableNames.filter(tableName => !createdTables.includes(tableName.toUpperCase())).map(v => ({
    label: v.toUpperCase(),
    value: v.toUpperCase()
  }))
}

const isAddFieldModalFormSaving = ref(false)

const handleAddFieldModalFormSave = () => {
  addStructTableModalFormRef.value?.validate(errors => {
    if (!errors) {
      isAddFieldModalFormSaving.value = true

      addStructTableFormModel.value.fieldType = getFieldTypeByTableName(addStructTableFormModel.value.tableName)
      addStructTableFormModel.value.createTime = new Date()
      addStructTableFormModel.value.updateTime = new Date()

      struct_table_save(addStructTableFormModel.value).then(res => {
        if (res.success) {
          window.$message.success('保存成功')
          structTableTreeNodesInit()
          showAddStructTableModalRef.value = false
        } else {
          window.$message.error(res.message)
        }
      }).finally(() => isAddFieldModalFormSaving.value = false)
    }
  })
}

// endregion

// region 质检变量drawer
const showInspVariablesDrawer = ref(false)
// endregion

// region 字段质检引用表单
const referenceFormRef = ref<FormInst | null>(null);
const referenceFormModel = ref({
  fieldName: null,
  fieldComment: null,
  ruleType: null,
  jobTemplateId: null,
  structTableId: null,
  referenceRuleId: null
})
const referenceFormRules = ref({
  fieldName: {
    required: true,
    trigger: ['input'],
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error('请输入字段名')
      } else if (tableFieldTreeNodes.value.some(node => node.label.toUpperCase() === value.toUpperCase() && node.key != selectedTableFieldId.value)) {
        return new Error('字段名已存在')
      }
    }
  },
  referenceRuleId: {
    required: true,
    trigger: ['change'],
    message: '请选择引用规则'
  },
  jobTemplateId: {
    required: true,
    trigger: ['change'],
    message: '请选择质检模板'
  },
  structTableId: {
    required: true,
    trigger: ['change'],
    message: '请选择结构表'
  },
})

// 质检模板
const jobTemplateOptions = ref<Array<SelectOption>>()

const jobTemplateOptionsInit = async () => {
  jobTemplateOptions.value = (await find_job_template({templateType: 1})).map(v => ({
    label: v.templateName,
    value: v.id.toString()
  }))
}

const handleReferenceFormTemplateIdUpdate = (v: string) => {
  referenceFormModel.value.structTableId = null
  referenceFormModel.value.referenceRuleId = null
  structTableOptionsInit(parseInt(v))
}

// 结构表
const structTableOptions = ref<Array<SelectOption>>()
const structTableOptionsInit = async (templateId: number) => {
  const tables = await find_template_struct_table({
    templateId: templateId
  })

  structTableOptions.value = tables.map(v => ({
    label: v.tableName,
    value: v.id.toString()
  }))
}

const handleReferenceFormStructTableIdUpdate = (v: string) => {
  referenceFormModel.value.referenceRuleId = null
  ruleIdOptionsInit(parseInt(v))
}

const ruleIdOptions = ref<Array<SelectOption>>()

const ruleIdOptionsInit = async (tableId: number) => {
  const inspRules = await find_field_insp_rule({
    tableId: tableId,
    ruleType: 1
  })

  ruleIdOptions.value = inspRules.map(v => ({
    label: `${v.fieldName}${v.fieldComment ? '（' + v.fieldComment + '）' : ''}`,
    value: v.id.toString()
  }))
}

const handleReferenceFormRuleIdUpdate = () => {

}

// region
</script>

<style scoped>
:deep(#customSqlFormItem .n-form-item-blank) {
  display: block;
}
</style>
