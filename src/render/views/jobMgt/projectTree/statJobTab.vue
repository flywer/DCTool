<template>
  <n-layout>
    <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
      <div class="w-auto h-8 mb-2">
        <n-space inline class="float-right" style="max-width: 60%">
          <n-dropdown :options="toolOptions" trigger="click" @select="handleToolSelect">
            <n-button secondary strong type="info">
              实用方法
            </n-button>
          </n-dropdown>
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
          :data="odsTableDataStatJobTableData"
          :bordered="true"
          :size="'small'"
          :loading="isOdsTableDataStatJobTableLoading"
          :striped="true"
          :scroll-x="1300"
      >
        <template #empty>
          <span style="color: rgba(194, 194, 194, 1)">未选择任务或未配置项目简称信息</span>
        </template>
      </n-data-table>
    </n-scrollbar>
  </n-layout>

  <job-log-drawer v-model:show="showDrawerRef" :job="drawerJobRef"/>

  <workflow-config-modal
      v-model:show="workflowModalConfig.show"
      :job-id="workflowModalConfig.workflowId"
      :editable="workflowModalConfig.editable"
      @onAfterLeave="tableDataInit"
  />

</template>

<script setup lang="ts">
import {ProjectInfo} from "@common/types";
import {Workflow} from "@common/types/datacenter/workflow";
import {getJobTypeComment, Job, JobStatus, JobType} from "@common/types/jobMgt";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {create_table, get_job_project_by_id, get_workflow_page} from "@render/api/datacenter.api";
import WorkflowConfigModal from "@render/components/datacenter/workflowConfigModal.vue";
import {useProjectTreeStore} from "@render/stores/projectTree";
import {calculateDaysDifferenceFromNow} from "@render/utils/common/dateUtils";
import {renderIcon} from "@render/utils/common/renderIcon";
import {
  getJobType,
  getWorkflowJobStatus,
  renderWorkflowActionButton,
  setJobStatus,
  showButton,
  showButtonPopover,
  showTextButton,
  workflowJobGetLastExecTime,
  workflowJobGetNextExecTime
} from "@render/utils/datacenter/jobTabUtil";
import {ODSTjBfJobSaveModel} from "@render/utils/datacenter/workflow/odsTj/ODSTjBfJobSaveModel";
import {ODSTjJobSaveModel} from "@render/utils/datacenter/workflow/odsTj/ODSTjJobSaveModel";
import JobLogDrawer from "@render/views/jobMgt/components/jobLogDrawer.vue";
import {Refresh} from "@vicons/ionicons5";
import {TableAdd24Regular} from "@vicons/fluent";
import {VNode} from "@vue/runtime-core";
import {isEmpty} from "lodash-es";
import {DataTableColumns, NButton, NSpace, NTag} from "naive-ui";
import {computed, h, onMounted, ref, watch} from "vue";

// 创建计算属性来获取 Pinia 存储中的值
const selectedKeys = computed(() => useProjectTreeStore().selectedKeys)

// 当前项目示例，辅助库信息
const projectRef = ref<ProjectInfo>(null)

// 当前项目示例，数据中台信息
const datacenterProjectRef = ref(null)

const queryParam = ref({
  projectId: null,
  tableAbbr: null as string //此为表名的最简化，比如di_ssft_z2010_temp_ods 则为z2010
})

watch(selectedKeys, (newValue, oldValue) => {
  if (newValue.length == 0) {
    newValue = oldValue
    useProjectTreeStore().selectedKeys = newValue
  }
  if (newValue[0] != null) {
    pageInit(newValue)
  }
})

onMounted(() => {
  pageInit(useProjectTreeStore().selectedKeys)
})

const pageInit = async (selectedKeys: string[]) => {
  const segments = selectedKeys[0].split('-');
  useProjectTreeStore().isBasicData = segments[0] === '0'
  const pattern: RegExp = /[a-zA-Z]/; // 包含字母的正则表达式
  if (pattern.test(segments[segments.length - 1]) && segments[segments.length - 1].length === 5) {
    queryParam.value.projectId = segments[segments.length - 2]
    queryParam.value.tableAbbr = segments[segments.length - 1]
    projectRef.value = await find_by_project_id(queryParam.value.projectId)
    datacenterProjectRef.value = await get_job_project_by_id(queryParam.value.projectId)

    await tableDataInit()
  }
}

// region 数据表
const tableDataInit = async () => {
  await odsTableDataStatJobTableInit()
}

const createColumns = (): DataTableColumns<Job> => {
  return [
    {
      title: '任务名',
      key: 'jobName',
      width: '8%'
    },
    {
      title: '任务类型',
      key: 'type',
      width: '5%',
      render(row) {
        return getJobTypeComment(row.type)
      }
    },
    {
      title: '状态',
      key: 'status',
      width: '3%',
      align: 'center',
      render(row) {
        return setJobStatus(row)
      }
    },
    {
      title: '上次执行时间',
      key: 'lastExecTime',
      width: '8%',
      render(row) {
        if (row.lastExecTime != '-') {
          if (calculateDaysDifferenceFromNow(row.lastExecTime) <= -7) {
            return h(NTag, {
              bordered: false,
              type: 'warning'
            }, row.lastExecTime)
          } else {
            return row.lastExecTime
          }
        } else {
          return row.lastExecTime
        }
      }
    },
    {
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '8%'
    },
    {
      title: '任务创建时间',
      key: 'createTime',
      width: '8%'
    },
    {
      title: '任务更新时间',
      key: 'updateTime',
      width: '8%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '12%',
      align: 'center',
      fixed: 'right',
      render(row) {
        let container = h(NSpace, {
          justify: 'center'
        })

        let children: VNode[] = []

        // 未创建的任务
        if (row.status == -1) {
          children = [showButton('创建', async () => {
            const project = (await find_by_project_id(queryParam.value.projectId))
            switch (row.type) {
              case JobType.odstj:
                ODSTjJobSaveModel.createODSTjJob({
                  projectId: project.projectId,
                  personId: datacenterProjectRef.value?.userId,
                  tableName: queryParam.value.tableAbbr
                }).then(() => {
                  setTimeout(() => {
                    tableDataInit()
                  }, 500)
                })
                break
              case JobType.odstjbf:
                ODSTjBfJobSaveModel.createODSTjBfJob({
                  projectId: project.projectId,
                  personId: datacenterProjectRef.value?.userId,
                  tableName: queryParam.value.tableAbbr
                }).then(() => {
                  setTimeout(() => {
                    tableDataInit()
                  }, 500)
                })
                break
            }

          })]
        } else {
          children = renderWorkflowActionButton(row, tableDataInit)
        }

        if (children.length == 3) {
          // '更多'按钮的子组件
          let moreBtnPopoverChildren: VNode[] = []

          moreBtnPopoverChildrenPush(row, moreBtnPopoverChildren)

          // 若只有一个则直接添加到children里
          if (moreBtnPopoverChildren.length == 1) {
            childrenPushMoreBtn(row, children)
          } else {
            if (!isEmpty(moreBtnPopoverChildren)) {
              children.push(showButtonPopover('更多', moreBtnPopoverChildren))
            }
          }

        } else {
          childrenPushMoreBtn(row, children)
        }

        container.children = children

        return container
      }
    }
  ]
}

const moreBtnPopoverChildrenPush = (row: Job, moreBtnChildren: VNode[]) => {
  if (row.status != JobStatus.noCreate) {
    moreBtnChildren.push(showTextButton('日志', () => showJobLogDrawer(row)))
    moreBtnChildren.push(showTextButton('任务配置', () => showWorkflowConfigModal(row)))

  }
}

// children直接添加更多中的组件
const childrenPushMoreBtn = (row: Job, children: VNode[]) => {
  if (row.status != JobStatus.noCreate) {
    children.push(showButton('日志', () => showJobLogDrawer(row)))
    children.push(showButton('任务配置', () => showWorkflowConfigModal(row)))
  }
}

const columnsRef = ref(createColumns())

// region ODS表数据量统计任务表
const odsTableDataStatJobTableData = ref([])
const isOdsTableDataStatJobTableLoading = ref(false)
const odsTableDataStatJobTableInit = async () => {
  isOdsTableDataStatJobTableLoading.value = true
  try {
    odsTableDataStatJobTableData.value = []

    const projectAbbr = projectRef.value?.projectAbbr || '';

    // region  odstj
    const odstjJobData: Workflow = (await get_workflow_page({
      page: 1,
      size: 1,
      status: null,
      procName: `odstj_${projectAbbr}_${queryParam.value.tableAbbr}`
    })).data?.records.at(0) || null

    if (odstjJobData) {
      const odsTjJob: Job = {
        id: odstjJobData.id,
        jobName: odstjJobData.procName,
        type: getJobType(odstjJobData.procName),
        status: getWorkflowJobStatus(odstjJobData),
        schedMode: parseInt(odstjJobData.schedulingMode) == 1 ? 1 : 2,
        cron: odstjJobData.crontab == '' ? null : odstjJobData.crontab,
        lastExecTime: await workflowJobGetLastExecTime(odstjJobData),
        nextExecTime: workflowJobGetNextExecTime(odstjJobData),
        createBy: odstjJobData.createBy,
        code: odstjJobData.procCode,
        createTime: odstjJobData.createTime,
        updateTime: odstjJobData.updateTime,
        jobRerunType: odstjJobData.editModel == 1 ? 2 : 1,
        project: projectRef.value
      }
      odsTableDataStatJobTableData.value.push(odsTjJob)
    } else {
      odsTableDataStatJobTableData.value.push({
        id: null,
        jobName: `odstjbf_${projectAbbr}_${queryParam.value.tableAbbr.toLowerCase()}`,
        status: -1,
        type: JobType.odstj,
        schedMode: 0,
        cron: null,
        lastExecTime: '--',
        nextExecTime: '未配置调度任务',
        createBy: null
      })
    }

    // endregion

    // region  odstjbf
    const odstjbfJobData: Workflow = (await get_workflow_page({
      page: 1,
      size: 1,
      status: null,
      procName: `odstjbf_${projectAbbr}_${queryParam.value.tableAbbr}`
    })).data?.records.at(0) || null

    if (odstjbfJobData) {
      const odsTjBfJob: Job = {
        id: odstjbfJobData.id,
        jobName: odstjbfJobData.procName,
        type: getJobType(odstjbfJobData.procName),
        status: getWorkflowJobStatus(odstjbfJobData),
        schedMode: parseInt(odstjbfJobData.schedulingMode) == 1 ? 1 : 2,
        cron: odstjbfJobData.crontab == '' ? null : odstjbfJobData.crontab,
        lastExecTime: await workflowJobGetLastExecTime(odstjbfJobData),
        nextExecTime: workflowJobGetNextExecTime(odstjbfJobData),
        createBy: odstjbfJobData.createBy,
        code: odstjbfJobData.procCode,
        createTime: odstjbfJobData.createTime,
        updateTime: odstjbfJobData.updateTime,
        jobRerunType: odstjbfJobData.editModel == 1 ? 2 : 1,
        project: projectRef.value
      }
      odsTableDataStatJobTableData.value.push(odsTjBfJob)
    } else {
      odsTableDataStatJobTableData.value.push({
        id: null,
        jobName: `odstjbf_${projectAbbr}_${queryParam.value.tableAbbr.toLowerCase()}`,
        status: -1,
        type: JobType.odstjbf,
        schedMode: 0,
        cron: null,
        lastExecTime: '--',
        nextExecTime: '未配置调度任务',
        createBy: null
      })
    }
    // endregion

  } catch (e) {
    console.error(e)
    isOdsTableDataStatJobTableLoading.value = false
    window.$message.error('获取ODS表数据量统计任务异常')
  }

  isOdsTableDataStatJobTableLoading.value = false
}

// endregion

// endregion

// region 工作流任务配置
const workflowModalConfig = ref({
  show: false,
  workflowId: null,
  editable: true
})

const showWorkflowConfigModal = (row: Job) => {
  workflowModalConfig.value.show = true
  workflowModalConfig.value.workflowId = row.id
  workflowModalConfig.value.editable = row.status != 3;
}
// endregion

// region 日志
const showDrawerRef = ref(false)
const drawerJobRef = ref<Job>(null)

const showJobLogDrawer = (v: Job) => {
  drawerJobRef.value = v
  showDrawerRef.value = true
}
//endregion

// region 实用方法
const toolOptions = [
  {
    label: '创建ODS数量统计记录表',
    key: 'CREATE_ODSTJ',
    icon: renderIcon(TableAdd24Regular)
  }
]

const handleToolSelect = async (key: string) => {
  if (key === 'CREATE_ODSTJ') {
    let paramsModel = {
      sourceId: '6',
      dbType: "tbds-hive",
      sourceName: "数据中台（TBDS）",
      dataTierCode: "SJTZ",
      dataTierName: "数据中台",
      namedJson: '',
      datamodelTableFieldsVoList: [
        {
          dataType: "",
          fieldName: "",
          fieldDescribe: "",
          fieldSize: "",
          fieldPrecision: "",
          emptyFlag: 0,
          keyFlag: 0,
          writeFieldSize: true,
          writeFieldPrecision: true,
          max: 2,
          validity: {
            fieldName: false,
            fieldDescribe: false,
            fieldType: false,
            fieldSize: false,
            fieldPrecision: false,
            emptyFlag: false,
            keyFlag: false
          }
        }
      ],
      lifeCycle: '1',
      ddlSql: '',
      tableName: ''
    }

    paramsModel.tableName = `df_${projectRef.value.tableAbbr}_${queryParam.value.tableAbbr.toLowerCase()}_odstj_dws`

    paramsModel.ddlSql = `
      CREATE TABLE ${paramsModel.tableName}
      (
        project_id   VARCHAR(24) COMMENT '数源单位归集项目ID标识',
        depart_name VARCHAR(128) COMMENT '数源单位部门名称',
        table_type  VARCHAR(128) COMMENT '数据元类型',
        raw_data_volume INT COMMENT '原始数据量（根据业务主键ID、批次号去重）',
        distinct_data_volume INT COMMENT '推送数据量（根据业务主键ID去重）',
        create_time TIMESTAMP  COMMENT '统计时间'
      ) COMMENT 'ODS数据量统计记录表' ROW FORMAT DELIMITED FIELDS TERMINATED BY '|' STORED AS ORC`

    create_table(paramsModel).then((res) => {
      if (res.success && res.code == 200) {
        window.$message.success(`创建[${paramsModel.tableName}]成功`)
      } else {
        window.$message.error(res.message)
      }
    })

  }
}

//endregion
</script>

<style scoped>

</style>
