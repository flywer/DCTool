<template>
  <n-alert class="mt-4" type="default" :show-icon="false">
    一旦创建无法修改，只可删除
  </n-alert>

  <n-form
      class="mt-4"
      ref="formRef"
      :model="formModel"
      :rules="formRules"
      :size="'small'"
  >
    <n-grid :cols="4" :x-gap="4">
      <n-form-item-gi :span="4" label="数据源">
        <n-input
            v-model:value="formModel.dbName"
            readonly
        />
      </n-form-item-gi>

      <n-form-item-gi :span="4" label="表名" path="tableName">
        <n-input
            v-model:value="formModel.tableName"
            readonly
        />
      </n-form-item-gi>

      <n-form-item-gi :span="2" label="主键字段" path="pkeyName">
        <n-input
            v-model:value="formModel.pkeyName"
            :readonly="isValidConfigRef"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="2" label="批次号字段" path="cdBatchName">
        <n-input
            v-model:value="formModel.cdBatchName"
            :readonly="isValidConfigRef"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="4" label="组织机构" path="mechanismId">
        <n-select
            v-model:value="formModel.mechanismId"
            placeholder="选择组织机构"
            :options="mechanismOptions"
            :consistent-menu-width="false"
            filterable
            :disabled="isValidConfigRef"
            @update:value="handleMechanismIdUpdate"
        />
      </n-form-item-gi>
    </n-grid>
  </n-form>

  <n-space justify="end" class="mt-2">
    <n-button
        type="primary"
        :size="'small'"
        @click="handleSave"
        :loading="isSaving"
        :disabled="isValidConfigRef"
    >
      保存
    </n-button>
  </n-space>
</template>

<script setup lang="ts">
import {DataDevBizVo, Workflow} from "@common/types/datacenter/workflow";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {create_valid_config, get_valid_config_page, gte_usrc_org_tree} from "@render/api/datacenter.api";
import {getCustomTableValidConfig} from "@render/utils/datacenter/jobTabUtil";
import {FormInst, NButton, SelectGroupOption, SelectOption} from "naive-ui";
import {ref, watch, onMounted, reactive} from "vue";

const props = defineProps({
  workflow: {
    type: Object as () => Workflow,
    required: true,
    default: null
  },
  editable: {
    type: Boolean,
    default: true
  }
})

onMounted(() => {
  formInit()
})

watch(() => props.workflow, () => {
  formInit()
})

const isValidConfigRef = ref(false)

const formRef = ref<FormInst | null>(null);
const formModel = reactive({
  dbId: '6',
  dbName: "数据中台（TBDS）",
  mechanismId: '',
  mechanismName: '',
  pkeyName: '',
  cdBatchName: 'cd_batch',
  tableName: ''
})
const formRules = {
  mechanismId: {
    required: true,
    trigger: ['change'],
    message: '请选择组织机构'
  },
  pkeyName: {
    required: true,
    trigger: ['input'],
    message: '请输入主键字段'
  },
  cdBatchName: {
    required: true,
    trigger: ['input'],
    message: '请输入批次号字段'
  }
}

// 组织机构下拉值
const mechanismOptions = ref<Array<SelectOption | SelectGroupOption>>()

const handleMechanismIdUpdate = () => {
  formModel.mechanismName = mechanismOptions.value.filter(item => item.value == formModel.mechanismId)[0].label as string
}

const formInit = async () => {
  if (props.workflow) {
    const dataDevBizVo: DataDevBizVo = JSON.parse(props.workflow.businessParamsJson)

    const tableName = dataDevBizVo.qualityInspectionDtoList[0].sourceTableName

    const projectName = props.workflow.projectName.replaceAll('行政行为', '')
    const departName = projectName.slice(0, projectName.indexOf('数据归集'))

    isValidConfigRef.value = await getCustomTableValidConfig(tableName)

    mechanismOptions.value = (await gte_usrc_org_tree()).data.sort(customSort).map(((v: {
      name: any;
      id: any;
    }) => ({
      label: `${v.name}`,
      value: v.id
    })))

    if (isValidConfigRef.value) {
      // 若已配置
      get_valid_config_page(tableName).then(res => {
        const data = res.data.records[0]
        formModel.dbId = data.dbId
        formModel.dbName = data.dbName
        formModel.mechanismId = data.mechanismId
        formModel.mechanismName = data.mechanismName
        formModel.pkeyName = data.pkeyName
        formModel.cdBatchName = data.cdBatchName
        formModel.tableName = data.tableName
      })
    } else {
      formModel.dbId = '6'
      formModel.dbName = "数据中台（TBDS）"
      formModel.mechanismId = mechanismOptions.value.filter(opt => opt.label.toString() === departName)[0]?.value as string || ''
      formModel.mechanismName = departName
      formModel.pkeyName = (await get_table_sql({tableName: tableName.split('_')[2]}))[0].pColName.toLowerCase()
      formModel.cdBatchName = 'cd_batch'
      formModel.tableName = tableName
    }
  }
}

const customSort = (a: any, b: any) => {
  // Check if both strings start with '广东省'
  const startsWithGuangDongA = a.name.startsWith('广东省');
  const startsWithGuangDongB = b.name.startsWith('广东省');

  if (startsWithGuangDongA && !startsWithGuangDongB) {
    return -1; // Move `a` before `b`
  } else if (!startsWithGuangDongA && startsWithGuangDongB) {
    return 1; // Move `b` before `a`
  } else {
    // Both start with '广东省' or don't start with it
    return a.name.localeCompare(b.name);
  }
};

const isSaving = ref(false)

const handleSave = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      if (!isValidConfigRef.value) {
        isSaving.value = true
        create_valid_config(formModel)
            .then(async res => {
              if (res.code == 200) {
                window.$message.success('配置成功')
              } else {
                window.$message.error(res.message)
              }
            })
            .finally(() => isSaving.value = false)
      }
    }
  })
}

</script>

<style scoped>

</style>
