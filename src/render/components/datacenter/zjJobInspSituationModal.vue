<template>
  <n-modal
      v-model:show="_show"
      :mask-closable="true"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="'质检情况'"
      :size="'small'"
      style="width: 750px"
  >
    <job-inspection-tab :inps-table-name="inspTableName" :inps-table-db-id="inspTableDbId"/>
  </n-modal>
</template>

<script setup lang="ts">
import JobInspectionTab from "@render/views/jobMgt/projectTree/jobInspectionTab.vue";
import {ref, watch} from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  },
  inspTableName: {
    type: String,
    required: true,
    default: null
  },
  inspTableDbId: {
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
  emit('update:show', v)
})

</script>

<style scoped>

</style>
