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
      style="width: 566px"
  >
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
    <template #action>
      <n-button type="primary" :size="'small'" @click="onPositiveClick" :loading="isSaving">保存
      </n-button>
      <n-button :size="'small'" @click="onNegativeClick">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {create_valid_config, get_valid_config_page, gte_usrc_org_tree} from "@render/api/datacenter.api";
import {getCustomTableValidConfig} from "@render/utils/datacenter/jobTabUtil";
import {FormInst, NButton, SelectGroupOption, SelectOption} from "naive-ui";
import {ref, watch} from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  },
  title: {
    type: String,
    default: '质检配置管理'
  },
  tableName: {
    type: String,
    required: true,
    default: null
  }
})

const emit = defineEmits(['update:show', 'onAfterLeave'])

const _show = ref(false)

watch(() => props.show, (v) => {
  _show.value = v
})
watch(_show, (v) => {
  if (v) {
    formModelInit()
  }
  emit('update:show', v)
})

const isValidConfigRef = ref(false)

// 组织机构下拉值
const mechanismOptions = ref<Array<SelectOption | SelectGroupOption>>()

const formRef = ref<FormInst | null>(null);

const formModel = ref({
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

const formModelInit = async () => {
  isValidConfigRef.value = await getCustomTableValidConfig(props.tableName)

  if (isValidConfigRef.value) {
    // 若已配置
    get_valid_config_page(props.tableName).then(res => {
      const data = res.data.records[0]
      formModel.value.dbId = data.dbId
      formModel.value.dbName = data.dbName
      formModel.value.mechanismId = data.mechanismId
      formModel.value.mechanismName = data.mechanismName
      formModel.value.pkeyName = data.pkeyName
      formModel.value.cdBatchName = data.cdBatchName
      formModel.value.tableName = data.tableName
    })
  } else {
    formModel.value.dbId = '6'
    formModel.value.dbName = "数据中台（TBDS）"
    formModel.value.tableName = props.tableName
    formModel.value.mechanismId = ''
    formModel.value.mechanismName = ''
    formModel.value.pkeyName = (await get_table_sql({tableName: props.tableName.split('_')[2]}))[0].pColName.toLowerCase()
    formModel.value.cdBatchName = 'cd_batch'
  }

  mechanismOptions.value = (await gte_usrc_org_tree()).data.sort(customSort).map(((v: {
    name: any;
    id: any;
  }) => ({
    label: `${v.name}`,
    value: v.id
  })))

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

const onPositiveClick = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      if (!isValidConfigRef.value) {
        isSaving.value = true
        create_valid_config(formModel.value)
            .then(async res => {
              if (res.code == 200) {
                window.$message.success('配置成功')
                _show.value = false
                emit('onAfterLeave')
              } else {
                window.$message.error(res.message)
              }
            })
            .finally(() => isSaving.value = false)
      }
    }
  })
}

const handleMechanismIdUpdate = () => {
  formModel.value.mechanismName = mechanismOptions.value.filter(item => item.value == formModel.value.mechanismId)[0].label as string
}

const onNegativeClick = () => {
  _show.value = false
}

</script>

<style scoped>

</style>
