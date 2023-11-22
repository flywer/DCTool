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
      style="width:700px"
  >
    <n-scrollbar style="height:430px;" trigger="hover">

      <div class="w-auto h-8 mb-2">
        <n-space inline class="float-right">
          <n-input-group>
            <n-input
                v-model:value="queryParam"
                placeholder="搜索任务"
                clearable
                :readonly="isTableLoading"
                @keydown.enter="tableDataInit"
                style="width: 180px"
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
          <n-button secondary strong type="info" @click="updateAllJob" :disabled="isTableLoading"
                    :loading="isUpdatingAllJob"
          >
            更新所有任务
          </n-button>
          <n-button secondary strong @click="tableDataInit" :loading="isTableLoading">
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
          :bordered="true"
          :size="'small'"
          :loading="isTableLoading"
          :striped="true"
          :pagination="{pageSize:10}"
          :max-height="300"
          :min-height="300"
      />
    </n-scrollbar>
  </n-modal>
</template>

<script setup lang="ts">
import {Workflow} from "@common/types/datacenter/workflow";
import {find_job_rel_by_id, find_template_struct_table} from "@render/api/auxiliaryDb/templateStructTable.api";
import {get_workflow, workflow_active} from "@render/api/datacenter.api";
import {getWorkflowJobStatus, showButton} from "@render/utils/datacenter/jobTabUtil";
import {ZjJobSaveModel} from "@render/utils/datacenter/workflow/ZjJobSaveModel";
import {Refresh, Search} from "@vicons/ionicons5";
import {DataTableColumns, NButton, NIcon, NSpace, NTag} from "naive-ui";
import {ref, h, watch} from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  },
  title: {
    type: String,
    default: '关联任务'
  },
  structTableId: {
    type: Number,
    required: true,
    default: null
  },
})

const emit = defineEmits(['update:show', 'onAfterLeave'])

const _show = ref(false)

watch(() => props.show, (v) => {
  _show.value = v
})

watch(_show, async (v) => {
  if (v) {
    structTable.value = (await find_template_struct_table({id: props.structTableId}))[0]
    tableDataInit()
  }
  emit('update:show', v)
})

const structTable = ref(null)

// region 搜索
const queryParam = ref('')

// endregion

// region 表格
const tableDataRef = ref<Workflow[]>([])

const isTableLoading = ref(false)

const tableDataInit = () => {
  isTableLoading.value = true

  find_job_rel_by_id(props.structTableId)
      .then(async data => {
        const jobIds = data.map(job => job.jobId)
        tableDataRef.value = []

        for (let i = 0; i < jobIds.length; i++) {
          const workflow = (await get_workflow(jobIds[i])).data
          if (workflow && workflow.procName.includes(queryParam.value)) {
            tableDataRef.value.push(workflow)
          }
        }

      })
      .catch((e) => {
        console.error(e)
        isTableLoading.value = false
      })
      .finally(() => isTableLoading.value = false)

}

const createColumns = (): DataTableColumns<Workflow> => {
  return [
    {
      title: '工作流名称',
      key: 'procName',
      width: '25%'
    },
    {
      title: '状态',
      key: 'status',
      width: '10%',
      align: 'center',
      render(row) {
        return setJobStatus(getWorkflowJobStatus(row))
      }
    },
    {
      title: '创建时间',
      key: 'createTime',
      width: '26%'
    },
    {
      title: '更新时间',
      key: 'updateTime',
      width: '26%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '20%',
      align: 'center',
      render(row) {
        return h(NSpace, {
          justify: 'center'
        }, [
          showButton('更新质检规则', () => {
            updateInspRule(row.id)
          }),
        ])
      }
    }
  ]
}

const setJobStatus = (status: number) => {
  switch (status) {
    case 1:
      return h(NTag, {
            size: 'small',
            bordered: false,
            type: 'default'
          },
          {default: () => '停用'})
    case 2:
      return h(NTag, {
            size: 'small',
            bordered: false,
            type: 'info'
          },
          {default: () => '启用'})
    case 3:
      return h(NTag, {
            size: 'small',
            bordered: false,
            type: 'success'
          },
          {default: () => '运行中'})
    case 4:
      return h(NTag, {
            size: 'small',
            bordered: false,
            type: 'error'
          },
          {default: () => '异常'})
    case 5:
      return h(NTag, {
            size: 'small',
            bordered: false,
            color: {
              color: '#8eafd3',
              textColor: 'white'
            }
          },
          {default: () => '未反馈'})
  }
}

const columnsRef = ref(createColumns())

// endregion

const updateInspRule = (workflowId: string) => {
  const model = new ZjJobSaveModel()
  model.updateJobFieldInspRules(workflowId, structTable.value.id, true, true).then(() => {
    tableDataInit()
  })
}

const isUpdatingAllJob = ref(false)

const updateAllJob = async () => {
  isUpdatingAllJob.value = true

  new Promise<void>(async (resolve) => {
    for (let i = 0; i < tableDataRef.value.length; i++) {
      if (tableDataRef.value[i].status == '1') {
        await workflow_active({
          id: tableDataRef.value[i].id,
          type: '02'
        })
        const model = new ZjJobSaveModel()
        await model.updateJobFieldInspRules(tableDataRef.value[i].id, structTable.value.id, false, false)
        await workflow_active({
          id: tableDataRef.value[i].id,
          type: '01'
        })
      } else {
        const model = new ZjJobSaveModel()
        await model.updateJobFieldInspRules(tableDataRef.value[i].id, structTable.value.id, false, false)
      }
    }
    resolve()
  }).then(() => {
    tableDataInit()
    window.$message.success('更新质检规则成功')
  }).finally(() => isUpdatingAllJob.value = false)

  /*      Promise.all(tableDataRef.value.map((workflow, index) => {

        setTimeout(async () => {
          if (workflow.status == '1') {
            await workflow_active({id: workflow.id, type: '02'})
            const model = new ZjJobSaveModel()
            await model.updateJobFieldInspRules(workflow.id, structTable.value.id, false)
            await workflow_active({id: workflow.id, type: '01'})
          } else {
            const model = new ZjJobSaveModel()
            await model.updateJobFieldInspRules(workflow.id, structTable.value.id, false)
          }
        }, 100 * index)

      })).then(() => {
        // tableDataInit()
        window.$message.success('更新质检规则成功')
      }).finally(() => isUpdatingAllJob.value = false) */
}

</script>

<style scoped>

</style>
