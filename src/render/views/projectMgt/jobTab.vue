<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <div class="float-left leading-8 font-bold text-base">
          <n-skeleton v-if="isTableLoading" :width="360" size="small"/>
          <span v-else>{{ title }}</span>
        </div>
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
      >
        <template #empty>
          <span style="color: rgba(194, 194, 194, 1)">未选择项目对应表</span>
        </template>
      </n-data-table>
    </n-scrollbar>
  </n-layout>

  <n-modal
      v-model:show="showModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="modalTitle"
      :size="'small'"
  >

    <n-form
        v-if="formSelect.addSchedJob"
        class="mt-4"
        ref="addSchedJobModalFormRef"
        :model="addSchedJobModalFormModel"
        :rules="addSchedJobModalFormRules"
        :size="'small'"
    >
      <n-grid :cols="14" :x-gap="4">
        <n-form-item-gi :span="7" label="调度任务名" path="jobContent">
          <n-input
              v-model:value="addSchedJobModalFormModel.jobContent"
              placeholder=""
              readonly
              @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="7" label="项目名" path="projectName">
          <n-input
              v-model:value="addSchedJobModalFormModel.projectName"
              placeholder=""
              readonly
              @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="7" label="是否重试" path="retry">
          <n-radio-group v-model:value="addSchedJobModalFormModel.retry">
            <n-radio-button
                :key="1"
                :value="'1'"
                label="是"
            />
            <n-radio-button
                :key="0"
                :value="'0'"
                label="否"
            />
          </n-radio-group>
        </n-form-item-gi>
        <n-form-item-gi :span="7" label="重试次数" path="executorFailRetryCount">
          <n-input-number v-model:value="addSchedJobModalFormModel.executorFailRetryCount" button-placement="both"/>
        </n-form-item-gi>

        <n-form-item-gi :span="2" label="秒" path="sec" :label-style="{margin:'0 auto'}">
          <n-input class="text-center"
                   v-model:value="addSchedJobModalFormModel.sec"
                   placeholder=""
                   @keydown.enter.prevent
                   readonly
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="分" path="min" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.min" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="时" path="hour" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.hour" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="日" path="day" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.day" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="月" path="month" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.month" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="周" path="week" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.week" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="年" path="year" :label-style="{margin:'0 auto'}">
          <n-input class="text-center" v-model:value="addSchedJobModalFormModel.year" placeholder=""
                   @keydown.enter.prevent
          />
        </n-form-item-gi>
      </n-grid>

    </n-form>

    <template #action>
      <n-button type="primary" :size="'small'" @click="onPositiveClick" :loading="isSaving">保存</n-button>
      <n-button :size="'small'" @click="onNegativeClick">返回</n-button>
    </template>
  </n-modal>

</template>

<script setup lang="ts">
import {find_by_project_id, get_project_by_pro_abbr, get_table_sql} from "@render/api/auxiliaryDb";
import {create_cron_job} from "@render/api/cron";
import {
  add_sched_task,
  cj_job_delete,
  cj_job_run,
  cj_job_start,
  cj_job_stop,
  get_cj_job_page,
  get_sched_job_page, get_valid_config_page,
  get_workflow_page,
  sched_job_delete,
  workflow_active,
  workflow_delete,
  workflow_run
} from "@render/api/datacenter";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {formatDate} from "@render/utils/common/formatDate";
import {Refresh} from '@vicons/ionicons5'
import {parseExpression} from 'cron-parser';
import {isEmpty} from "lodash-es";
import {
  DataTableColumns,
  FormInst,
  NButton,
  NPopconfirm,
  NSpace,
  NTag,
  useMessage,
  useNotification,
  useDialog
} from "naive-ui";
import {computed, h, onMounted, reactive, ref, watch} from "vue";
import {uuid} from "vue3-uuid";

const message = useMessage()
const notification = useNotification()
const dialog = useDialog()

const projectTree = useProjectTreeStore()

// 创建计算属性来获取 Pinia 存储中的值
const defaultSelectedKeys = computed(() => projectTree.defaultSelectedKeys)

watch(defaultSelectedKeys, (newValue) => {
  if (newValue[0] != null) {
    const segments = newValue[0].split('-');
    const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
    if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
      queryParam.value.projectId = segments[segments.length - 2]
      queryParam.value.tableAbbr = segments[segments.length - 1]

      tableDataInit()
    }
  }
})

// region 数据表

const queryParam = ref({
  projectId: null,
  tableAbbr: null
})

const title = ref('')

const allSchedJobInfoRef = ref([])
const getAllSchedJobInfo = async (param?: string) => {
  allSchedJobInfoRef.value = (await get_sched_job_page(1, 10000, param || '')).data.records
}

onMounted(() => {
  const segments = useProjectTreeStore().defaultSelectedKeys[0].split('-');
  const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
  if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
    queryParam.value.projectId = segments[segments.length - 2]
    queryParam.value.tableAbbr = segments[segments.length - 1]

    tableDataInit()
  }
})

type Job = {
  id: string
  type: string
  jobName: string
  // 0:采集任务未配置；1:任务停用；2:任务启用；3:任务运行中；4:任务异常；5:任务未反馈
  status: number,
  // 1:依赖调度；2:定时调度
  schedMode: number,
  cron: string,
  nextExecTime: string

  createBy: string

  code?: string
}

const tableDataRef = ref([])

const isTableLoading = ref(false)

const setTitle = async (project: any) => {
  const tableComment = (await get_table_sql({
    tableName: queryParam.value.tableAbbr.toString().toUpperCase()
  }))[0]?.comment || '未知信息'

  const projectName = project.projectName.replaceAll('行政行为', '')

  const index = projectName.indexOf('数据归集')

  title.value = projectName.slice(0, index) + '-' + tableComment + '-' + projectName.slice(index)
}

const tableDataInit = async () => {
  isTableLoading.value = true

  let jobs = []

  const project = (await find_by_project_id(queryParam.value.projectId))

  await getAllSchedJobInfo(project.projectAbbr)

  setTitle(project)

  const projectAbbr = project?.projectAbbr || '';
  if (projectAbbr !== '') {
    // 采集任务
    const cjJobs = (await get_cj_job_page({
      current: 1,
      size: 10000,
      blurry: `${projectAbbr}_${queryParam.value.tableAbbr}`,
      subsystemName: "采集"
    })).data.records
        .map((v): Job => ({
          id: v.id,
          jobName: v.jobDesc,
          status: (() => {
            if (v.configuration == 0) {
              return 0
            } else {
              const triggerStatus = allSchedJobInfoRef.value.find(item => item.jobTemplateId == v.id)?.triggerStatus
              if (triggerStatus == 1) {
                return 2
              } else {
                return 1
              }
            }
          })(),  //
          type: (() => {
            switch (v.jobDesc.split('_')[0]) {
              case 'cj':
                return '数据采集任务'
              case 'gx':
                return '数据共享任务'
              default :
                return '未知任务'
            }
          })(),
          schedMode: 2,
          cron: (() => {
            return allSchedJobInfoRef.value.find(item => item.jobTemplateId == v.id)?.jobCron || null
          })(),
          nextExecTime: cjJobGetNextExecTime(v.id),
          createBy: null
        }))

    //工作流任务
    const workflowJobs = (await get_workflow_page({
      page: 1,
      size: 10000,
      status: null,
      procName: `${projectAbbr}_${queryParam.value.tableAbbr}`
    })).data.records
        .map((v): Job => ({
          id: v.id,
          jobName: v.procName,
          type: (() => {
            switch (v.procName.split('_')[0]) {
              case 'zj':
                return '数据质检任务'
              case 'bf':
                return '数据备份任务'
              case 'qc':
                return '数据清除任务'
              case 'rh':
                return '数据融合任务'
              case 'rk':
                return '数据入库任务'
              default :
                return '未知任务'
            }
          })(),
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
          nextExecTime: zjJobGetNextExecTime(v),
          createBy: v.createBy,
          code: v.procCode
        }))

    jobs.push(...cjJobs, ...workflowJobs)
  } else {
    tableDataRef.value = []
  }

  tableDataRef.value = jobs.sort(compare)

  isTableLoading.value = false
}

const createColumns = (): DataTableColumns<Job> => {
  return [
    {
      title: '任务名',
      key: 'jobName',
      width: '15%'
    },
    {
      title: '任务类型',
      key: 'type',
      width: '10%'
    },
    {
      title: '状态',
      key: 'status',
      width: '8%',
      align: 'center',
      render(row) {
        if (row.status == 0) {
          return h(NTag, {
                size: 'small',
                bordered: false,
                color: {
                  color: '#ffc062',
                  textColor: 'white'
                }
              },
              {default: () => '未配置'})
        } else if (row.status == 1) {
          return h(NTag, {
                size: 'small',
                bordered: false,
                type: 'default'
              },
              {default: () => '停用'})
        } else if (row.status == 2) {
          return h(NTag, {
                size: 'small',
                bordered: false,
                type: 'info'
              },
              {default: () => '启用'})
        } else if (row.status == 3) {
          return h(NTag, {
                size: 'small',
                bordered: false,
                type: 'success'
              },
              {default: () => '运行中'})
        } else if (row.status == 4) {
          return h(NTag, {
                size: 'small',
                bordered: false,
                type: 'error'
              },
              {default: () => '异常'})
        } else if (row.status == 5) {
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
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '15%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '25%',
      align: 'center',
      render(row) {

        let container = h(NSpace, {
          justify: 'center'
        })

        switch (row.status) {
          case 0:// 未配置调度任务的采集任务
            container.children = [
              showButton('配置', async () => {
                await addSchedJobModalFormModelInit(row)
                showModalRef.value = true
                modalTitle = '创建调度任务'
                formSelect.value = select
                formSelect.value.addSchedJob = true
              }),
              showConfirmation('删除', async () => {
                await cjJobDelete(row.id)
              }),
            ]
            break
          case  1: // 任务停用
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {
              container.children = [
                showButton('启用', async () => {
                  cjJobStart(row.id)
                }),
                showConfirmation('执行', async () => {
                  cjJobRun(row)
                }),
                showConfirmation('删除', async () => {
                  await cjJobDelete(row.id)
                }),
              ]
            } else {
              container.children = [
                showButton('启用', async () => {
                  workflowActive(row.id, '01')
                }),
                showConfirmation('执行', async () => {
                  await workflowActive(row.id, '01')
                  await workflowRun(row)
                }),
                showConfirmation('删除', async () => {
                  await workflowDelete(row.id)
                }),
              ]
            }
            break
          case 2:// 任务启用
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {
              container.children = [
                showButton('停用', async () => {
                  cjJobStop(row.id)
                }),
                showConfirmation('执行', async () => {
                  cjJobRun(row)
                }),
                showConfirmation('删除', async () => {
                  await cjJobStop(row.id)
                  await cjJobDelete(row.id)
                }),
              ]
            } else {
              container.children = [
                showButton('停用', async () => {
                  workflowActive(row.id, '02')
                }),
                showConfirmation('执行', async () => {
                  workflowRun(row)
                }),
                showConfirmation('删除', async () => {
                  await workflowActive(row.id, '02')
                  await workflowDelete(row.id)
                }),
              ]
            }
            break
          case 3:// 任务运行中
            break
          case 4:// 任务异常
            if (row.type === '数据采集任务' || row.type === '数据共享任务') {

            } else {
              /* container.children = [
                h(NButton, {
                      size: 'small',
                      onClick: () => {
                        message.info('重跑')
                      }
                    },
                    {default: () => '重跑'})
              ] */
            }
            break
        }

        return container
      }
    }
  ]
}

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

// 自定义比较函数
const compare = (a, b) => {
  const jobNameA = a.jobName.slice(0, 2);
  const jobNameB = b.jobName.slice(0, 2);

  if (jobNameA === "cj") return -1;
  if (jobNameB === "cj") return 1;

  if (jobNameA === "zj") return -1;
  if (jobNameB === "zj") return 1;

  if (jobNameA === "bf") return -1;
  if (jobNameB === "bf") return 1;

  if (jobNameA === "rh") return -1;
  if (jobNameB === "rh") return 1;

  if (jobNameA === "rk") return -1;
  if (jobNameB === "rk") return 1;

  if (jobNameA === "qc") return -1;
  if (jobNameB === "qc") return 1;

  if (jobNameA === "gx") return -1;
  if (jobNameB === "gx") return 1;

  return 0;
}

/**
 * @param id: 任务ID
 * @param type: 01：启用， 02：停用
 **/
const workflowActive = (id: string, type: '01' | '02') => {
  workflow_active({
    id: id,
    type: type
  }).then((res) => {
    if (res.code == 200) {
      message.success(type == '01' ? '启用成功' : '停用成功')
      tableDataInit()
    } else {
      message.error(res.msg)
    }
  })
}

const workflowRun = async (v: Job) => {

  let canRun = true

  if (v.type === '数据质检任务') {
    let configParam = {
      page: 1,
      size: 1,
      likeName: '',
      orders: [
        {
          asc: true,
          column: "table_name"
        }
      ],
      likeType: 0
    }

    const project = await get_project_by_pro_abbr(v.jobName.split("_")[1])

    configParam.likeName = `di_${project.tableAbbr}_${v.jobName.split("_")[2]}_temp_ods`

    get_valid_config_page(configParam).then(res => {
      //
      if (isEmpty(res.data.records) || res.data.records[0].tableName != 'configParam.likeName') {
        dialog.warning({
          title: '警告',
          content: `检测到未在质量门户对[${configParam.likeName}]进行配置，是否继续执行质检？`,
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: () => {
            canRun = true
          },
          onNegativeClick: () => {
            canRun = false
          }
        })
      } else {
        canRun = true
      }
    })

  }

  if (canRun) {
    const param = {
      businessKey: uuid.v4(),
      code: v.code,
      createBy: v.createBy,
      creator: v.createBy
    }
    workflow_run(param).then(res => {
      if (res.code == 200) {
        message.success(res.message)
        tableDataInit()
      } else {
        message.error(res.message)
      }
    }).then(() => {
      create_cron_job(v.jobName)
    })
  }

}

const workflowDelete = (id) => {
  workflow_delete(id).then(res => {
    if (res.code == 200) {
      message.success(res.data)
      tableDataInit()
    } else {
      message.success("删除失败")
    }
  })
}

const cjJobStart = (id) => {
  const schedJobId = allSchedJobInfoRef.value.find(item => item.jobTemplateId == id).id
  cj_job_start(schedJobId).then(res => {
    if (res.data == 'success') {
      message.success('启用成功')
      tableDataInit()
    } else {
      message.error(res.msg)
    }
  })
}

const cjJobStop = (id) => {
  const schedJobId = allSchedJobInfoRef.value.find(item => item.jobTemplateId == id).id
  cj_job_stop(schedJobId).then(res => {
    if (res.data == 'success') {
      message.success('停用成功')
      tableDataInit()
    } else {
      message.error(res.message)
    }
  })
}

const cjJobRun = (row: Job) => {
  const schedJobId = allSchedJobInfoRef.value.find(item => item.jobTemplateId == row.id).id
  cj_job_run({
    jobId: schedJobId,
    subsystemName: "采集"
  }).then(res => {
    if (res.data == 'success') {
      message.success('执行成功')
      tableDataInit()
    } else {
      message.error(res.message)
    }
  })
}

const cjJobDelete = (id) => {
  const schedJobId = allSchedJobInfoRef.value.find(item => item.jobTemplateId == id)?.id || null
  if (schedJobId != null) {
    sched_job_delete(schedJobId).then(res => {
      if (res.code == 0) {
        message.success('调度任务删除成功')
        cj_job_delete(id).then(res1 => {
          if (res1.code == 0) {
            message.success('采集任务删除成功')
            tableDataInit()
          } else {
            message.error(res1.msg)
          }
        })
      } else {
        message.error(res.msg)
      }
    })
  } else {
    cj_job_delete(id).then(res1 => {
      if (res1.code == 0) {
        message.success('采集任务删除成功')
        tableDataInit()
      } else {
        message.error(res1.msg)
      }
    })
  }

}

const convertToSixFields = (cron: string): string => {
  const fields = cron.split(' ');
  return `${fields[0]} ${fields[1]} ${fields[2]} ${fields[3]} ${fields[4]} ${fields[5]}`;
}

const cjJobGetNextExecTime = (jobId: any) => {
  const jobCron = allSchedJobInfoRef.value.find(item => item.jobTemplateId == jobId)?.jobCron || null
  if (jobCron != null) {
    const interval = parseExpression(convertToSixFields(jobCron));
    return formatDate(interval.next().toDate())
  } else {
    return '未配置调度任务'
  }
}

const zjJobGetNextExecTime = (v) => {
  if (v.schedulingMode == 2) {
    const interval = parseExpression(convertToSixFields(v.crontab));
    return formatDate(interval.next().toDate())
  } else if (v.schedulingMode == 1) {
    return `依赖于${v.dependencyWorkflowName}`
  } else {
    return '未配置调度任务'
  }
}

// endregion

// region 新增调度任务

const showModalRef = ref(false)

let modalTitle = '';

const select = {
  addSchedJob: false
}

const formSelect = ref(select)

const addSchedJobModalFormRef = ref<FormInst | null>(null);

const addSchedJobModalFormModel = ref({
  jobType: "大数据采集",
  jobContent: '',
  glueType: "DATAX",
  projectId: '',
  projectName: '',
  jobCron: '',
  jobDesc: '',
  jobGroup: 2,
  retry: '0',
  executorFailRetryCount: 0,
  jobTemplateId: '',
  subsystemName: "采集",
  sec: '*',
  min: '0',
  hour: '0,12',
  day: '?',
  month: '*',
  week: '*',
  year: '*'
})

const addSchedJobModalFormRules = {
  jobContent: {
    required: true
  },
  projectName: {
    required: true
  },
  retry: {
    required: true,
    trigger: ['change']
  },
  sec: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  min: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  hour: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  day: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  month: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  week: {
    required: true,
    trigger: ['input'],
    message: ''
  },
  year: {
    required: true,
    trigger: ['input'],
    message: ''
  }
}

const addSchedJobModalFormModelInit = async (v) => {
  addSchedJobModalFormModel.value.jobContent = v.jobName
  addSchedJobModalFormModel.value.jobDesc = v.jobName
  addSchedJobModalFormModel.value.jobTemplateId = v.id
  addSchedJobModalFormModel.value.projectName = (await get_project_by_pro_abbr(v.jobName.split("_")[1]))?.projectName || '未知项目'
}

const onNegativeClick = () => {
  showModalRef.value = false
}

const isSaving = ref(false)
const onPositiveClick = () => {
  isSaving.value = true
  if (formSelect.value.addSchedJob) {
    addSchedJobModalFormRef.value?.validate(async (errors) => {
      if (!errors) {

        const {
          projectName,
          sec,
          min,
          hour,
          day,
          month,
          week,
          year,
          ...newAddSchedJobModalFormModel
        } = {
          ...addSchedJobModalFormModel.value,
          retry: parseInt(addSchedJobModalFormModel.value.retry),
          executorFailRetryCount: addSchedJobModalFormModel.value.executorFailRetryCount.toString(),
          jobCron: `${addSchedJobModalFormModel.value.sec} ${addSchedJobModalFormModel.value.min} ${addSchedJobModalFormModel.value.hour} ${addSchedJobModalFormModel.value.day} ${addSchedJobModalFormModel.value.month} ${addSchedJobModalFormModel.value.week} ${addSchedJobModalFormModel.value.year}`
        };

        await add_sched_task(newAddSchedJobModalFormModel).then(res => {
          if (res.code == 0) {
            message.success('调度任务创建成功')
            showModalRef.value = false
            tableDataInit()
          } else {
            notification.create({
              title: '调度任务创建失败',
              content: res.msg + '，请重新配置CRON表达式',
              type: "warning"
            })
            console.log(res)
          }
        })

      } else {
        console.log(errors)
      }
    }).finally(() => isSaving.value = false)
  }

}

// endregion


</script>

<style scoped>

</style>
