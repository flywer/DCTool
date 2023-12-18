<template>
  <n-modal
      v-model:show="_show"
      :mask-closable="true"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="title"
      :size="'small'"
      style="width: 560px"
      @afterLeave="onAfterLeave"
  >
    <n-tabs type="line" animated>
      <n-tab-pane name="basic" tab="基础配置">
        <basic-config-tab v-model:workflow="workflow" :editable="editable"/>
      </n-tab-pane>
      <n-tab-pane name="sched" tab="调度配置">
        <sched-config-tab v-model:workflow="workflow" :editable="editable"/>
      </n-tab-pane>
      <template v-if="workflowType?.startsWith('zj')">
        <n-tab-pane name="inspDepart" tab="质检所属单位配置">
          <insp-depart-config-tab v-model:workflow="workflow" :editable="editable"/>
        </n-tab-pane>
        <n-tab-pane name="inspRule" tab="质检规则配置">
          <insp-rules-config-tab v-model:workflow="workflow" :editable="editable"/>
        </n-tab-pane>
      </template>
    </n-tabs>
  </n-modal>
</template>

<script setup lang="ts">
import {Workflow} from "@common/types/datacenter/workflow";
import {JobType} from "@common/types/jobMgt";
import {get_workflow} from "@render/api/datacenter.api";
import {getJobType} from "@render/utils/datacenter/jobTabUtil";
import BasicConfigTab from "@render/views/jobMgt/components/workflowConfig/basicConfigTab.vue";
import InspDepartConfigTab from "@render/views/jobMgt/components/workflowConfig/inspDepartConfigTab.vue";
import InspRulesConfigTab from "@render/views/jobMgt/components/workflowConfig/inspRulesConfigTab.vue";
import SchedConfigTab from "@render/views/jobMgt/components/workflowConfig/schedConfigTab.vue";
import {onMounted, ref, watch} from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  },
  title: {
    type: String,
    default: '工作流任务配置'
  },
  workflowId: {
    type: String,
    required: true,
    default: null
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:show', 'onAfterLeave'])

const _show = ref(false)

onMounted(() => {
  _show.value = props.show
})

watch(() => props.show, (v) => {
  _show.value = v
})
watch(_show, (v) => {
  if (v) {
    init()
  }
  emit('update:show', v)
})

const workflow = ref<Workflow>(null)
const isUpdated = ref(false)

watch(workflow, (newValue, oldValue) => {
  if (newValue && oldValue) {
    isUpdated.value = true
  }
})

const workflowType = ref<JobType>(null)

const init = async () => {
  workflow.value = (await get_workflow(props.workflowId)).data
  workflowType.value = getJobType(workflow.value.procName)
}

const onAfterLeave = () => {
  workflow.value = null
  if (isUpdated.value) {
    emit('onAfterLeave')
    isUpdated.value = false
  }
}
</script>

<style scoped>

</style>
