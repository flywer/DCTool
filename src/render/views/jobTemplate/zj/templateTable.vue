<template>
  <n-layout>
    <div class="w-auto h-8 mb-2">
      <n-space inline class="float-right">
        <n-input-group>
          <n-input
              v-model:value="queryParam"
              :style="{ width: '170px' }"
              placeholder="搜索"
              clearable
              :readonly="isTableLoading"
              @keydown.enter="tableDataInit"
          >
            <template #prefix>
              <n-icon>
                <Search/>
              </n-icon>
            </template>
          </n-input>
          <n-button type="primary" ghost @click="tableDataInit">
            搜索
          </n-button>
        </n-input-group>
        <n-button secondary type="info" @click="saveModalInit()">
          创建
          <template #icon>
            <n-icon>
              <Add/>
            </n-icon>
          </template>
        </n-button>
        <n-button secondary strong @click="tableDataInit">
          刷新
          <template #icon>
            <n-icon>
              <Refresh/>
            </n-icon>
          </template>
        </n-button>
      </n-space>
    </div>

    <n-data-table
        :key="(row) => row.id"
        class="mt-2 mb-2"
        :columns="columnsRef"
        :data="tableDataRef"
        :pagination="paginationReactive"
        :bordered="true"
        :size="'small'"
        :loading="isTableLoading"
        :striped="true"
    />
  </n-layout>

  <n-modal
      v-model:show="showSaveModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="saveModalTitle"
      :size="'small'"
      style="width: 340px"
  >
    <n-form
        class="mt-4"
        ref="saveModalFormRef"
        :model="saveModelRef"
        :rules="saveFormRules"
        :size="'small'"
    >
      <n-grid :cols="10" :x-gap="4">
        <n-form-item-gi :span="10" label="模板名称" path="templateName">
          <n-input v-model:value="saveModelRef.templateName"
                   placeholder="请输入模板名称"
                   @keydown.enter.prevent
                   maxlength="128"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="10" label="模板类型">
          <n-select
              :value="'1'"
              :options="templateTypeOptions"
              :disabled="true"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <template #action>
      <n-button type="primary" :size="'small'" @click="handleSave" :loading="isSaving">保存
      </n-button>
      <n-button :size="'small'" @click="showSaveModalRef=!showSaveModalRef">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {JobTemplate} from "@main/entity/jobTemplate/JobTemplate";
import {find_job_template, job_template_delete, job_template_save} from "@render/api/auxiliaryDb/jobTemplate.api";
import {formatDate} from "@render/utils/common/dateUtils";
import {showButton, showConfirmation} from "@render/utils/datacenter/jobTabUtil";
import {Add, Refresh, Search} from "@vicons/ionicons5";
import {
  DataTableColumns,
  FormInst,
  FormItemRule,
  NButton,
  NIcon,
  NSpace,
  SelectOption
} from "naive-ui";
import {h, onMounted, reactive, ref} from 'vue'

const props = defineProps({
  show: {
    default: true,
    required: true
  },
  templateId: {
    default: null,
    required: true
  }
})

const emit = defineEmits(['update:show', 'update:templateId'])

const showTemplateDetail = (id: number) => {
  emit('update:show', false)
  emit('update:templateId', id)
}

// region 表格
const queryParam = ref('')

const tableDataRef = ref<JobTemplate[]>([])
const isTableLoading = ref(false)

const tableDataInit = async () => {
  isTableLoading.value = true
  tableDataRef.value = await find_job_template({
    templateName: queryParam.value,
    templateType: 1
  }, {templateNameLike: true})
  isTableLoading.value = false
}

onMounted(() => {
  tableDataInit()
})

const createColumns = (): DataTableColumns<JobTemplate> => {
  return [
    {
      title: '模板名称',
      key: 'templateName',
      align: 'center',
    },
    {
      title: '模板类型',
      key: 'templateType',
      align: 'center',
      render(row) {
        return templateTypeOptions.value.find(opt => opt.value === row.templateType.toString()).label as string
      }
    },
    {
      title: '创建时间',
      key: 'createTime',
      align: 'center',
      render(row) {
        return formatDate(row.createTime)
      }
    },
    {
      title: '更新时间',
      key: 'updateTime',
      align: 'center',
      render(row) {
        return formatDate(row.updateTime)
      }
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      render(row) {
        return h(NSpace, {
          justify: 'center'
        }, [
          showButton('编辑', () => {
            saveModalInit(row)
          }),
          showButton('查看规则', () => {
            showTemplateDetail(row.id)
          }),
          showConfirmation('删除', () => {
            deleteTemplate(row.id)
          })
        ])
      }
    }
  ]
}

const columnsRef = ref(createColumns())
const paginationReactive = reactive({
  page: 1,
  pageCount: 1,
  pageSize: 10
})

// endregion

// region 创建模板
const showSaveModalRef = ref(false)
const saveModalTitle = ref('创建模板')
const isSaving = ref(false)

const saveModalFormRef = ref<FormInst | null>(null)
const saveModelRef = ref({
  id: null,
  templateName: null,
  templateType: null,
  createTime: null,
  updateTime: null
})
const saveFormRules = ref({
  templateName: {
    required: true,
    trigger: ['input'],
    asyncValidator(rule: FormItemRule, value: string) {
      return new Promise<void>(async (resolve, reject) => {
        if (!value) {
          reject('模板名称不能为空')
        } else if (value) {
          let templates = await find_job_template({
            templateName: value,
            templateType: 1
          }, {templateNameLike: false})

          if (saveModelRef.value.id) {
            templates = templates.filter(temp => temp.id != saveModelRef.value.id)
          }
          if (templates.length > 0) {
            reject('模板名称已存在');
          } else {
            resolve();
          }
        }
      });
    }
  },
})

const templateTypeOptions = ref<Array<SelectOption>>([
  {
    label: '质检模板',
    value: '1'
  }
])

// 1:新增 2：更新
const saveModalInit = (row?: JobTemplate) => {
  if (row) {
    saveModelRef.value.id = row.id
    saveModelRef.value.templateName = row.templateName
    saveModelRef.value.templateType = row.templateType
    saveModelRef.value.createTime = row.createTime
    saveModelRef.value.updateTime = row.updateTime

    saveModalTitle.value = '编辑模板'
  } else {
    saveModelRef.value.id = null
    saveModelRef.value.templateName = null
    saveModelRef.value.templateType = 1
    saveModelRef.value.createTime = new Date()
    saveModelRef.value.updateTime = new Date()

    saveModalTitle.value = '创建模板'
  }
  showSaveModalRef.value = true
}

const handleSave = () => {
  saveModalFormRef.value?.validate(errors => {
    if (!errors) {
      isSaving.value = true
      job_template_save(saveModelRef.value).then(res => {
        if (res) {
          window.$message.success("保存成功")
          showSaveModalRef.value = false
          tableDataInit()
        } else {
          window.$message.error("保存失败")
        }
      }).finally(() => isSaving.value = false)
    }
  })
}

const deleteTemplate = (id: number) => {
  job_template_delete(id).then(res => {
    if (res) {
      window.$message.success("删除成功")
      tableDataInit()
    } else {
      window.$message.error("删除失败")
    }
  })
}

// endregion
</script>

<style scoped>

</style>
