<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 95px);" trigger="hover">
    <div class="w-auto h-8 mb-2">
      <n-space inline class="float-right">
        <n-input-group>
          <n-input
              v-model:value="queryParam"
              placeholder="搜索"
              clearable
              :readonly="isTableLoading"
              @keydown.enter="tableDataInit"
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
        <n-button secondary type="info" @click="showCreateJobModal">
          创建任务
          <template #icon>
            <n-icon>
              <Add/>
            </n-icon>
          </template>
        </n-button>
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
        :scroll-x="1400"
    />
  </n-scrollbar>

  <job-log-drawer v-model:show="showDrawerRef" :job="drawerJobRef"/>

  <n-modal
      v-model:show="showValidConfigModalRef"
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

  <n-modal
      v-model:show="showCreateJobModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="'创建任务'"
      :size="'small'"
      style="width: 570px"
  >
    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
      <n-alert class="mt-4" type="default" :show-icon="false">
        1.已去除id,add_time,cd_time,cd_operation,cd_batch 字段的质检<br/>
        2.已去除必填项中值域、主外键一致性、身份证号、手机号、邮箱、正则的质检<br/>
        3.已去除自定义sql中包含中台表的质检规则
      </n-alert>

      <n-form
          class="mt-4"
          ref="createJobModalFormRef"
          :model="createJobModalFormModel"
          :rules="createJobModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="4" :x-gap="4">
          <n-form-item-gi :span="4" label="项目" path="projectId">
            <n-select
                v-model:value="createJobModalFormModel.projectId"
                placeholder="选择项目"
                :options="projectIdOptions"
                :consistent-menu-width="false"
                filterable
                disabled
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="表名" path="jobJsonId">
            <n-select
                v-model:value="createJobModalFormModel.jobJsonId"
                placeholder="选择表名"
                :options="tableNameOptions"
                :consistent-menu-width="false"
                filterable
                :loading="tableSelectLoading"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="责任人" path="personId">
            <n-select
                v-model:value="createJobModalFormModel.personId"
                placeholder="选择责任人"
                :options="personIdOptions"
                :consistent-menu-width="false"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="createJob" :loading="isCreating">确定
      </n-button>
      <n-button :size="'small'" @click="showCreateJobModalRef=!showCreateJobModalRef">返回</n-button>
    </template>
  </n-modal>

  <n-modal
      v-model:show="showJobInpsModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="'质检情况'"
      :size="'small'"
      style="width: 750px"
  >
    <job-inspection-tab :inps-table-name="inpsTableName" :inps-table-db-id="inpsTableDbId"/>
  </n-modal>

  <zj-job-update-modal
      v-model:show="zjJobUpdateModalConfig.show"
      :table-abbr="zjJobUpdateModalConfig.tableAbbr"
      :job-id="zjJobUpdateModalConfig.jobId"
  />
</template>

<script setup lang="ts">
import {DataDevBizVo, Workflow} from "@common/types/datacenter/workflow";
import {get_zj_json} from "@render/api/auxiliaryDb/jobJson.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {
  add_work_flow, create_table,
  create_valid_config, get_tables,
  get_valid_config_page, get_workflow, get_workflow_list_by_project_id,
  gte_usrc_org_tree
} from "@render/api/datacenter.api";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {personIdOptions, projectIdOptions} from "@render/typings/datacenterOptions";
import {
  getCustomTableValidConfig, getTableCommentByProName,
  getWorkflowJobStatus,
  Job, renderWorkflowActionButton,
  setJobStatus,
  showButton, showButtonPopover,
  showTextButton,
  workflowJobGetLastExecTime,
  workflowJobGetNextExecTime,
} from "@render/utils/datacenter/jobTabUtil";
import {dataLakeZjJobJsonConvert} from "@render/utils/datacenter/zjJob";
import JobLogDrawer from "@render/views/jobMgt/components/jobLogDrawer.vue";
import ZjJobUpdateModal from "@render/views/jobMgt/components/zjJobUpdateModal.vue";
import JobInspectionTab from "@render/views/jobMgt/projectTree/jobInspectionTab.vue";
import {Add, Refresh, Search} from '@vicons/ionicons5'
import {VNode} from "@vue/runtime-core";
import {isEmpty} from "lodash-es";
import {
  DataTableColumns,
  FormInst,
  NButton,
  NSpace,
  SelectGroupOption,
  SelectOption
} from "naive-ui";
import {format} from "sql-formatter";
import {h, onMounted, reactive, ref} from "vue";

const tableDataRef = ref([])
const isTableLoading = ref(false)

const projectId = '39'

const queryParam = ref('')

onMounted(() => {
  tableDataInit()
})

const tableDataInit = async () => {
  isTableLoading.value = true

  // 工作流任务
  const allJobs = (await get_workflow_list_by_project_id(projectId)).data

  const filterJobs = allJobs.filter((job: {
    procName: string;
  }) => job.procName.includes(queryParam.value))

  let newJobs = []

  for (const v of filterJobs) {
    const job: Job = {
      id: v.id,
      jobName: v.procName,
      type: '数据质检任务',
      status: getWorkflowJobStatus(v),
      schedMode: parseInt(v.schedulingMode),
      cron: v.crontab == '' ? null : v.crontab,
      lastExecTime: await workflowJobGetLastExecTime(v),
      nextExecTime: workflowJobGetNextExecTime(v),
      createBy: v.createBy,
      code: v.procCode,
      comment: await getTableCommentByProName(v.procName),
      createTime: v.createTime,
      updateTime: v.updateTime,
      project: await find_by_project_id(projectId),
      jobRerunType: v.editModel == 1 ? 2 : 1,
    }

    newJobs.push(job)
  }

  tableDataRef.value = newJobs.sort((a, b) => {
    const aSplit = a.jobName.split("_");
    const bSplit = b.jobName.split("_");
    const aSplitValue = aSplit[2];
    const bSplitValue = bSplit[2];
    return aSplitValue.localeCompare(bSplitValue);
  })

  isTableLoading.value = false
}

const createColumns = (): DataTableColumns<Job> => {
  return [
    {
      title: '任务名',
      key: 'jobName',
      width: '6%'
    },
    {
      title: '数据类型',
      key: 'comment',
      width: '10%'
    },
    {
      title: '状态',
      key: 'status',
      width: '5%',
      align: 'center',
      render(row) {
        return setJobStatus(row)
      }
    },
    {
      title: '上次执行时间',
      key: 'lastExecTime',
      width: '10%'
    },
    {
      title: '下次执行时间',
      key: 'nextExecTime',
      width: '10%'
    },
    {
      title: '任务创建时间',
      key: 'createTime',
      width: '10%'
    },
    {
      title: '任务更新时间',
      key: 'updateTime',
      width: '10%'
    },
    {
      title: '操作',
      key: 'actions',
      width: '15%',
      align: 'center',
      fixed: 'right',
      render(row) {

        let container = h(NSpace, {
          justify: 'center'
        })

        let children: VNode[] = renderWorkflowActionButton(row, tableDataInit)

        if (children.length >= 2) {
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
  if (row.type === '数据质检任务' && ![-1, 2, 3].includes(row.status)) {
    moreBtnChildren.push(showTextButton('更新规则', () => showZjJobUpdateModal(row)))
  }

  if (!(row.type === '数据采集任务' || row.type === '数据共享任务') && ![0, -1].includes(row.status)) {
    moreBtnChildren.push(showTextButton('日志', () => showJobLogDrawer(row)))
    moreBtnChildren.push(showTextButton('质检情况', () => showJobInpsModal(row)))
    moreBtnChildren.push(showTextButton('质检配置', () => showValidConfigModal(row)))
  }
}

// children直接添加更多中的组件
const childrenPushMoreBtn = (row: Job, children: VNode[]) => {
  if (row.type === '数据质检任务' && ![-1, 2, 3].includes(row.status)) {
    children.push(showButton('更新规则', () => showZjJobUpdateModal(row)))
  }

  if (!(row.type === '数据采集任务' || row.type === '数据共享任务') && ![0, -1].includes(row.status)) {
    children.push(showButton('日志', () => showJobLogDrawer(row)))
    children.push(showButton('质检情况', () => showJobInpsModal(row)))
    children.push(showButton('质检配置', () => showValidConfigModal(row)))
  }
}

const columnsRef = ref(createColumns())

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: false,
  onChange: (page: number) => {
    paginationReactive.page = page
    tableDataInit()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    tableDataInit()
  }
})

// region 任务创建

const showCreateJobModalRef = ref(false)

const createJobModalFormRef = ref<FormInst | null>(null);
const createJobModalFormModel = ref({
  jobJsonId: '',
  personId: '',
  projectId: projectId,
})
const createJobModalFormRules = {
  jobJsonId: {
    required: true,
    trigger: ['change'],
    message: '请选择表名'
  },
  projectId: {
    required: true,
    trigger: ['change'],
    message: '请选择项目'
  },
  personId: {
    required: true,
    trigger: ['change'],
    message: '请选择责任人'
  }
}

const tableNameOptions = ref<Array<SelectOption | SelectGroupOption>>()
const tableSelectLoading = ref(false)

const isCreating = ref(false)
const showCreateJobModal = () => {
  showCreateJobModalRef.value = true

  get_zj_json()
      .then((res) => {
        tableNameOptions.value = res?.filter((item: {
          zjJson: any;
        }) => item.zjJson != null).map(
            ((v: {
              tableName: any;
              id: {
                toString: () => any;
              };
              zjJson: any;
            }) => ({
              label: v.tableName,
              value: v.id.toString(),
              json: v.zjJson,
            }))
        ) || []
      }).finally(() => tableSelectLoading.value = false)
}

const createJob = () => {
  isCreating.value = true

  createJobModalFormRef.value?.validate((errors) => {
    if (!errors) {
      let paramJson = JSON.parse(tableNameOptions.value.find(item => item.value === createJobModalFormModel.value.jobJsonId).json as string)
      let tableName = (tableNameOptions.value.find(item => item.value === createJobModalFormModel.value.jobJsonId).label as string).toLowerCase()

      const newWrongTableName = `df_lake_${tableName}_error_dm`

      // 查询是否已创建此错误表
      get_tables('6', newWrongTableName).then(res => {
        if (res.length > 0) {
          add_work_flow(dataLakeZjJobJsonConvert(createJobModalFormModel.value, paramJson, tableName)).then((res) => {
            if (res.code == 200) {
              window.$message.success('质检任务创建成功')
              tableDataInit()
              showCreateJobModalRef.value = false
            } else {
              window.$message.error(res.message)
            }
          }).finally(() => isCreating.value = false)
        } else {
          window.$dialog.warning({
            title: '警告',
            content: `检测到${newWrongTableName}未创建，是否创建？`,
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: async () => {
              await createWrongTable(tableName).then(() => {
                add_work_flow(dataLakeZjJobJsonConvert(createJobModalFormModel.value, paramJson, tableName)).then((res) => {
                  if (res.code == 200) {
                    window.$message.success('质检任务创建成功')
                    tableDataInit()
                    showCreateJobModalRef.value = false
                  } else {
                    window.$message.error(res.message)
                  }
                }).finally(() => isCreating.value = false)
              })
            }
          })
        }
      })
    } else {
      isCreating.value = false
      console.error(errors)
    }
  })
}

const createWrongTable = async (tableName: string) => {
  let paramsJson = {
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

  paramsJson.namedJson = JSON.stringify([
    {
      id: 1,
      table: "更新方式",
      key: "DF",
      value: "全量表",
      saveValue: null,
      flagUser: 1
    },
    {
      id: '1638446496908140546',
      table: "组织机构",
      key: 'LAKE',
      value: '数据湖',
      saveValue: null,
      flagUser: 1
    }, {
      id: '2',
      table: "自定义内容",
      key: `${tableName}_error`,
      value: null,
      saveValue: null,
      flagUser: 0,
      selectList: []
    }, {
      id: "1640177719367512066",
      table: "数据层级",
      key: "DM",
      value: "数据集市层",
      saveValue: null,
      flagUser: 1,
    }
  ])

  paramsJson.tableName = `df_lake_${tableName}_error_dm`

  const sql = (await get_table_sql({tableName: tableName}))[0].sql

  paramsJson.ddlSql = format(addFieldsToSql(`CREATE TABLE ${paramsJson.tableName} ${sql}`))

  await create_table(paramsJson).then(res => {
    if (res.success && res.code == 200) {
      window.$message.success(res.message)
    } else {
      window.$message.error(res.message)
    }
  })

}

const addFieldsToSql = (sql: string): string => {
  const fieldStr = `OPT_AREA_CODE VARCHAR(20) COMMENT '数据所属单位区划',
    OPT_FIELD_CODE VARCHAR(20) COMMENT '数据所属单位领域',
    OPT_SUBJECT_ID VARCHAR(36) COMMENT '数据所属单位主体ID',
    OPT_SUBJECT_NAME VARCHAR(50) COMMENT '数据所属单位主体名称',
    OPT_DEPT_ID VARCHAR(36) COMMENT '数据所属单位部门ID',
    OPT_DEPT_NAME VARCHAR(50) COMMENT '数据所属单位部门名称'`;
  const index = sql.indexOf('cd_batch');
  if (index < 0) { // 如果原表中不存在cd_batch字段，则直接返回原sql语句
    return sql;
  }
  const preSql = sql.slice(0, index); // 获取cd_batch字段前面的sql语句
  const postSql = sql.slice(index).replace('cd_batch VARCHAR(50) COMMENT \'批次号\'', ''); // 获取cd_batch字段后面的sql语句
  const newFields = `cd_batch VARCHAR(50) COMMENT '批次号',
    ${fieldStr}`;
  return `${preSql} ${newFields} ${postSql}`;// 拼接新增字段后的完整sql语句
}

//endregion

// region 日志
const showDrawerRef = ref(false)
const drawerJobRef = ref<Job>(null)

const showJobLogDrawer = (v: Job) => {
  drawerJobRef.value = v
  showDrawerRef.value = true
}
//endregion

//region 质检配置管理
const showValidConfigModalRef = ref(false)
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

const showValidConfigModal = async (v: Job) => {
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

  mechanismOptions.value = (await gte_usrc_org_tree()).data.sort(customSort).map(((v: {
    name: any;
    id: any;
  }) => ({
    label: `${v.name}`,
    value: v.id
  })))

  showValidConfigModalRef.value = true
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
          showValidConfigModalRef.value = false
        })
      }

    } else {
      isSaving.value = false
      console.error(errors)
    }
  })
}

const onNegativeClick = () => {
  showValidConfigModalRef.value = false
}

const handlemechanismIdUpdate = () => {
  validConfigModalFormModel.value.mechanismName = mechanismOptions.value.filter(item => item.value == validConfigModalFormModel.value.mechanismId)[0].label as string
}

//endregion

// region 质检规则更新
const zjJobUpdateModalConfig = ref({
  show: false,
  jobId: null,
  tableAbbr: null
})

const showZjJobUpdateModal = (v: Job) => {
  zjJobUpdateModalConfig.value.show = true
  zjJobUpdateModalConfig.value.jobId = v.id
  zjJobUpdateModalConfig.value.tableAbbr = v.jobName.split('_')[2].toUpperCase()
}
//endregion

// region 质检情况
const showJobInpsModalRef = ref(false)
const inpsTableName = ref('')
const inpsTableDbId = ref('')

const showJobInpsModal = async (row: Job) => {
  const workflow: Workflow = (await get_workflow(row.id)).data

  const dataDevBizVo: DataDevBizVo = JSON.parse(workflow.businessParamsJson)

  inpsTableName.value = dataDevBizVo.qualityInspectionDtoList[0].sourceTableName
  inpsTableDbId.value = '12'

  showJobInpsModalRef.value = true
}
//endregion
</script>

<style scoped>

</style>
