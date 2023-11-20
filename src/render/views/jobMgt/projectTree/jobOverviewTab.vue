<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 118px);" trigger="hover">
    <n-card>
      <n-h3 prefix="bar" class="mb-0">
        DataX任务
      </n-h3>

      <n-grid :cols="2" :x-gap="12" :y-gap="12" class="mt-3" v-if="projectAbbr">
        <n-gi :span="1">
          <overview-data-x-job-card
              title="采集任务"
              :job-prefix="'cj_'"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-data-x-job-card
              title="共享任务"
              :job-prefix="'gx_'"
              :project-abbr="projectAbbr"
          />
        </n-gi>
      </n-grid>
    </n-card>

    <n-card class="mt-4">
      <n-h3 prefix="bar" class="mb-0">
        工作流任务
      </n-h3>
      <n-grid :cols="1" :x-gap="12" :y-gap="12" class="mt-3" v-if="projectAbbr">
        <n-gi :span="1">
          <overview-workflow-card
              title="基础数据质检任务"
              job-prefix="zj_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据初步质检任务"
              job-prefix="zj1_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="备份任务"
              job-prefix="bf_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="清除任务"
              job-prefix="qc_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="基础数据单表融合任务"
              job-prefix="rh_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据单表融合任务"
              job-prefix="rh1_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据入湖融合任务"
              job-prefix="rh2_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据完整质检任务"
              job-prefix="zj2_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据入库融合任务"
              job-prefix="rh3_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
      </n-grid>

    </n-card>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {get_project_info} from "@render/api/auxiliaryDb/projectInfo.api";
import OverviewDataXJobCard from "@render/views/jobMgt/components/overviewDataXJobCard.vue";
import OverviewWorkflowCard from "@render/views/jobMgt/components/overviewWorkflowCard.vue";
import {onMounted, ref, watch} from "vue";

const props = defineProps({
  selectedKey: {
    type: String,
    default: '-1',
    required: true
  }
})

const projectAbbr = ref<string[]>(null)

onMounted(() => {
  handleLoad()
})

watch(() => props.selectedKey, () => {
  handleLoad()
})

const handleLoad = async () => {
  if (props.selectedKey == '-1') {
    // 全省数据归集
    projectAbbr.value = ['']
  } else if (props.selectedKey == '0') {
    // 基础数据归集
    projectAbbr.value = ['ssft', 'szsj', 'sscjdglj']
  } else if (props.selectedKey == '1') {
    const projectInfo = await get_project_info()
    const actionProject = projectInfo.filter(project => !['ssft', 'szsj', 'sscjdglj'].includes(project.projectAbbr))
    projectAbbr.value = actionProject.map(project => project.projectAbbr)
  }
}

</script>

<style scoped>

</style>
