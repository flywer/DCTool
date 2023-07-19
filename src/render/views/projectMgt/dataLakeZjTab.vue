<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 95px);" trigger="hover">
    <div class="w-auto h-8 mb-2">
      <n-space inline class="float-right">
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
  </n-scrollbar>

  <n-drawer
      v-model:show="showDrawerRef"
      :width="220"
  >
    <n-drawer-content title="日志" :native-scrollbar="false" closable>
      <n-timeline v-if="!isEmpty(logItemsRef)">
        <n-timeline-item v-for="item in logItemsRef"
                         :type="item.type"
                         :title="item.title"
                         :content="item.content"
                         :time="item.time"
        />
      </n-timeline>
      <n-empty v-else description="无运行日志"/>
      <n-space v-if="showTipRef" class="mt-4" style="color: #999999" justify="center">仅显示前100条</n-space>
    </n-drawer-content>
  </n-drawer>

  <n-modal
      v-model:show="showModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="'质检配置管理'"
      :size="'small'"
      style="width: 566px"
  >
    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
      <n-alert class="mt-4" type="default" :show-icon="false">
        一旦创建无法修改，只可删除
      </n-alert>

      <n-form
          class="mt-4"
          ref="validConfigModalFormRef"
          :model="validConfigModalFormModel"
          :rules="validConfigModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="表名" path="tableName">
            <n-input
                v-model:value="validConfigModalFormModel.tableName"
                readonly
            />
          </n-form-item-gi>

          <n-form-item-gi :span="2" label="主键字段" path="pkeyName">
            <n-input
                v-model:value="validConfigModalFormModel.pkeyName"
                :readonly="isValidConfigRef"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="2" label="批次号字段" path="cdBatchName">
            <n-input
                v-model:value="validConfigModalFormModel.cdBatchName"
                :readonly="isValidConfigRef"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="4" label="组织机构" path="mechanismId">
            <n-select
                v-model:value="validConfigModalFormModel.mechanismId"
                placeholder="选择组织机构"
                :options="mechanismOptions"
                :consistent-menu-width="false"
                filterable
                :disabled="isValidConfigRef"
                @update:value="handlemechanismIdUpdate"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="onPositiveClick" :loading="isSaving">确定
      </n-button>
      <n-button :size="'small'" @click="onNegativeClick">返回</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {get_table_sql} from "@render/api/auxiliaryDb";
import {
  create_valid_config,
  get_valid_config_page,
  get_workflow_log,
  get_workflow_page,
  gte_usrc_org_tree
} from "@render/api/datacenter";
import {
  getCustomTableValidConfig,
  getWorkflowJobStatus,
  Job,
  setJobStatus,
  showButton,
  showConfirmation,
  workflowActive,
  workflowDelete,
  workflowJobGetLastExecTime,
  workflowJobGetNextExecTime,
  workflowReRun, workflowRun,
} from "@render/utils/datacenter/jobTabUtil";
import {Refresh} from '@vicons/ionicons5'
import {isEmpty} from "lodash-es";
import {
  DataTableColumns,
  FormInst,
  NButton,
  NSpace,
  SelectGroupOption,
  SelectOption,
  TimelineItemProps
} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

const tableDataRef = ref([])
const isTableLoading = ref(false)

const projectId = '26'

onMounted(() => {
  tableDataInit()
})

const tableDataInit = async () => {
  isTableLoading.value = true

  // const project = (await find_by_project_id(projectId))

  //工作流任务
  const lakeZjJob = (await get_workflow_page({
    page: 1,
    size: 10000,
    status: null,
    procName: `zj_lake_`
  })).data.records

  let newJobs = []

  for (const v of lakeZjJob) {
    const job: Job = {
      id: v.id,
      jobName: v.procName,
      type: '数据质检任务',
      status: getWorkflowJobStatus(v),
      schedMode: v.schedulingMode,
      cron: v.crontab == '' ? null : v.crontab,
      lastExecTime: await workflowJobGetLastExecTime(v),
      nextExecTime: workflowJobGetNextExecTime(v),
      createBy: v.createBy,
      code: v.procCode,
      comment: await getTableComment(v.procName)
    }

    newJobs.push(job)
  }

  tableDataRef.value = newJobs

  isTableLoading.value = false
}

const getTableComment = async (procName: string) => {
  return (await get_table_sql({
    tableName: procName.split('_')[2]
  }))[0].comment as string
}
const createColumns = (): DataTableColumns<Job> => {
  return [
    {
      title: '任务名',
      key: 'jobName',
      width: '10%'
    },
    {
      title: '数据类型',
      key: 'comment',
      width: '15%'
    },
    {
      title: '状态',
      key: 'status',
      width: '8%',
      align: 'center',
      render(row) {
        return setJobStatus(row)
      }
    },
    {
      title: '上次执行时间',
      key: 'lastExecTime',
      width: '16%'
    },
    {
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '16%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '20%',
      align: 'center',
      render(row) {

        let container = h(NSpace, {
          justify: 'center'
        })
        let children: any[] = []

        switch (row.status) {
          case  1: // 任务停用
            children = [
              showButton('启用', async () => {
                await workflowActive(row.id, '01', () => tableDataInit())
              }),
              showConfirmation('执行', async () => {
                await workflowActive(row.id, '01', () => {
                })
                await workflowRun(row, await getCustomTableValidConfig(`sztk_${row.jobName.split('_')[2]}`), `sztk_${row.jobName.split('_')[2]}`, () => tableDataInit())
              }),
              showConfirmation('删除', async () => {
                await workflowDelete(row.id, () => tableDataInit())
              }),
            ]
            break
          case 2:// 任务启用
            children = [
              showButton('停用', async () => {
                await workflowActive(row.id, '02', () => tableDataInit())
              }),
              showConfirmation('执行', async () => {
                await workflowRun(row, await getCustomTableValidConfig(`sztk_${row.jobName.split('_')[2]}`), `sztk_${row.jobName.split('_')[2]}`, () => tableDataInit())
              }),
              showConfirmation('删除', async () => {
                await workflowActive(row.id, '02', () => {
                })
                await workflowDelete(row.id, () => tableDataInit())
              }),
            ]
            break
          case 3:// 任务运行中
            break
          case 4:// 任务异常
            children = [
              showConfirmation('重跑', async () => {
                workflowReRun(row, () => tableDataInit())
              }),
            ]
            break
          case 5:// 任务未反馈
            children = [
              showConfirmation('重跑', async () => {
                workflowReRun(row, () => tableDataInit())
              }),
              showConfirmation('删除', async () => {
                await workflowDelete(row.id, () => tableDataInit())
              }),
            ]
            break
        }

        children.push(
            showButton('日志', () => showWorkflowLog(row)),
            showButton('配置', () => showValidConfigModal(row))
        )

        container.children = children

        return container
      }
    }
  ]
}

const columnsRef = ref(createColumns())

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: async (page: number) => {
    paginationReactive.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
  }
})

// region 日志
const showDrawerRef = ref(false)
const logItemsRef = ref<TimelineItemProps[]>([])
const showTipRef = ref(false)
const showWorkflowLog = async (v) => {
  const logs = (await get_workflow_log(v.id, 100, 1)).data.records

  showTipRef.value = logs.length >= 100;

  logItemsRef.value = []

  logs.forEach(log => {
    let type
    let title
    let content
    let time

    if (log.result == null) {
      title = '运行中'
      type = 'info'
    } else if (log.result == 1) {
      title = '执行成功'
      type = 'success'
    } else if (log.result == 2) {
      title = '执行失败'
      type = 'error'
    } else if (log.result == 3) {
      title = '未反馈'
      type = 'warning'
    } else {
      title = '未知'
      type = 'warning'
    }

    time = log.startTime
    content = log.componentName

    logItemsRef.value.push({
      type: type,
      title: title,
      content: content,
      time: time
    })
  })

  showDrawerRef.value = true
}
//endregion

//region 质检配置管理
const showModalRef = ref(false)
const isValidConfigRef = ref(false)

// 组织机构下拉值
const mechanismOptions = ref<Array<SelectOption | SelectGroupOption>>()

const validConfigModalFormRef = ref<FormInst | null>(null);

const validConfigModalFormModel = ref({
  dbId: '12',
  dbName: "数据湖（TDSQL）",
  mechanismId: '',
  mechanismName: '',
  pkeyName: '',
  cdBatchName: 'cd_batch',
  tableName: ''
})

const validConfigModalFormRules = {
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

const showValidConfigModal = async (v) => {
  const tableName = v.jobName.split('_')[2]
  const validTableName = `sztk_${tableName}`

  isValidConfigRef.value = await getCustomTableValidConfig(`sztk_${tableName}`)

  if (isValidConfigRef.value) {
    // 若已配置
    get_valid_config_page(validTableName).then(res => {
      const data = res.data.records[0]
      validConfigModalFormModel.value.dbId = data.dbId
      validConfigModalFormModel.value.dbName = data.dbName
      validConfigModalFormModel.value.mechanismId = data.mechanismId
      validConfigModalFormModel.value.mechanismName = data.mechanismName
      validConfigModalFormModel.value.pkeyName = data.pkeyName
      validConfigModalFormModel.value.cdBatchName = data.cdBatchName
      validConfigModalFormModel.value.tableName = data.tableName
    })
  } else {
    validConfigModalFormModel.value.tableName = validTableName
    validConfigModalFormModel.value.mechanismId = ''
    validConfigModalFormModel.value.mechanismName = ''
    validConfigModalFormModel.value.pkeyName = (await get_table_sql({tableName: tableName}))[0].pColName.toLowerCase()
    validConfigModalFormModel.value.cdBatchName = 'cd_batch'
  }

  mechanismOptions.value = (await gte_usrc_org_tree()).data.sort(customSort).map((v => ({
    label: `${v.name}`,
    value: v.id
  })))

  showModalRef.value = true
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
  isSaving.value = true
  validConfigModalFormRef.value?.validate(async (errors) => {
    if (!errors) {
      if (!isValidConfigRef.value) {
        create_valid_config(validConfigModalFormModel.value).then(async res => {
          if (res.code == 200) {
            window.$message.success('配置成功')
          } else {
            window.$message.error(res.message)
          }
        }).finally(() => {
          isSaving.value = false
          showModalRef.value = false
        })
      }

    } else {
      console.error(errors)
    }
  })
}

const onNegativeClick = () => {
  showModalRef.value = false
}

const handlemechanismIdUpdate = () => {
  validConfigModalFormModel.value.mechanismName = mechanismOptions.value.filter(item => item.value == validConfigModalFormModel.value.mechanismId)[0].label as string
}

//endregion

</script>

<style scoped>

</style>
