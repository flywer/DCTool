<template>
  <n-alert  type="default" :show-icon="false">
    建表若出现服务器内部错误的问题，需要自行去中台删除该表然后重建，这是中台的问题
  </n-alert>
  <n-card class="mt-2" :content-style="{paddingBottom:0}">
    <n-form ref="formRef"
            inline
            :size="'small'"
            :model="formModel"
            :rules="rules"
            label-placement="left"
    >
      <n-grid :cols="3" :x-gap="12">
        <n-form-item-gi label="表名" path="tableSqlId">
          <n-select
              v-model:value="formModel.tableSqlId"
              placeholder="选择表名"
              :options="tableNameOptions"
              :consistent-menu-width="false"
              filterable
          />
        </n-form-item-gi>
        <n-form-item-gi label="项目" path="projectId">
          <n-select
              v-model:value="formModel.projectId"
              placeholder="选择项目"
              :options="projectIdOptions"
              :consistent-menu-width="false"
              filterable
          />
        </n-form-item-gi>
        <n-form-item-gi>
          <n-checkbox v-model:checked="formModel.hasOptCol">
            是否需要OPT字段
          </n-checkbox>
        </n-form-item-gi>
        <n-form-item-gi
            :span="12"
            path="tableGroupValue"
        >
          <n-checkbox-group
              v-model:value="formModel.tableGroupValue"
          >
            <n-space>
              <n-checkbox value="temp_ods">
                ODS层临时表
              </n-checkbox>
              <n-checkbox value="ods">
                ODS层备份表
              </n-checkbox>
              <n-checkbox value="right_dwd">
                DWD层合格表
              </n-checkbox>
              <n-checkbox value="error_dwd">
                DWD层不合格表
              </n-checkbox>
              <n-checkbox value="dwb">
                DWB层融合表
              </n-checkbox>
              <n-checkbox value="temp_dwb" disabled>
                DWB层融合临时表（启用）
              </n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </n-card>

  <n-space justify="center" align="center" class="mt-2">
    <n-button type="primary" class="w-28" @click="createTables">创建表</n-button>
  </n-space>

  <n-card class="mt-2">
    <n-list>
      <template #header>
        执行状态
      </template>

      <n-list-item v-if="createStatus.tempOds.tableName !==''">
        <n-space class="pl-2">
          <n-spin :size="14" v-if="createStatus.tempOds.isCreating"/>
          <div>{{ createStatus.tempOds.tableName }}</div>
          <n-space v-if="!createStatus.tempOds.isCreating">
            <n-icon :size="20" color="#0e7a0d" v-if="createStatus.tempOds.isSuccess">
              <CheckmarkSharp/>
            </n-icon>
            <n-icon :size="20" color="rgb(205 19 19)" v-else>
              <CloseSharp/>
            </n-icon>
            {{ createStatus.tempOds.msg }}
          </n-space>
        </n-space>
      </n-list-item>

      <n-list-item v-if="createStatus.ods.tableName !==''">
        <n-space class="pl-2">
          <n-spin :size="14" v-if="createStatus.ods.isCreating"/>
          <div>{{ createStatus.ods.tableName }}</div>
          <n-space v-if="!createStatus.ods.isCreating">
            <n-icon :size="20" color="#0e7a0d" v-if="createStatus.ods.isSuccess">
              <CheckmarkSharp/>
            </n-icon>
            <n-icon :size="20" color="rgb(205 19 19)" v-else>
              <CloseSharp/>
            </n-icon>
            {{ createStatus.ods.msg }}
          </n-space>
        </n-space>
      </n-list-item>

      <n-list-item v-if="createStatus.rightDwd.tableName !==''">
        <n-space class="pl-2">
          <n-spin :size="14" v-if="createStatus.rightDwd.isCreating"/>
          <div>{{ createStatus.rightDwd.tableName }}</div>
          <n-space v-if="!createStatus.rightDwd.isCreating">
            <n-icon :size="20" color="#0e7a0d" v-if="createStatus.rightDwd.isSuccess">
              <CheckmarkSharp/>
            </n-icon>
            <n-icon :size="20" color="rgb(205 19 19)" v-else>
              <CloseSharp/>
            </n-icon>
            {{ createStatus.rightDwd.msg }}
          </n-space>
        </n-space>
      </n-list-item>

      <n-list-item v-if="createStatus.errorDwd.tableName !==''">
        <n-space class="pl-2">
          <n-spin :size="14" v-if="createStatus.errorDwd.isCreating"/>
          <div>{{ createStatus.errorDwd.tableName }}</div>
          <n-space v-if="!createStatus.errorDwd.isCreating">
            <n-icon :size="20" color="#0e7a0d" v-if="createStatus.errorDwd.isSuccess">
              <CheckmarkSharp/>
            </n-icon>
            <n-icon :size="20" color="rgb(205 19 19)" v-else>
              <CloseSharp/>
            </n-icon>
            {{ createStatus.errorDwd.msg }}
          </n-space>
        </n-space>
      </n-list-item>

      <n-list-item v-if="createStatus.dwb.tableName !==''">
        <n-space class="pl-2">
          <n-spin :size="14" v-if="createStatus.dwb.isCreating"/>
          <div>{{ createStatus.dwb.tableName }}</div>
          <n-space v-if="!createStatus.dwb.isCreating">
            <n-icon :size="20" color="#0e7a0d" v-if="createStatus.dwb.isSuccess">
              <CheckmarkSharp/>
            </n-icon>
            <n-icon :size="20" color="rgb(205 19 19)" v-else>
              <CloseSharp/>
            </n-icon>
            {{ createStatus.dwb.msg }}
          </n-space>
        </n-space>
      </n-list-item>

      <n-list-item v-if="createStatus.tempDwb.tableName !==''">
        <n-space class="pl-2">
          <n-spin :size="14" v-if="createStatus.tempDwb.isCreating"/>
          <div>{{ createStatus.tempDwb.tableName }}</div>
          <n-space v-if="!createStatus.tempDwb.isCreating">
            <n-icon :size="20" color="#0e7a0d" v-if="createStatus.tempDwb.isSuccess">
              <CheckmarkSharp/>
            </n-icon>
            <n-icon :size="20" color="rgb(205 19 19)" v-else>
              <CloseSharp/>
            </n-icon>
            {{ createStatus.tempDwb.msg }}
          </n-space>
        </n-space>
      </n-list-item>
    </n-list>
  </n-card>
</template>

<script setup lang="ts">
import {find_by_project_id, get_table_sql} from "@render/api/auxiliaryDb";
import {create_table} from "@render/api/datacenter";
import {projectIdOptions} from "@render/typings/datacenterOptions";
import {CheckmarkSharp, CloseSharp} from '@vicons/ionicons5'
import {cloneDeep} from "lodash-es";
import {FormInst, SelectGroupOption, SelectOption} from "naive-ui";
import {format} from "sql-formatter";
import {onMounted, ref} from "vue";

const tableNameOptions = ref<Array<SelectOption | SelectGroupOption>>()

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  tableSqlId: '',
  projectId: '',
  hasOptCol: true,
  tableGroupValue: [
    "temp_ods",
    "ods",
    "right_dwd",
    "error_dwd",
    "dwb"
  ]
})

const rules = {
  projectId: {
    required: true,
    trigger: ['change'],
    message: '请选择项目'
  },
  tableSqlId: {
    required: true,
    trigger: ['input'],
    message: '请输入表名'
  }
}

onMounted(() => {
  get_table_sql().then((res) => {
    tableNameOptions.value = res?.map(
        (v => ({
          label: `${v.tableName}(${v.comment})`,
          value: v.id.toString(),
          sql: v.sql,
          tableName: v.tableName.toLowerCase()
        }))
    ) || []
  })

})

const createStatusInitData = {
  tempOds: {
    isCreating: false,
    isSuccess: false,
    tableName: '',
    msg: ''
  },
  ods: {
    isCreating: false,
    isSuccess: false,
    tableName: '',
    msg: ''
  },
  rightDwd: {
    isCreating: false,
    isSuccess: false,
    tableName: '',
    msg: ''
  },
  errorDwd: {
    isCreating: false,
    isSuccess: false,
    tableName: '',
    msg: ''
  },
  dwb: {
    isCreating: false,
    isSuccess: false,
    tableName: '',
    msg: ''
  },
  tempDwb: {
    isCreating: false,
    isSuccess: false,
    tableName: '',
    msg: ''
  }
}

const createStatus = ref(createStatusInitData)

const createTables = () => {

  createStatus.value = createStatusInitData

  formRef.value?.validate(async (errors) => {
    if (!errors) {

      const tableAbbr = (await find_by_project_id(formModel.value.projectId))?.tableAbbr
      const tableSql = tableNameOptions.value.find(option => option.value === formModel.value.tableSqlId)

      if (formModel.value.tableGroupValue.find(item => item === 'temp_ods')[0]) {
        await tempOdsCreate(tableAbbr, tableSql)
      }

      if (formModel.value.tableGroupValue.find(item => item === 'ods')[0]) {
        await odsCreate(tableAbbr, tableSql)
      }

      if (formModel.value.tableGroupValue.find(item => item === 'right_dwd')[0]) {
        await rightDwdCreate(tableAbbr, tableSql)
      }

      if (formModel.value.tableGroupValue.find(item => item === 'error_dwd')[0]) {
        await errorDwdCreate(tableAbbr, tableSql)
      }

      if (formModel.value.tableGroupValue.find(item => item === 'dwb')[0]) {
        await dwbCreate(tableAbbr, tableSql)
      }

      if (formModel.value.tableGroupValue.find(item => item === 'temp_dwb')[0]) {
        await tempDwbCreate(tableAbbr, tableSql)
      }

    } else {
      console.log(errors)
    }
  })
}

const paramsModel = {
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

const tempOdsCreate = async (tableAbbr, tableSql) => {
  let paramsJson = cloneDeep(paramsModel)

  paramsJson.namedJson = JSON.stringify([
    {
      id: 1,
      table: "更新方式",
      key: "DI",
      value: "增量表",
      saveValue: null,
      flagUser: 1
    },
    {
      id: '1638446496908140546',
      table: "组织机构",
      key: tableAbbr,
      value: (await find_by_project_id(formModel.value.projectId)).projectName.replace(/行政行为/g, '').replace(/数据归集/g, ''),
      saveValue: null,
      flagUser: 1
    }, {
      id: '2',
      table: "自定义内容",
      key: `${tableSql.tableName}_temp`,
      value: null,
      saveValue: null,
      flagUser: 0,
      selectList: []
    }, {
      id: "1640177719367512066",
      table: "数据层级",
      key: "ODS",
      value: "原始数据层",
      saveValue: null,
      flagUser: 1,
    }
  ])

  paramsJson.tableName = `di_${tableAbbr}_${tableSql.tableName}_temp_ods`
  paramsJson.ddlSql = `CREATE TABLE ${paramsJson.tableName} ${tableSql.sql}`

  createStatus.value.tempOds.isCreating = true
  createStatus.value.tempOds.tableName = paramsJson.tableName

  create_table(paramsJson).then((res) => {
    createStatus.value.tempOds.isSuccess = res.success && res.code == 200;
    createStatus.value.tempOds.msg = res.message
  }).finally(() => createStatus.value.tempOds.isCreating = false)
}

const odsCreate = async (tableAbbr, tableSql) => {
  let paramsJson = cloneDeep(paramsModel)

  paramsJson.namedJson = JSON.stringify([
    {
      id: 1,
      table: "更新方式",
      key: "DI",
      value: "增量表",
      saveValue: null,
      flagUser: 1
    },
    {
      id: '1638446496908140546',
      table: "组织机构",
      key: tableAbbr,
      value: (await find_by_project_id(formModel.value.projectId)).projectName.replace(/行政行为/g, '').replace(/数据归集/g, ''),
      saveValue: null,
      flagUser: 1
    }, {
      id: '2',
      table: "自定义内容",
      key: `${tableSql.tableName}`,
      value: null,
      saveValue: null,
      flagUser: 0,
      selectList: []
    }, {
      id: "1640177719367512066",
      table: "数据层级",
      key: "ODS",
      value: "原始数据层",
      saveValue: null,
      flagUser: 1,
    }
  ])

  paramsJson.tableName = `di_${tableAbbr}_${tableSql.tableName}_ods`
  paramsJson.ddlSql = `CREATE TABLE ${paramsJson.tableName} ${tableSql.sql}`

  createStatus.value.ods.isCreating = true
  createStatus.value.ods.tableName = paramsJson.tableName

  create_table(paramsJson).then((res) => {
    createStatus.value.ods.isSuccess = res.success && res.code == 200;
    createStatus.value.ods.msg = res.message
  }).finally(() => createStatus.value.ods.isCreating = false)
}

const rightDwdCreate = async (tableAbbr, tableSql) => {
  let paramsJson = cloneDeep(paramsModel)

  paramsJson.namedJson = JSON.stringify([
    {
      id: 1,
      table: "更新方式",
      key: "DI",
      value: "增量表",
      saveValue: null,
      flagUser: 1
    },
    {
      id: '1638446496908140546',
      table: "组织机构",
      key: tableAbbr,
      value: (await find_by_project_id(formModel.value.projectId)).projectName.replace(/行政行为/g, '').replace(/数据归集/g, ''),
      saveValue: null,
      flagUser: 1
    }, {
      id: '2',
      table: "自定义内容",
      key: `${tableSql.tableName}_right`,
      value: null,
      saveValue: null,
      flagUser: 0,
      selectList: []
    }, {
      id: "1640177719367512066",
      table: "数据层级",
      key: "DWD",
      value: "数据明细层",
      saveValue: null,
      flagUser: 1,
    }
  ])

  paramsJson.tableName = `di_${tableAbbr}_${tableSql.tableName}_right_dwd`
  paramsJson.ddlSql = `CREATE TABLE ${paramsJson.tableName} ${tableSql.sql}`

  createStatus.value.rightDwd.isCreating = true
  createStatus.value.rightDwd.tableName = paramsJson.tableName

  create_table(paramsJson).then((res) => {
    createStatus.value.rightDwd.isSuccess = res.success && res.code == 200;
    createStatus.value.rightDwd.msg = res.message
  }).finally(() => createStatus.value.rightDwd.isCreating = false)
}
const errorDwdCreate = async (tableAbbr, tableSql) => {
  let paramsJson = cloneDeep(paramsModel)

  paramsJson.namedJson = JSON.stringify([
    {
      id: 1,
      table: "更新方式",
      key: "DI",
      value: "增量表",
      saveValue: null,
      flagUser: 1
    },
    {
      id: '1638446496908140546',
      table: "组织机构",
      key: tableAbbr,
      value: (await find_by_project_id(formModel.value.projectId)).projectName.replace(/行政行为/g, '').replace(/数据归集/g, ''),
      saveValue: null,
      flagUser: 1
    }, {
      id: '2',
      table: "自定义内容",
      key: `${tableSql.tableName}_error`,
      value: null,
      saveValue: null,
      flagUser: 0,
      selectList: []
    }, {
      id: "1640177719367512066",
      table: "数据层级",
      key: "DWD",
      value: "数据明细层",
      saveValue: null,
      flagUser: 1,
    }
  ])

  paramsJson.tableName = `di_${tableAbbr}_${tableSql.tableName}_error_dwd`
  paramsJson.ddlSql = `CREATE TABLE ${paramsJson.tableName} ${tableSql.sql}`

  createStatus.value.errorDwd.isCreating = true
  createStatus.value.errorDwd.tableName = paramsJson.tableName

  create_table(paramsJson).then((res) => {
    createStatus.value.errorDwd.isSuccess = res.success && res.code == 200;
    createStatus.value.errorDwd.msg = res.message
  }).finally(() => createStatus.value.errorDwd.isCreating = false)
}
const dwbCreate = async (tableAbbr, tableSql) => {
  let paramsJson = cloneDeep(paramsModel)

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
      key: tableAbbr,
      value: (await find_by_project_id(formModel.value.projectId)).projectName.replace(/行政行为/g, '').replace(/数据归集/g, ''),
      saveValue: null,
      flagUser: 1
    }, {
      id: '2',
      table: "自定义内容",
      key: `${tableSql.tableName}`,
      value: null,
      saveValue: null,
      flagUser: 0,
      selectList: []
    }, {
      id: "1640177719367512066",
      table: "数据层级",
      key: "DWB",
      value: "基础数据层",
      saveValue: null,
      flagUser: 1,
    }
  ])

  paramsJson.tableName = `df_${tableAbbr}_${tableSql.tableName}_dwb`

  if (formModel.value.hasOptCol) {
    paramsJson.ddlSql = format(addFieldsToSql(`CREATE TABLE ${paramsJson.tableName} ${tableSql.sql}`))
  } else {
    paramsJson.ddlSql = `CREATE TABLE ${paramsJson.tableName} ${tableSql.sql}`
  }

  createStatus.value.dwb.isCreating = true
  createStatus.value.dwb.tableName = paramsJson.tableName

  create_table(paramsJson).then((res) => {
    createStatus.value.dwb.isSuccess = res.success && res.code == 200;
    createStatus.value.dwb.msg = res.message
    if (!createStatus.value.dwb.isSuccess) {
      console.log(res)
    }
  }).finally(() => createStatus.value.dwb.isCreating = false)
}
const tempDwbCreate = async (tableAbbr, tableSql) => {
  let paramsJson = cloneDeep(paramsModel)

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
      key: tableAbbr,
      value: (await find_by_project_id(formModel.value.projectId)).projectName.replace(/行政行为/g, '').replace(/数据归集/g, ''),
      saveValue: null,
      flagUser: 1
    }, {
      id: '2',
      table: "自定义内容",
      key: `${tableSql.tableName}_temp`,
      value: null,
      saveValue: null,
      flagUser: 0,
      selectList: []
    }, {
      id: "1640177719367512066",
      table: "数据层级",
      key: "DWB",
      value: "基础数据层",
      saveValue: null,
      flagUser: 1,
    }
  ])

  paramsJson.tableName = `df_${tableAbbr}_${tableSql.tableName}_temp_dwb`

  if (formModel.value.hasOptCol) {
    paramsJson.ddlSql = format(addFieldsToSql(`CREATE TABLE ${paramsJson.tableName} ${tableSql.sql}`))
  } else {
    paramsJson.ddlSql = `CREATE TABLE ${paramsJson.tableName} ${tableSql.sql}`
  }

  createStatus.value.dwb.isCreating = true
  createStatus.value.dwb.tableName = paramsJson.tableName

  create_table(paramsJson).then((res) => {
    createStatus.value.dwb.isSuccess = res.success && res.code == 200;
    createStatus.value.dwb.msg = res.message
    if (!createStatus.value.dwb.isSuccess) {
      console.log(res)
    }
  }).finally(() => createStatus.value.dwb.isCreating = false)
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

</script>

<style scoped>

</style>
