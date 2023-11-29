<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 170px);" trigger="hover">
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
          <n-form-item-gi
              :span="12"
              path="tableGroupValue"
          >
            <n-checkbox-group
                v-model:value="formModel.tableGroupValue"
            >

              <n-space vertical>
                <n-space>
                  <n-checkbox value="di_{PROJECT}_{TABLE_NAME}_temp_ods">
                    ODS层临时表
                  </n-checkbox>
                  <n-checkbox value="di_{PROJECT}_{TABLE_NAME}_ods">
                    ODS层备份表
                  </n-checkbox>
                </n-space>
                <n-space>
                  <n-checkbox value="di_{PROJECT}_{TABLE_NAME}_right_dwd">
                    DWD层合格表
                  </n-checkbox>
                  <n-checkbox value="di_{PROJECT}_{TABLE_NAME}_error_dwd">
                    DWD层不合格表
                  </n-checkbox>
                </n-space>
                <n-space>
                  <n-checkbox value="df_{PROJECT}_{TABLE_NAME}_dwb">
                    DWB层融合表
                  </n-checkbox>
                  <n-checkbox value="df_{PROJECT}_{TABLE_NAME}_right_dwb">
                    DWB层合格表
                  </n-checkbox>
                  <n-checkbox value="df_{PROJECT}_{TABLE_NAME}_error_dwb">
                    DWB层不合格表
                  </n-checkbox>
                </n-space>
                <n-space>
                  <n-checkbox value="df_{PROJECT}_{TABLE_NAME}_odstj_dws">
                    DWS层ODS数据量统计表
                  </n-checkbox>
                </n-space>
                <n-space>
                  <n-checkbox value="df_{PROJECT}_{TABLE_NAME}_dm">
                    DM层全量表
                  </n-checkbox>
                </n-space>

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

        <n-list-item v-for="item in createStatus.values()">
          <n-space class="pl-2">
            <n-spin :size="14" v-if="item.isCreating"/>
            <div>{{ item.tableName }}</div>
            <n-space v-if="!item.isCreating">
              <n-icon :size="20" color="#0e7a0d" v-if="item.isSuccess">
                <CheckmarkSharp/>
              </n-icon>
              <n-icon :size="20" color="rgb(205 19 19)" v-else>
                <CloseSharp/>
              </n-icon>
              {{ item.msg }}
              <n-button text type="info"
                        v-if="!item.isSuccess"
                        @click="deleteTableRebuild(item.tableName)"
              >删除重建
              </n-button>
            </n-space>
          </n-space>
        </n-list-item>

      </n-list>
    </n-card>
  </n-scrollbar>
</template>

<script setup lang="ts">
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {create_table, get_tables_info_page, table_delete} from "@render/api/datacenter.api";
import {find_by_project_id} from "@render/api/auxiliaryDb/projectInfo.api";
import {projectIdOptions} from "@render/typings/datacenterOptions";
import {CheckmarkSharp, CloseSharp} from '@vicons/ionicons5'
import {cloneDeep} from "lodash-es";
import {FormInst, SelectOption} from "naive-ui";
import {format} from "sql-formatter";
import {onMounted, ref} from "vue";

const tableNameOptions = ref<Array<SelectOption>>()

const formRef = ref<FormInst | null>(null);

const formModel = ref({
  tableSqlId: '',
  projectId: '',
  tableGroupValue: [
    "di_{PROJECT}_{TABLE_NAME}_temp_ods",
    "di_{PROJECT}_{TABLE_NAME}_ods",
    "di_{PROJECT}_{TABLE_NAME}_right_dwd",
    "di_{PROJECT}_{TABLE_NAME}_error_dwd",
    "df_{PROJECT}_{TABLE_NAME}_dwb",
    "df_{PROJECT}_{TABLE_NAME}_right_dwb",
    "df_{PROJECT}_{TABLE_NAME}_error_dwb",
    "df_{PROJECT}_{TABLE_NAME}_odstj_dws"
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
        ((v: {
          tableName: string;
          comment: any;
          id: {
            toString: () => any;
          };
          sql: any;
        }) => ({
          label: `${v.tableName}(${v.comment})`,
          value: v.id.toString(),
          sql: v.sql,
          tableName: v.tableName.toLowerCase()
        }))
    ) || []
  })

})

type CreateStatus = {
  tableName: string,
  isCreating: boolean,
  isSuccess: boolean,
  msg: string
}

const createStatus = ref<Map<string, CreateStatus>>(new Map<string, CreateStatus>())

const createTables = () => {

  createStatus.value = new Map<string, CreateStatus>()

  formRef.value?.validate(async (errors) => {
    if (!errors) {

      const projectTableAbbr = (await find_by_project_id(formModel.value.projectId))?.tableAbbr
      const tableSql = tableNameOptions.value.find(option => option.value === formModel.value.tableSqlId)

      formModel.value.tableGroupValue.forEach(table => {
        const tableName = table
            .replaceAll('{PROJECT}', projectTableAbbr)
            .replaceAll('{TABLE_NAME}', tableSql.tableName as string)

        if (tableName.includes('_odstj_dws')) {
          createOdsTjDwsTable(tableName)
        } else {
          createTable(tableName, tableSql, tableName.startsWith('df'))
        }

      })

    } else {
      console.error(errors)
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

const createTable = (tableName: string, tableSql: SelectOption, hasOptCol: boolean) => {
  let paramsJson = cloneDeep(paramsModel)
  paramsJson.namedJson = JSON.stringify([
    {
      id: 1,
      table: "更新方式",
      key: "自定义",
      value: "",
      saveValue: null,
      flagUser: 1
    },
    {
      id: '1638446496908140546',
      table: "组织机构",
      key: '自定义',
      value: '',
      saveValue: null,
      flagUser: 1
    }, {
      id: '2',
      table: "自定义内容",
      key: '自定义',
      value: null,
      saveValue: null,
      flagUser: 0,
      selectList: []
    }, {
      id: "1640177719367512066",
      table: "数据层级",
      key: "自定义",
      value: "",
      saveValue: null,
      flagUser: 1,
    }
  ])

  paramsJson.tableName = tableName

  if (hasOptCol) {
    paramsJson.ddlSql = format(addFieldsToSql(`CREATE TABLE ${tableName} ${tableSql.sql}`))
  } else {
    paramsJson.ddlSql = `CREATE TABLE ${tableName} ${tableSql.sql}`
  }

  createStatus.value.set(tableName, {
    tableName: tableName,
    isCreating: true,
    isSuccess: false,
    msg: '',
  })

  create_table(paramsJson).then((res) => {
    createStatus.value.set(tableName, {
      tableName: tableName,
      isCreating: false,
      isSuccess: res.success && res.code == 200,
      msg: res.message,
    })
  }).finally(() => {
    const newStatus = createStatus.value.get(tableName)
    newStatus.isCreating = false
    createStatus.value.set(tableName, newStatus)
  })
}

const createOdsTjDwsTable = (tableName: string) => {
  let paramsJson = cloneDeep(paramsModel)
  paramsJson.namedJson = JSON.stringify([
    {
      id: 1,
      table: "更新方式",
      key: "自定义",
      value: "",
      saveValue: null,
      flagUser: 1
    },
    {
      id: '1638446496908140546',
      table: "组织机构",
      key: '自定义',
      value: '',
      saveValue: null,
      flagUser: 1
    }, {
      id: '2',
      table: "自定义内容",
      key: '自定义',
      value: null,
      saveValue: null,
      flagUser: 0,
      selectList: []
    }, {
      id: "1640177719367512066",
      table: "数据层级",
      key: "自定义",
      value: "",
      saveValue: null,
      flagUser: 1,
    }
  ])

  paramsJson.tableName = tableName

  paramsJson.ddlSql = `
      CREATE TABLE ${tableName}
      (
        project_id   VARCHAR(24) COMMENT '上报单位归集项目ID标识',
        depart_name VARCHAR(128) COMMENT '上报单位部门名称',
        depart_area INT COMMENT '单位区划（1省直;2:地市）',
        table_type  VARCHAR(128) COMMENT '数据元类型',
        raw_data_volume INT COMMENT '原始数据量（根据业务主键ID、批次号去重）',
        distinct_data_volume INT COMMENT '推送数据量（根据业务主键ID去重）',
        create_time TIMESTAMP  COMMENT '统计时间'
      ) COMMENT 'ODS数据量统计记录表' ROW FORMAT DELIMITED FIELDS TERMINATED BY '|' STORED AS ORC`

  createStatus.value.set(tableName, {
    tableName: tableName,
    isCreating: true,
    isSuccess: false,
    msg: '',
  })

  create_table(paramsJson).then((res) => {
    createStatus.value.set(tableName, {
      tableName: tableName,
      isCreating: false,
      isSuccess: res.success && res.code == 200,
      msg: res.message,
    })
  }).finally(() => {
    const newStatus = createStatus.value.get(tableName)
    newStatus.isCreating = false
    createStatus.value.set(tableName, newStatus)
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

const deleteTableRebuild = async (tableName: string) => {
  const table = (await get_tables_info_page({
    size: 1,
    page: 1,
    sourceId: 6,
    likeValue: tableName
  })).data?.records || []

  if (table.length == 1) {

    window.$message.success("正在删除...")

    table_delete(table[0].id).then(async res => {
      if (res.code == 200 && res.success) {
        window.$message.success("删除成功")

        const tableSql = tableNameOptions.value.find(option => option.value === formModel.value.tableSqlId)

        createTable(tableName, tableSql, tableName.startsWith('df'))

      } else {
        window.$message.error(res.message)
      }
    })
  } else {
    window.$message.info(`${tableName}不存在`)
  }

}

</script>

<style scoped>

</style>
