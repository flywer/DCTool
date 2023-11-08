<template>
  <n-h4 prefix="bar" class="mb-0">
    <div>
      <span>{{ structTable.tableName }}</span>
      <span :style="{
          color:useThemeVars().value.textColor3,
          fontSize:'14px'
        }" class="ml-4"
      > {{ tableComment }}</span>
    </div>
  </n-h4>
  <n-divider style="margin: 8px 0 8px 0"/>
<!--  <n-button @click="createJob">创建任务</n-button>-->
  <JsonEditorVue
      v-model="templateJson"
      v-bind="{
        mode:'text',
        mainMenuBar:true,
        statusBar:false,
        navigationBar:false,
        askToFormat:false,
        escapeControlCharacters:false,
        escapeUnicodeCharacters:false,
        flattenColumns:false,
      }"
      style="height: calc(100vh - 250px)"
  />
</template>

<script setup lang="ts">
import {FieldInspectionRule} from "@main/entity/jobTemplate/FieldInspectionRule";
import {TemplateStructTable} from "@main/entity/jobTemplate/TemplateStructTable";
import {find_field_insp_rule} from "@render/api/auxiliaryDb/fieldInspectionRule.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {find_template_struct_table} from "@render/api/auxiliaryDb/templateStructTable.api";
import {ZjJobSaveModel} from "@render/utils/datacenter/workflow/ZjJobSaveModel";
import {useThemeVars} from "naive-ui";
import {ref, watch, onMounted} from "vue";
import JsonEditorVue from 'json-editor-vue'

const props = defineProps({
  structTableId: {
    default: null,
    required: true
  }
})

onMounted(async () => {
  await init()
  await createTestJson()
})

watch(() => props.structTableId, async (v) => {
  await init()
  await createTestJson()
})

const structTable = ref<TemplateStructTable>(new TemplateStructTable())
const inspRules = ref<FieldInspectionRule[]>([])
const tableComment = ref(null)

const templateJson = ref(null)

const init = async () => {
  inspRules.value = await find_field_insp_rule({tableId: props.structTableId})
  structTable.value = (await find_template_struct_table({id: props.structTableId}))[0]
  tableComment.value = (await get_table_sql({tableName: structTable.value.tableName}))[0].comment
}

const createTestJson = async () => {
  const model = new ZjJobSaveModel(`test_${structTable.value.tableName.toLowerCase()}`, '', '')
  await model.setTableFieldRules(props.structTableId)
  model.setGlobalVariable({project: 'ssft', tableName: 'c1010'})
  templateJson.value = model
}

const createJob = async () => {
  const model = new ZjJobSaveModel(`test_${structTable.value.tableName.toLowerCase()}`, '', '')
  await model.setTableFieldRules(props.structTableId)
  model.setGlobalVariable({project: 'ssft', tableName: 'c1010'})
  await model.createZjJob()
}

</script>

<style scoped>

</style>
