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
</template>

<script setup lang="ts">
import {find_by_project_id, get_table_sql} from "@render/api/auxiliaryDb";
import {create_cron_job} from "@render/api/cron";
import {
  get_workflow_log,
  get_workflow_page,
  workflow_active,
  workflow_delete,
  workflow_rerun,
  workflow_run
} from "@render/api/datacenter";
import {formatDate} from "@render/utils/common/formatDate";
import {Refresh} from '@vicons/ionicons5'
import {parseExpression} from "cron-parser";
import {isEmpty} from "lodash-es";
import {DataTableColumns, NButton, NPopconfirm, NSpace, NTag, TimelineItemProps} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";
import {uuid} from "vue3-uuid";

type Job = {
  id: string
  type: string
  jobName: string
  // -1:未创建； 0:采集任务未配置； 1:任务停用； 2:任务启用； 3:任务运行中； 4:任务异常； 5:任务未反馈
  status: number
  // 1:依赖调度；2:定时调度
  schedMode: number
  cron: string
  lastExecTime: string
  nextExecTime: string
  createBy: string
  code?: string

  comment: string
}

const tableDataRef = ref([])
const isTableLoading = ref(false)

const projectId = '26'

onMounted(() => {
  tableDataInit()
})

const tableDataInit = async () => {
  isTableLoading.value = true

  const project = (await find_by_project_id(projectId))
  const projectAbbr = project?.projectAbbr || '';

  //工作流任务
  const actionRkJobs = (await get_workflow_page({
    page: 1,
    size: 10000,
    status: null,
    procName: `rk_${projectAbbr}_`
  })).data.records

  let newJobs = []

  for (const v of actionRkJobs) {
    const job: Job = {
      id: v.id,
      jobName: v.procName,
      type: '数据入库任务',
      status: (() => {
        switch (v.status) {
          case '1':// 启用
            return 2
          case '2':// 停用
            return 1
          case '3':// 异常
            return 4
          case '4':// 运行中
            return 3
          case '5':// 未反馈
            return 5
          default :
            return v.status as number
        }
      })(),
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

const workflowJobGetLastExecTime = async (v) => {
  const res = await get_workflow_log(v.id, 1, 1);
  if (!isEmpty(res.data.records)) {
    return res.data.records[0].startTime;
  } else {
    return '--';
  }
};

const workflowJobGetNextExecTime = (v) => {
  if (v.schedulingMode == 2) {
    const interval = parseExpression(convertToSixFields(v.crontab));
    return formatDate(interval.next().toDate())
  } else if (v.schedulingMode == 1) {
    return `依赖于${v.dependencyWorkflowName}`
  } else {
    return '未配置调度任务'
  }
}

const convertToSixFields = (cron: string): string => {
  const fields = cron.split(' ');
  return `${fields[0]} ${fields[1]} ${fields[2]} ${fields[3]} ${fields[4]} ${fields[5]}`;
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
        switch (row.status) {
          case -1:
            return h(NTag, {
                  size: 'small',
                  bordered: false,
                  color: {
                    color: '#797979',
                    textColor: 'white'
                  }
                },
                {default: () => '未创建'})
          case 0:
            return h(NTag, {
                  size: 'small',
                  bordered: false,
                  color: {
                    color: '#ffc062',
                    textColor: 'white'
                  }
                },
                {default: () => '未配置'})
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

        switch (row.status) {
          case  1: // 任务停用
            container.children = [
              showButton('启用', () => {
                workflowActive(row.id, '01')
              }),
              showConfirmation('执行', async () => {
                await workflowActive(row.id, '01')
                await workflowRun(row)
              }),
              showConfirmation('删除', async () => {
                await workflowDelete(row.id)
              }),
              showButton('日志', () => {
                showWorkflowLog(row)
              }),
            ]
            break
          case 2:// 任务启用
            container.children = [
              showButton('停用', () => {
                workflowActive(row.id, '02')
              }),
              showConfirmation('执行', () => {
                workflowRun(row)
              }),
              showConfirmation('删除', async () => {
                await workflowActive(row.id, '02')
                await workflowDelete(row.id)
              }),
              showButton('日志', () => {
                showWorkflowLog(row)
              }),
            ]
            break
          case 3:// 任务运行中
            break
          case 4:// 任务异常
            container.children = [
              showConfirmation('重跑', async () => {
                workflowReRun(row)
              }),
              showButton('日志', () => {
                showWorkflowLog(row)
              }),
            ]
            break
        }
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

const showButton = (text, onClick) => {
  return h(NButton, {
        size: 'small',
        onClick: async () => {
          await onClick()
        }
      },
      {default: () => text})
}

const showConfirmation = (text, onPositiveClick) => {
  return h(NPopconfirm, {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await onPositiveClick();
    },
  }, {
    trigger: () => {
      return h(NButton, {size: 'small'}, {default: () => text})
    },
    default: () => `确定要${text}吗？`
  });
}

/**
 * @param id: 任务ID
 * @param type: 01：启用， 02：停用
 **/
const workflowActive = async (id: string, type: '01' | '02') => {
  await workflow_active({
    id: id,
    type: type
  }).then((res) => {
    if (res.code == 200) {
      window.$message.success(type == '01' ? '启用成功' : '停用成功')
      tableDataInit()
    } else {
      window.$message.error(res.msg, res.message)
      console.error(res)
    }
  })
}

const workflowRun = async (v: Job) => {
  workflowJobStart(v)
}

const workflowJobStart = (v: Job) => {
  const param = {
    businessKey: uuid.v4(),
    code: v.code,
    createBy: v.createBy,
    creator: v.createBy
  }
  workflow_run(param).then(res => {
    if (res.code == 200) {
      window.$message.success(res.message)
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  }).then(() => {
    create_cron_job(v.jobName)
  })
}

const workflowReRun = (v: Job) => {
  workflow_rerun(v.id, 1).then(res => {
    if (res.code == 200) {
      window.$message.success(res.message)
      tableDataInit()
    } else {
      window.$message.error(res.message)
    }
  }).then(() => {
    create_cron_job(v.jobName)
  })
}

const workflowDelete = (id) => {
  workflow_delete(id).then(res => {
    if (res.code == 200) {
      window.$message.success(res.data)
      tableDataInit()
    } else {
      window.$message.error("删除失败")
    }
  })
}

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

</script>

<style scoped>

</style>
