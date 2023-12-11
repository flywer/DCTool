<template>
  <n-h4 prefix="bar" class="mb-0">
    <div>
      <span>{{ structTable.tableName }}</span>
      <span :style="{
          color:useThemeVars().value.textColor3,
          fontSize:'14px'
        }" class="ml-4"
      > {{ tableComment }}
      </span>
    </div>
  </n-h4>
  <n-divider style="margin: 8px 0 8px 0"/>

  <code-mirror
      v-model="templateJson"
      :wrap="true"
      :extensions="[basicSetup,xcodeLight,json()]"
  />

</template>

<script setup lang="ts">
import {FieldInspectionRule} from "@main/entity/jobTemplate/FieldInspectionRule";
import {TemplateStructTable} from "@main/entity/jobTemplate/TemplateStructTable";
import {find_field_insp_rule} from "@render/api/auxiliaryDb/fieldInspectionRule.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {find_template_struct_table} from "@render/api/auxiliaryDb/templateStructTable.api";
import {ZjJobSaveModel} from "@render/utils/datacenter/workflow/ZjJobSaveModel";
import {xcodeLight} from "@uiw/codemirror-theme-xcode";
import {basicSetup} from "codemirror";
import {useThemeVars} from "naive-ui";
import {ref, watch, onMounted} from "vue";
import {json} from "@codemirror/lang-json"
import CodeMirror from "vue-codemirror6";

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
  model.setGlobalVariable({
    project: 'ssft',
    tableName: 'c1010'
  })

  templateJson.value = JSON.stringify(model, null, 2)
}
</script>

<style scoped>

</style>
