<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <n-space inline class="float-right">
          <n-input
              v-model:value="queryParam"
              placeholder="搜索"
              @update:value="tableDataInit"
              clearable
              :readonly="isTableLoading"
          >
            <template #prefix>
              <n-icon>
                <Search/>
              </n-icon>
            </template>
          </n-input>
          <n-button secondary type="info" @click="taskConfigModalInit(null)">
            新增
            <template #icon>
              <n-icon>
                <Add/>
              </n-icon>
            </template>
          </n-button>
          <n-button secondary strong @click="tableDataInit(queryParam)">
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
          :scroll-x="1200"
      >
      </n-data-table>

    </n-scrollbar>
  </n-layout>

  <n-modal
      v-model:show="showAddTaskModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="modalTitle"
      :size="'small'"
      style="width: 80%"
      @afterEnter="jobGraphInit"
  >
    <n-scrollbar class="pr-2" style="height: calc(100vh - 180px);" trigger="hover">
      <n-form
          class="mt-4"
          ref="taskConfigModalFormRef"
          :model="taskConfigModalFormModel"
          :rules="taskConfigModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="12" :x-gap="12">
          <n-form-item-gi :span="6" label="任务名称" path="taskName" :label-style="{userSelect:'none'}">
            <n-input v-model:value="taskConfigModalFormModel.taskName"
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="6" label="CRON表达式" path="cron" :label-style="{userSelect:'none'}">
            <n-input v-model:value="taskConfigModalFormModel.cron"
                     @keydown.enter.prevent
                     @update:value="handleModelCronUpdate"
                     placeholder="* * * * * *"
            >
              <template #suffix>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button text size="small" color="#5dc774">
                      预测
                    </n-button>
                  </template>
                  <p v-html="cronTimePrediction"/>
                </n-tooltip>
              </template>

            </n-input>
          </n-form-item-gi>

          <n-form-item-gi id="taskNodeGraph" :span="12" label="任务节点配置" :label-style="{userSelect:'none'}">
            <n-layout style="height: calc(100vh - 180px - 115px);overflow: hidden">
              <n-grid :cols="10" :x-gap="12" style="height: 100%">
                <n-gi :span="2">
                  <n-layout style="height: 100%">
                    <n-scrollbar class="h-full bg-gray-100">
                      <div class="p-2">
                        <n-space vertical>
                          <node-item v-for="(item) in nodeItemList"
                                     :label="item.label"
                                     @dragend="handleDragEnd($event,item)"
                          >
                          </node-item>
                        </n-space>
                      </div>
                    </n-scrollbar>
                  </n-layout>
                </n-gi>

                <n-gi :span="8">
                  <n-layout style="height: 100%">
                    <div ref="g6Container" id="g6Container" style="height: calc(100vh - 180px - 115px);overflow: hidden"
                         class="bg-gray-100 relative"
                    />
                  </n-layout>
                </n-gi>
              </n-grid>
            </n-layout>
          </n-form-item-gi>
        </n-grid>
      </n-form>

    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="handleSave" :loading="isSaving">保存
      </n-button>
      <n-button :size="'small'" @click="handleModalHidden">返回</n-button>
    </template>
  </n-modal>

  <n-modal
      v-model:show="showJobUpdateModelRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      title="节点编辑"
      :size="'small'"
      style="width: 500px"
  >
    <n-scrollbar class="pr-2" style="max-height: 500px" trigger="hover">
      <n-form
          v-if="['dataX', 'workflow'].includes((jobUpdateModalFormModel.item.getModel() as SchedulerJobNodeConfig).jobType)"
          class="mt-4"
          ref="jobUpdateModalFormRef"
          :model="jobUpdateModalFormModel"
          :rules="jobUpdateModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="12" :x-gap="12">
          <n-form-item-gi :span="4" label="任务类型" :label-style="{userSelect:'none'}">
            <n-input v-model:value="jobUpdateModalFormModel.jobType"
                     @keydown.enter.prevent readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="任务名称" :label-style="{userSelect:'none'}">
            <n-select
                v-model:value="jobUpdateModalFormModel.jobId"
                placeholder="选择项目"
                :options="jobIdOptions"
                :consistent-menu-width="false"
                filterable
                clearable
                remote
                @search="handleJobIdOptionsUpdate"
                :loading="jobIdOptionsLoading"
                @update:value="handleJobIdUpdate"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <n-form
          v-if="['sparkSql','mysql'].includes((jobUpdateModalFormModel.item.getModel() as SchedulerJobNodeConfig).jobType)"
          class="mt-4"
          ref="jobUpdateModalFormRef"
          :model="jobUpdateModalFormModel"
          :rules="jobUpdateModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="12" :x-gap="12">
          <n-form-item-gi :span="12" label="任务类型" :label-style="{userSelect:'none'}">
            <n-input v-model:value="jobUpdateModalFormModel.jobType"
                     @keydown.enter.prevent readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="任务名称" path="jobName" :label-style="{userSelect:'none'}">
            <n-input v-model:value="jobUpdateModalFormModel.jobName"
                     @keydown.enter.prevent
            />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="数据源" path="dbId">
            <n-select
                v-model:value="jobUpdateModalFormModel.dbId"
                :options="datasourceOptions"
                :size="'small'"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="等待时间" path="timeout">
            <n-input-number v-model:value="jobUpdateModalFormModel.timeout"
                            :step="60"
                            :min="0"
                            :max="60*60"
            >
              <template #suffix>
                秒
              </template>
            </n-input-number>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-icon size="16" class="ml-2" style="line-height: 22px">
                  <QuestionCircleTwotone/>
                </n-icon>
              </template>
              SQL执行后，数据需要3-5分钟才会进入目标表中，可能影响业务流程
            </n-tooltip>
          </n-form-item-gi>

          <n-form-item-gi :span="12" label="自定义SQL" path="sql" :label-style="{userSelect:'none'}">
            <n-input type="textarea" v-model:value="jobUpdateModalFormModel.sql"
                     @keydown.enter.prevent
                     placeholder="只可用于执行 DML 、 DDL"
            />
          </n-form-item-gi>
        </n-grid>

      </n-form>
    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="handleJobUpdate" :loading="isJobNodeUpdating">保存
      </n-button>
      <n-button :size="'small'" @click="showJobUpdateModelRef = !showJobUpdateModelRef">返回</n-button>
    </template>
  </n-modal>

  <n-drawer
      v-model:show="showDrawerRef"
      :width="220"
  >
    <n-drawer-content title="日志" :native-scrollbar="false" closable>
      <n-spin :size="14" :show="loading">
        <n-timeline v-if="!isEmpty(logItemsRef)">
          <n-timeline-item v-for="item in logItemsRef"
                           :type="item.type"
                           :time="item.time"
          >
            <template #icon>
              <template v-if="item.type==='success'">
                <n-icon :size="18">
                  <CheckmarkCircle24Regular/>
                </n-icon>
              </template>
              <template v-if="item.type==='error'">
                <n-icon :size="18">
                  <DismissCircle24Regular/>
                </n-icon>
              </template>
            </template>
            <template #header>
              <n-space justify="space-between">
                {{ item.title }}
                <n-button :size="'tiny'"
                          class="transition"
                          :class="item.show?'rotate-180':'rotate-0'"
                          @click="item.show=!item.show"
                          text
                >
                  <n-icon :size="18">
                    <ChevronUp24Regular/>
                  </n-icon>
                </n-button>
              </n-space>
            </template>
            <template #default>
              <n-space>
                <p v-if="item.type==='error'" class="m-0" style="font-size: 12px" v-html="item.msg"/>
                <n-collapse-transition :show="item.show">
                  <n-timeline>
                    <n-timeline-item v-for="item in item.content"
                                     :type="item.type"
                                     :time="item.time"
                                     :title="item.title"
                                     :content="item.content"
                    >
                      <template #icon>
                        <template v-if="item.type==='success'">
                          <n-icon :size="18">
                            <CheckmarkCircle24Regular/>
                          </n-icon>
                        </template>
                        <template v-if="item.type==='error'">
                          <n-icon :size="18">
                            <DismissCircle24Regular/>
                          </n-icon>
                        </template>
                      </template>
                      <template #default>
                        <p class="m-0" style="font-size: 12px" v-html="item.content"/>
                      </template>
                    </n-timeline-item>
                  </n-timeline>
                </n-collapse-transition>
              </n-space>
            </template>
          </n-timeline-item>
        </n-timeline>
        <n-empty v-else description="无运行日志"/>
        <n-space v-if="showTipRef" class="mt-4" style="color: #999999" justify="center">仅显示前100条</n-space>
      </n-spin>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import G6, {Graph, Algorithm} from "@antv/g6";
import {INode} from "@antv/g6-core/lib/interface/item";
import {GraphData, Item} from "@antv/g6-core/lib/types";
import {DCJob, Task} from "@common/taskSchedulerTypes";
import {SchedJobType, WorkflowType} from "@common/types";
import {clipboard_write_text} from "@render/api/app.api";
import {channels} from "@render/api/channels";
import {
  get_all_datasource,
  get_sched_job_by_id,
  get_sched_job_page,
  get_workflow,
  get_workflow_page
} from "@render/api/datacenter.api";
import {
  find_job_by_id,
  get_scheduler,
  get_task,
  save_task,
  task_delete,
  task_enable,
  task_interrupt,
  task_run
} from "@render/api/taskScheduler.api";
import {customNode, SchedulerJobNodeConfig, schedulerTaskNode} from "@render/graph/customNodes";
import {useIpc} from "@render/plugins";
import {isCronExpressionValid} from "@render/utils/common/cronUtils";
import {formatDate} from "@render/utils/common/dateUtils";
import {getSchedJob, showButton, showConfirmation} from "@render/utils/datacenter/jobTabUtil";
import NodeItem from "@render/views/taskScheduler/nodeItem.vue";
import {QuestionCircleTwotone} from "@vicons/antd";
import {CheckmarkCircle24Regular, ChevronUp24Regular, DismissCircle24Regular} from "@vicons/fluent";
import {Add, Refresh, Search} from "@vicons/ionicons5";
import {VNode} from "@vue/runtime-core";
import {CronJob} from "cron";
import {isEmpty} from "lodash-es";
import {DateTime} from "luxon";
import {
  DataTableColumns,
  FormInst,
  FormItemRule,
  NButton,
  NIcon,
  NSpace,
  NTag,
  SelectGroupOption,
  SelectOption
} from "naive-ui";
import {ref, h, onMounted, reactive} from "vue";
import {uuid} from "vue3-uuid";

const queryParam = ref('')

const ipc = useIpc()

ipc.on(channels.taskScheduler.sendTaskExecEnd, () => {
  tableDataInit(queryParam.value)
})

// region 表格
const tableDataRef = ref<Task[]>([])
const isTableLoading = ref(false)

onMounted(() => {
  tableDataInit(queryParam.value)
})

const tableDataInit = async (v: string) => {
  isTableLoading.value = true

  tableDataRef.value = (await get_scheduler()).tasks.filter(task => task.taskName.includes(v || ''))

  isTableLoading.value = false
}

const createColumns = (): DataTableColumns<Task> => {
  return [
    {
      title: '任务名称',
      key: 'taskName',
      width: '12%'
    },
    {
      title: '任务状态',
      key: 'isEnable',
      width: '6%',
      align: 'center',
      render(row) {
        return setTaskStatus(row)
      }
    },
    {
      title: 'cron表达式',
      key: 'cron',
      width: '8%',
    },
    {
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '12%',
      render(row) {
        const cronJob = new CronJob(row.cron, () => {
        })
        return formatDate(cronJob.nextDate().toJSDate())
      }
    },

    {
      title: '上次执行结束时间',
      key: 'lastEndTime',
      width: '12%',
      render(row) {
        return row.lastEndTime || '--'
      }
    },
    {
      title: '执行结果',
      key: 'lastExecResult',
      width: '6%',
      render(row) {
        return row.lastExecResult || '--'
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: '20%',
      align: 'center',
      fixed: 'right',
      render(row) {
        let children: VNode[] = []

        if (row.isRunning) {
          children.push(showConfirmation('停止运行', () => taskInterrupt(row)))
          children.push(showButton('配置', () => taskConfigModalInit(row)))
          children.push(showButton('日志', () => showTaskLog(row.id)))
        } else if (row.isEnable) {
          children.push(showConfirmation('执行', () => taskRun(row)))
          children.push(showButton('停用', () => taskEnable(row.id, false)))
          children.push(showConfirmation('删除', () => taskDelete(row.id)))
          children.push(showButton('配置', () => taskConfigModalInit(row)))
          children.push(showButton('日志', () => showTaskLog(row.id)))
        } else {
          children.push(showButton('启用', () => taskEnable(row.id, true)))
          children.push(showConfirmation('删除', () => taskDelete(row.id)))
          children.push(showButton('配置', () => taskConfigModalInit(row)))
          children.push(showButton('日志', () => showTaskLog(row.id)))
        }

        return h(NSpace, {
          justify: 'center'
        }, children)
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
  onChange: (page: number) => {
    paginationReactive.page = page
    tableDataInit(queryParam.value)
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    tableDataInit(queryParam.value)
  }
})

const setTaskStatus = (task: Task) => {
  if (task.isRunning) {
    return h(NTag, {
          size: 'small',
          bordered: false,
          type: 'success'
        },
        {default: () => '运行中'})
  } else if (task.isEnable) {
    return h(NTag, {
          size: 'small',
          bordered: false,
          type: 'info'
        },
        {default: () => '启用'})
  } else {
    return h(NTag, {
          size: 'small',
          bordered: false,
          type: 'default'
        },
        {default: () => '停用'})
  }
}

// 任务删除
const taskDelete = (id: string) => {
  task_delete(id).then(res => {
    if (res.success) {
      window.$message.success(res.message)
      tableDataInit(queryParam.value)
    } else {
      window.$message.error(res.message)
    }
  })
}

// 任务启/停用
const taskEnable = (taskId: string, enable: boolean) => {
  task_enable(taskId, enable).then(res => {
    if (res.success) {
      window.$message.success(res.message)
      tableDataInit(queryParam.value)
    } else {
      window.$message.error(res.message)
    }
  })
}

// 任务中断
const taskInterrupt = (task: Task) => {
  task_interrupt(task).then(res => {
    if (res.success) {
      window.$message.success(res.message)
      tableDataInit(queryParam.value)
    } else {
      window.$message.error(res.message)
    }
  })
}

// 任务强制执行
const taskRun = (task: Task) => {
  task_run(task).then(res => {
    if (res.success) {
      window.$message.success(res.message)
      tableDataInit(queryParam.value)
    } else {
      window.$message.error(res.message)
    }
  })
}

// endregion

// region 任务配置弹窗
const showAddTaskModalRef = ref(false)
const modalTitle = ref('')

const taskConfigModalFormRef = ref<FormInst | null>(null);

const taskConfigModalFormModel = ref<Task>({
  id: null,
  taskName: null,
  cron: null,
  lastStartTime: null,
  lastEndTime: null,
  lastExecResult: null,
  execLog: [],
  isEnable: true,
  isRunning: false,
  jobList: [],
  graphSave: null
})

const taskConfigModalFormRules = ref({
  taskName: {
    required: true,
    trigger: ['input'],
    message: '请输入任务名称'
  },
  cron: {
    required: true,
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error('表达式不能为空')
      } else if (!isCronExpressionValid(value)) {
        return new Error('表达式不合规')
      }
      return true
    },
    trigger: ['input']
  }
})

const taskConfigModalInit = async (task: Task) => {
  if (task != undefined) {
    modalTitle.value = '任务配置'
    //  task = await get_task(task.id)
    Object.assign(taskConfigModalFormModel.value, task)
    handleCronTimePredictionUpdate(task.cron)
  } else {
    modalTitle.value = '新增任务'
    taskConfigModalFormModel.value = {
      id: uuid.v4(),
      taskName: null,
      cron: null,
      lastStartTime: null,
      lastEndTime: null,
      lastExecResult: null,
      execLog: [],
      isEnable: true,
      isRunning: false,
      jobList: [],
      graphSave: null
    }
  }

  showAddTaskModalRef.value = true
}

const handleModalHidden = () => {

  if (!graph.destroyed) {
    graph.destroy()
  }

  showAddTaskModalRef.value = false
}

const handleModelCronUpdate = (value: string) => {
  if (isCronExpressionValid(value)) {
    handleCronTimePredictionUpdate(value)
  } else {
    cronTimePrediction.value = '表达式不合规'
  }
}

const cronTimePrediction = ref('')

const handleCronTimePredictionUpdate = (cronExp: string) => {
  cronTimePrediction.value = ''
  const cronJob = new CronJob(cronExp, () => {
  })
  const nextTimes = cronJob.nextDates(10) as DateTime[]
  nextTimes.forEach(datetime => {
    cronTimePrediction.value += `${formatDate(datetime.toJSDate())}<br>`
  })
}

// region 任务工作流画布

const jobGraphInit = async () => {
  // 1.画布初始化
  graphInit()

  // 2.自定义节点注册
  nodeRegister();

  // 3.加载数据
  await loadGraphData()

  // 4.注册画布事件
  graphEventRegister()

  // 5.画布渲染
  graph.render();

  // 监听窗口变化
  if (typeof window !== 'undefined') {
    window.onresize = () => {
      if (!graph || graph.get('destroyed')) return;
      if (!g6Container.value || !g6Container.value.scrollWidth || !g6Container.value.clientHeight) return;
      graph.changeSize(g6Container.value.scrollWidth, g6Container.value.clientHeight - 5);
    };
  }
}

const g6Container = ref(null);
let graph: Graph = null;

let sourceAnchorIdx: any, targetAnchorIdx: any;
let sourceNodeId: string

const graphInit = () => {

  const toolbar = new G6.ToolBar({
    position: {
      x: 10,
      y: 10
    }
  });

  const contextMenu = new G6.Menu({
    getContent(evt) {
      if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
        return `
       <div>
         <div code="fitView" class="menuItem">页面自适应</div>
       <div code="fitCenter" class="menuItem">居中</span></div>
       <div code="layout" class="menuItem">重新布局</div>
       </div>
     `
      } else if (evt.item.getType() == 'node') {
        return `
       <div>
       <div code="edit" class="menuItem">编辑</div>
       <div code="copyJobName" class="menuItem">复制任务名</div>
       <div code="delete" class="menuItem">删除</div>
       </div>
     `
      } else if (evt.item.getType() == 'edge') {
        return `
       <div>
       <div code="delete" class="menuItem">删除</div>
       </div>
     `
      }
    },
    handleMenuClick: (target: HTMLElement, item: Item) => {
      switch (target.getAttribute('code')) {
        case 'edit':
          if (item.getType() == 'node') {
            jobUpdateModelInit(item)
          }
          break
        case 'delete':
          graph.remove(item)
          break
        case 'fitView':
          graph.fitView(10)
          break
        case 'fitCenter':
          graph.fitCenter(false)
          break
        case 'layout':
          graph.layout()
          break
        case 'copyJobName':
          clipboard_write_text(item.getModel().jobName as string || '').then(() => {
            window.$message.success('复制成功')
          })
          break
      }
    },
    offsetX: 0,
    offsetY: 0,
    itemTypes: ['node', 'edge', 'canvas'],
  });

  graph = new G6.Graph({
    container: 'g6Container',
    width: g6Container.value.scrollWidth,
    height: g6Container.value.scrollHeight - 5,
    fitView: true,
    fitViewPadding: 10,
    maxZoom: 1,
    minZoom: 0.6,
    modes: {
      default: [
        'drag-canvas',
        'zoom-canvas',
        'click-select',
        // 配置拖动节点的 shouldBegin 以避免在锚点圆上拖动时节点移动
        {
          type: 'drag-node',
          shouldBegin: e => {
            return e.target.get('name') !== 'anchor-point';
          }
        },
        {
          type: 'create-edge',
          trigger: 'drag',
          shouldBegin: e => {
            // 避免从节点上的其他形状开始
            if (e.target && e.target.get('name') !== 'anchor-point') return false;
            //一个锚点只能连一条边
            // if (e.target && e.target.get('name') == 'anchor-point' && e.target.get('links') > 0) return false;

            sourceAnchorIdx = e.target.get('anchorPointIdx');
            sourceNodeId = e.item.getModel().id
            e.target.set('links', e.target.get('links') + 1); // 缓存连接到该锚点圆的边数
            return true;
          },
          shouldEnd: e => {
            // 避免以节点上的其他形状结束
            if (e.target && e.target.get('name') !== 'anchor-point') return false;
            //一个锚点只能连一条边
            if (e.target && e.target.get('name') == 'anchor-point' && e.target.get('links') > 0) return false;
            // 锚点不可连接到自身
            if (e.item.getModel().id == sourceNodeId) {
              window.$message.warning("节点不可连接到自身")
              return false;
            }

            const node = e.item as INode
            // 一个节点只能有一条入边
            if (node.getInEdges().length > 0) {
              window.$message.warning("节点只能有一条入边")
              return false;
            }

            if (e.target) {
              targetAnchorIdx = e.target.get('anchorPointIdx');
              e.target.set('links', e.target.get('links') + 1);  // 缓存连接到该锚点圆的边数
              return true;
            }
            targetAnchorIdx = undefined;
            return true;
          },
        }
      ]
    },
    defaultNode: {
      type: customNode.schedulerTaskNode,
    },
    defaultEdge: {
      type: 'polyline',
      style: {
        radius: 10,
        offset: 36,
        lineWidth: 2,

        endArrow: {
          // 自定义箭头指向(0, 0)，尾部朝向 x 轴正方向的 path
          path: 'M 14,7 L 0,0 L  14,-7 Z',
          fill: '#72c4fa',
          stroke: '#72c4fa',
          opacity: 0.8,
        },
        stroke: '#72c4fa',
      },
    },
    plugins: [toolbar, contextMenu],
    // 设置为true，启用 redo & undo 栈功能
    enabledStack: true,
    layout: {
      type: 'dagre',
      rankdir: 'LR',
      nodesep: 25, //同层级间节点间距
      ranksep: 80, //层级间间距
    },
    edgeStateStyles: {
      active: {
        lineWidth: 3,
        stroke: '#32a7fa',
        endArrow: {
          // 自定义箭头指向(0, 0)，尾部朝向 x 轴正方向的 path
          path: 'M 0,0 L 14,7 L 14,-7 Z',
          // 箭头的偏移量，负值代表向 x 轴正方向移动
          // d: -10,
          fill: '#32a7fa',
          stroke: '#32a7fa',
          opacity: 0.8,
        },
      }
    },
  })
}

const nodeRegister = () => {
  G6.registerNode(schedulerTaskNode.shapeType, schedulerTaskNode.nodeDefinition, schedulerTaskNode.extendShapeType)
}

const loadGraphData = async () => {
  const task = await get_task(taskConfigModalFormModel.value.id)

  const updateNodesJobStatus = async (nodes: SchedulerJobNodeConfig[]) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].jobType == 'dataX') {
        let schedJob: SchedJobType = (await get_sched_job_by_id(nodes[i].jobId)).data
        schedJob = await getSchedJob(schedJob.jobContent)

        nodes[i].jobName = schedJob.jobContent

        if (schedJob.handleStatus == 500) {
          nodes[i].jobStatus = 4
        } else if (schedJob.handleStatus == 0) {
          nodes[i].jobStatus = 3
        } else if (schedJob.triggerStatus == 1) {
          nodes[i].jobStatus = 2
        } else if (schedJob.triggerStatus == 0) {
          nodes[i].jobStatus = 1
        }

      } else if (nodes[i].jobType == 'workflow') {
        const workflow: WorkflowType = (await get_workflow(nodes[i].jobId)).data

        nodes[i].jobName = workflow.procName

        if (workflow.status == '2') {
          nodes[i].jobStatus = 1
        } else if (workflow.status == '1') {
          nodes[i].jobStatus = 2
        } else if (workflow.status == '4') {
          nodes[i].jobStatus = 3 //任务运行中
        } else if (workflow.status == '3') {
          nodes[i].jobStatus = 4 //任务异常
        } else if (workflow.status == '5') {
          nodes[i].jobStatus = 5 //任务异常
        }
      } else if (nodes[i].jobType == 'sparkSql' || nodes[i].jobType == 'mysql') {
        const dcJob = await find_job_by_id(nodes[i].id, task.id);
        nodes[i].sqlConfig = dcJob.sqlConfig
      }
    }

    return nodes
  }

  if (task != null && task.graphSave != null) {
    const graphSave = JSON.parse(task.graphSave) as GraphData

    graphSave.nodes = await updateNodesJobStatus(graphSave.nodes as SchedulerJobNodeConfig[])

    graph.data(graphSave)
  }

}

const graphEventRegister = () => {
  graph.on('node:dblclick', (e) => {
    const {item} = e
    jobUpdateModelInit(item)
  });

  graph.on('aftercreateedge', (e: any) => {
    // 更新新添加的边的 sourceAnchor 和 targetAnchor
    graph.updateItem(e.edge, {
      sourceAnchor: sourceAnchorIdx,
      targetAnchor: targetAnchorIdx
    })
  });

  // 从第一个节点拖动后，创建边缘，更新sourceAnchor
  graph.on('afteradditem', e => {
    if (e.item && e.item.getType() === 'edge') {
      graph.updateItem(e.item, {
        sourceAnchor: sourceAnchorIdx
      });
    }
  })

  // 如果创建边缘在结束之前被取消，则更新锚点圆圈上的“链接”
  graph.on('afterremoveitem', (e: any) => {
    if (e.item && e.item.source && e.item.target) {
      const sourceNode = graph.findById(e.item.source);
      const targetNode = graph.findById(e.item.target);
      const {
        sourceAnchor,
        targetAnchor
      } = e.item;
      if (sourceNode && !isNaN(sourceAnchor)) {
        const sourceAnchorShape = sourceNode.getContainer().find(ele => (ele.get('name') === 'anchor-point' && ele.get('anchorPointIdx') === sourceAnchor));
        sourceAnchorShape.set('links', sourceAnchorShape.get('links') - 1);
      }
      if (targetNode && !isNaN(targetAnchor)) {
        const targetAnchorShape = targetNode.getContainer().find(ele => (ele.get('name') === 'anchor-point' && ele.get('anchorPointIdx') === targetAnchor));
        targetAnchorShape.set('links', targetAnchorShape.get('links') - 1);
      }
    }
  })

  // some listeners to control the state of nodes to show and hide anchor-point circles
  graph.on('node:mouseenter', e => {
    graph.setItemState(e.item, 'showAnchors', true);
  })
  graph.on('node:mouseleave', e => {
    graph.setItemState(e.item, 'showAnchors', false);
  })

  graph.on('node:dragenter', e => {
    graph.setItemState(e.item, 'showAnchors', true);
  })
  graph.on('node:dragleave', e => {
    graph.setItemState(e.item, 'showAnchors', false);
  })

  graph.on('node:dragstart', e => {
    graph.setItemState(e.item, 'showAnchors', true);
  })
  graph.on('node:dragout', e => {
    graph.setItemState(e.item, 'showAnchors', false);
  })

  graph.on('node:click', e => {
    const name = e.target.get("name");
    if (name === "jobName") {
      clipboard_write_text(e.item.getModel().jobName as string || '').then(() => {
        window.$message.success('复制成功')
      })
    }
  })

  graph.on('edge:mouseenter', e => {
    graph.setItemState(e.item, 'active', true);
  })
  graph.on('edge:mouseleave', e => {
    graph.setItemState(e.item, 'active', false);
  })

}

const jobIdOptionsLoading = ref(false)

const handleJobIdOptionsUpdate = async (v: string) => {
  jobIdOptionsLoading.value = true
  if (jobUpdateModalFormModel.value.jobType == 'DataX任务') {
    const records: SchedJobType[] = (await get_sched_job_page({
      current: 1,
      size: 100,
      jobContent: v || ''
    })).data?.records || []

    jobIdOptions.value = records.map(v => ({
      label: v.jobContent,
      value: v.id.toString()
    }))
  } else if (jobUpdateModalFormModel.value.jobType == '工作流任务') {
    const records: WorkflowType[] = (await get_workflow_page({
      page: 1,
      size: 100,
      procName: v || ''
    })).data?.records || []

    jobIdOptions.value = records.map(v => ({
      label: v.procName,
      value: v.id.toString()
    }))
  }

  jobIdOptionsLoading.value = false
}

const handleJobIdUpdate = async (id: string) => {
  if (id != null) {
    if (jobUpdateModalFormModel.value.jobType == 'DataX任务') {
      let schedJob: SchedJobType = (await get_sched_job_by_id(id)).data
      schedJob = await getSchedJob(schedJob.jobContent)

      jobUpdateModalFormModel.value.jobName = schedJob.jobContent

      if (schedJob.handleStatus == 500) {
        jobUpdateModalFormModel.value.jobStatus = 4
      } else if (schedJob.handleStatus == 0) {
        jobUpdateModalFormModel.value.jobStatus = 3
      } else if (schedJob.triggerStatus == 1) {
        jobUpdateModalFormModel.value.jobStatus = 2
      } else if (schedJob.triggerStatus == 0) {
        jobUpdateModalFormModel.value.jobStatus = 1
      }

    } else if (jobUpdateModalFormModel.value.jobType == '工作流任务') {
      const workflow: WorkflowType = (await get_workflow(id)).data

      jobUpdateModalFormModel.value.jobName = workflow.procName

      if (workflow.status == '2') {
        jobUpdateModalFormModel.value.jobStatus = 1
      } else if (workflow.status == '1') {
        jobUpdateModalFormModel.value.jobStatus = 2
      } else if (workflow.status == '4') {
        jobUpdateModalFormModel.value.jobStatus = 3 //任务运行中
      } else if (workflow.status == '3') {
        jobUpdateModalFormModel.value.jobStatus = 4 //任务异常
      } else if (workflow.status == '5') {
        jobUpdateModalFormModel.value.jobStatus = 5 //任务异常
      }

    }

  } else {
    jobUpdateModalFormModel.value.jobName = null
    jobUpdateModalFormModel.value.jobStatus = null
  }

}

const jobIdOptions = ref<Array<SelectOption | SelectGroupOption>>()

const showJobUpdateModelRef = ref(false)
const jobUpdateModalFormRef = ref<FormInst | null>(null);
const datasourceOptions = ref<Array<SelectOption | SelectGroupOption>>()
const jobUpdateModalFormModel = ref({
  item: null as Item,
  jobType: '',
  jobId: null,
  jobName: '',
  jobStatus: null,
  sql: '',
  dbType: '',
  dbId: '',
  timeout: 5 * 60
})
const jobUpdateModalFormRules = ref({
  jobName: {
    required: true,
    trigger: ['input'],
    message: '请输入任务名称'
  },
  sql: {
    required: true,
    trigger: ['input'],
    message: '请输入SQL'
  },
  dbId: {
    required: true,
    trigger: ['change'],
    message: '请选择数据源'
  },
  timeout: {
    type: 'number',
    required: true,
    trigger: ['change'],
    message: '请输入等待时间'
  },
})

const jobUpdateModelInit = (item: Item) => {
  jobUpdateModalFormModel.value.item = item
  const model = item.getModel() as SchedulerJobNodeConfig

  jobUpdateModalFormModel.value.jobType = model.title
  jobUpdateModalFormModel.value.jobId = model.jobId
  jobUpdateModalFormModel.value.jobStatus = model.jobStatus
  jobUpdateModalFormModel.value.jobName = model.jobName

  if (['sparkSql', 'mysql'].includes((model.jobType))) {
    jobUpdateModalFormModel.value.sql = model?.sqlConfig?.sql || ''
    jobUpdateModalFormModel.value.dbType = model.jobType == 'sparkSql' ? 'tbds-hive' : 'mysql'
    jobUpdateModalFormModel.value.dbId = model?.sqlConfig?.dbId || ''
    jobUpdateModalFormModel.value.timeout = model?.sqlConfig.timeout == undefined ? 300 : model?.sqlConfig.timeout

    handleDatasourceOptionsUpdate(jobUpdateModalFormModel.value.dbType)
  } else {
    handleJobIdOptionsUpdate(model.jobName)
  }

  showJobUpdateModelRef.value = true
}

const handleDatasourceOptionsUpdate = async (dbType: string) => {
  const datasource = await get_all_datasource(dbType)

  datasourceOptions.value = datasource.map((db: { datasourceName: string; id: number; }) => ({
    label: db.datasourceName,
    value: db.id.toString()
  }))
}

const isJobNodeUpdating = ref(false)
const handleJobUpdate = () => {
  isJobNodeUpdating.value = true

  jobUpdateModalFormRef.value?.validate(errors => {
    if (!errors) {
      jobUpdateModalFormModel.value.item.update({
        ...jobUpdateModalFormModel.value.item.getModel(),
        jobId: jobUpdateModalFormModel.value.jobId,
        jobName: jobUpdateModalFormModel.value.jobName,
        jobStatus: jobUpdateModalFormModel.value.jobStatus,
        sqlConfig: {
          dbType: jobUpdateModalFormModel.value.dbType,
          dbId: jobUpdateModalFormModel.value.dbId,
          sql: jobUpdateModalFormModel.value.sql,
          timeout: jobUpdateModalFormModel.value.timeout,
          isRunning: false
        }
      })

      jobUpdateModalFormModel.value.item.draw()

      showJobUpdateModelRef.value = false
    }

  })

  isJobNodeUpdating.value = false

}

const nodeItemList = [
  {
    label: "DataX任务",
    type: "dataX"
  },
  {
    label: "工作流任务",
    type: "workflow"
  },
  {
    label: "SparkSQL任务",
    type: "sparkSql"
  },
  {
    label: "MySQL任务",
    type: "mysql"
  }
]

const handleDragEnd = (e: {
  x: number;
  y: number;
}, item: {
  label: string;
  type: string;
}) => {
  const renderPoints = graph.getPointByClient(e.x, e.y); //渲染
  const canvasPoints = graph.getCanvasByPoint(renderPoints.x, renderPoints.y) // 画布
  if (canvasPoints.x > 0 && canvasPoints.y > 0 && canvasPoints.x < graph.getWidth() && canvasPoints.y < graph.getHeight()) {
    const id = `node-${uuid.v4()}`
    graph.addItem('node', {
      x: renderPoints.x - 200 / 2,
      y: renderPoints.y - 60 / 2,
      id: id,
      title: item.label,
      jobType: item.type,
      jobName: null,
      jobStatus: ['sparkSql', 'mysql'].includes(item.type) ? 2 : null,
      jobId: ['sparkSql', 'mysql'].includes(item.type) ? id : null,
    });
  }
}
// endregion

const isSaving = ref(false)

// 更新任务
const handleSave = () => {
  taskConfigModalFormRef.value?.validate(errors => {
    if (!errors) {
      isSaving.value = true
      const nodes = graph.save().nodes as SchedulerJobNodeConfig[]

      if (checkNodes(nodes)) {
        // 找头节点
        const headNodes = graph.findAll('node', (item: INode) => item.getInEdges().length == 0)

        const task: Task = {
          ...taskConfigModalFormModel.value,
          jobList: generateJobHierarchy(headNodes),
          graphSave: JSON.stringify(graph.save())
        }

        save_task(task).then(res => {
          if (res.success) {
            window.$message.success(res.message)
            tableDataInit(queryParam.value)
            showAddTaskModalRef.value = false
          } else {
            window.$message.error(res.message)
          }
        }).finally(() => isSaving.value = false)
      } else {
        isSaving.value = false
      }
    }
  })
}

// 检查节点连接是否合规
const checkNodes = (nodes: SchedulerJobNodeConfig[]) => {
  if (nodes.length == 0) {
    window.$message.error('任务节点不存在!')
    return false
  }

  if (nodes.some(node => node.jobId == null || node.jobName == null)) {
    window.$message.error('节点未配置!')
    return false
  }

  // @ts-ignore
  const {detectDirectedCycle} = Algorithm;
  // 此时图中没有环，result 为 null
  if (detectDirectedCycle(graph.save()) != null) {
    window.$message.error('图中存在循环依赖!')
    return false
  }

  return true
}

// 将节点于边的关系转为任务依赖
const generateJobHierarchy = (headNodes: INode[]) => {

  let jobs: DCJob[] = []

  for (let i = 0; i < headNodes.length; i++) {
    const model = headNodes[i].getModel() as SchedulerJobNodeConfig
    const outEdges = headNodes[i].getOutEdges()
    const targetNodes = outEdges.map(edge => edge.getTarget()) as INode[]

    let job: DCJob = {
      id: model.jobId,
      jobType: model.jobType,
      name: model.jobName,
      dependentJobs: generateJobHierarchy(targetNodes)
    }

    if (['sparkSql', 'mysql'].includes((model.jobType))) {
      job.sqlConfig = model.sqlConfig
    }

    jobs.push(job)
  }

  return jobs
}

// endregion

// region 日志
const showDrawerRef = ref(false)
const loading = ref(false)
const logItemsRef = ref([])
const showTipRef = ref(false)

const showTaskLog = async (taskId: string) => {

  showDrawerRef.value = true

  const task: Task = await get_task(taskId)
  if (task != null) {
    // 反转
    const execLog = task.execLog.reverse()

    logItemsRef.value = []

    execLog.forEach(log => {
      let type: "default" | "error" | "info" | "success" | "warning"
      let title: string
      let taskContent = []
      let time: string

      if (log.status == 0) {
        title = '运行中'
        type = 'info'
      } else if (log.status == 1) {
        title = '执行成功'
        type = 'success'
      } else if (log.status == 2) {
        title = '执行失败'
        type = 'error'
      } else {
        title = '未知状态'
        type = 'warning'
      }

      time = log.startTime

      // job日志
      const jobLog = log.jobLog.reverse()
      jobLog.forEach(jobLog => {
        let type: "default" | "error" | "info" | "success" | "warning"
        let title: string
        let content: string
        let time: string

        if (jobLog.status == 0) {
          type = 'info'
        } else if (jobLog.status == 1) {
          type = 'success'
        } else if (jobLog.status == 2) {
          type = 'error'
        } else {
          type = 'warning'
        }

        time = jobLog.startTime
        title = jobLog.jobName
        content = `
        执行结果：<br>${jobLog.msg || ''}<br>
        结束时间：<br>${jobLog.endTime || ''}<br>
        任务耗时：${calculateDuration(jobLog.startTime, jobLog.endTime)}<br>
        `

        taskContent.push({
          type: type,
          title: title,
          content: content,
          time: time
        })
      })

      logItemsRef.value.push({
        type: type,
        title: title,
        content: taskContent,
        time: time,
        msg: log.msg,
        show: false
      })
    })

    showTipRef.value = execLog.length >= 100;

  } else {

  }
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationInSeconds = Math.abs(end.getTime() - start.getTime()) / 1000;

  if (durationInSeconds < 1) {
    return "0秒";
  } else if (durationInSeconds < 60) {
    return durationInSeconds.toFixed(0) + "秒";
  } else {
    const durationInMinutes = durationInSeconds / 60;
    return durationInMinutes.toFixed(2) + "分钟";
  }
}

//endregion
</script>

<style>
.menuItem {
  width: 100px;
  height: 20px;
  line-height: 20px;
  font-family: 'Microsoft PhagsPa';
  justify-items: center;
  align-content: center;
  cursor: pointer;
  border-radius: 3px;
  padding: 4px;
}

.menuItem:hover {
  background-color: #f3f3f3;
}
</style>

<style scoped>
:deep( #taskNodeGraph .n-form-item-feedback-wrapper) {
  display: none;
  background-color: #545454;
}
</style>
