<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 118px);" trigger="hover">
    <n-card>
      <n-h3 prefix="bar" class="mb-0">
        DataX任务
      </n-h3>

      <n-grid :cols="2" :x-gap="12" :y-gap="12" class="mt-3" v-if="projectAbbr">
        <n-gi :span="2">
          <overview-data-x-job-card
              title="全部任务"
              :job-prefix="''"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-data-x-job-card
              title="采集任务"
              job-prefix="cj\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-data-x-job-card
              title="共享任务"
              job-prefix="gx\_"
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
              title="全部任务"
              :job-prefix="''"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="基础数据质检任务"
              job-prefix="zj\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据初步质检任务"
              job-prefix="zj1\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="备份任务"
              job-prefix="bf\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="清除任务"
              job-prefix="qc\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="基础数据单表融合任务"
              job-prefix="rh\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据单表融合任务"
              job-prefix="rh1\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据入湖融合任务"
              job-prefix="rh2\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据完整质检任务"
              job-prefix="zj2\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="行为数据入库融合任务"
              job-prefix="rh3\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="ODS数据量统计任务"
              job-prefix="odstj\_"
              :project-abbr="projectAbbr"
          />
        </n-gi>
        <n-gi :span="1">
          <overview-workflow-card
              title="ODS数据记录任务"
              job-prefix="odsjl\_"
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
