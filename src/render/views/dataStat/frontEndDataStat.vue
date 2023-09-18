<template>
  <n-scrollbar class="pr-2" style="height: calc(100vh - 110px);" trigger="hover">
    <n-alert type="default" :show-icon="false">
      数据量来源于数源单位的中台备份表<B>去重</B>后的数据量<br>
    一次不要执行太多，会超时
    </n-alert>

    <n-card class="mt-2" :content-style="{paddingBottom:0}">
      <n-form ref="formRef"
              inline
              :size="'small'"
              :model="formModel"
              label-placement="left"
      >
        <n-grid :cols="10" :x-gap="12">
          <n-form-item-gi :span="10" label="数源单位选择">
            <n-tree-select
                v-model:value="formModel.tableSelect"
                multiple
                cascade
                checkable
                :check-strategy="'parent'"
                :options="orgSelectOptionsRef"
                :size="'small'"
                clearable
                :consistent-menu-width="false"
            />
          </n-form-item-gi>

        </n-grid>
      </n-form>

    </n-card>

    <n-space justify="center" align="center" class="mt-2">
      <n-button type="primary" class="w-28" @click="generateSql" :loading="isGenerating">生成SQL</n-button>
      <n-button type="primary" class="w-28" @click="execSql" :loading="isExecuting" :disabled="insertSql.length==0">
        执行SQL
      </n-button>
    </n-space>

    <n-input
        class="mt-2"
        v-model:value="insertSql"
        type="textarea"
        placeholder=""
        :autosize="{minRows:12,maxRows:12}"
        :loading="isGenerating"
    />

  </n-scrollbar>
</template>

<script setup lang="ts">
import {WorkflowType} from "@common/types";
import {getCurrentDateTime} from "@main/utils/dateUtils";
import {get_project_by_pro_abbr, get_project_info} from "@render/api/auxiliaryDb/projectInfo.api";
import {get_table_sql} from "@render/api/auxiliaryDb/tableSql.api";
import {exec_sql, get_workflow_page} from "@render/api/datacenter.api";
import {isEmpty} from "lodash-es";
import {FormInst, TreeSelectOption} from "naive-ui";
import {onMounted, ref} from "vue";
import {uuid} from "vue3-uuid";

onMounted(() => {
  orgSelectOptionsInit()
})

const formRef = ref<FormInst | null>(null);
const formModel = ref({
  tableSelect: []
})
const orgSelectOptionsRef = ref<TreeSelectOption[]>([])
const isGenerating = ref(false)
const insertSql = ref('')

const isExecuting = ref(false)
const orgSelectOptionsInit = async () => {
  orgSelectOptionsRef.value = [
    {
      label: '已备份单位',
      key: '0',
      children: []
    }
  ]

  const projectInfo = await get_project_info()
  //根据projectAbbr去重
  const uniqueProjects = Array.from(
      new Set(projectInfo.map(project => project.projectAbbr))
  ).map(projectAbbr => projectInfo.find(project => project.projectAbbr === projectAbbr));

  for (const project of uniqueProjects) {
    //查询所有带bf_的任务，即备份任务，确保该单位存在
    const bfJobs: WorkflowType[] = (await get_workflow_page({
      page: 1,
      size: 1000,
      status: null,
      procName: `bf_${project.projectAbbr}_`
    })).data?.records || []

    if (bfJobs.length > 0) {
      let treeItem = {
        label: project.projectName.replaceAll('数据归集', '').replaceAll('行政行为', ''),
        key: `project:${project.projectId}`,
        children: []
      }
      bfJobs.forEach(job => {
        const jobItem = {
          label: `${treeItem.label}-${job.procName.split('_')[2].toUpperCase()}`,
          key: `tableName:di_${project.tableAbbr}_${job.procName.split('_')[2].toLowerCase()}_ods`
        }
        treeItem.children.push(jobItem)
        treeItem.children.sort((a, b) => {
          const aSplit = a.label.split("-")[1]
          const bSplit = b.label.split("-")[1]
          return aSplit.localeCompare(bSplit);
        })
      })

      orgSelectOptionsRef.value[0].children.push(treeItem)
    }
  }

}

const generateSql = async () => {
  if (!isEmpty(formModel.value.tableSelect)) {
    isGenerating.value = true

    insertSql.value = `INSERT INTO xzzf_sjtj_front_end
    (id, depart_name, table_type, data_count, update_time)`

    if (formModel.value.tableSelect.length == 1 && formModel.value.tableSelect[0] == '0') {
      const departItems = orgSelectOptionsRef.value[0].children.map(node => node.children)
      for (const departTables of departItems) {
        for (const item of departTables) {
          insertSql.value += await generateSubSql(item)
        }
      }

    } else {
      for (const item of formModel.value.tableSelect) {
        if (item.startsWith('project:')) {
          const departItem = orgSelectOptionsRef.value[0].children.find(node => node.key == item)
          for (const item of departItem.children) {
            insertSql.value += await generateSubSql(item)
          }
        } else if (item.startsWith('tableName:')) {
          const tableName = item.split(':')[1]
          const pColName = (await get_table_sql({
            tableName: tableName.split('_')[2]
          }))[0].pColName
          const departName = (await get_project_by_pro_abbr(tableName.split('_')[1]))
              .projectName.replaceAll('数据归集', '').replaceAll('行政行为', '')
          insertSql.value += `
            SELECT '${uuid.v4()}',
                   '${departName}',
                   '${tableName.split('_')[2].toUpperCase()}',
                   COUNT(DISTINCT t1.${pColName}),
                   '${getCurrentDateTime()}'
            FROM ${tableName} t1
                   INNER JOIN (SELECT ${pColName}, MAX(cd_time) AS max_cd_time
                               FROM ${tableName}
                               GROUP BY ${pColName}) t2
                              ON t1.${pColName} = t2.${pColName} AND t1.cd_time = t2.max_cd_time
            UNION ALL`
        }
      }
    }

    isGenerating.value = false

    insertSql.value = insertSql.value.split('\n').slice(0, -1).join('\n');

  } else {
    window.$message.error('请选择数源单位表')
  }

}

const generateSubSql = async (item: TreeSelectOption) => {
  const pColName = (await get_table_sql({
    tableName: item.label.split('-')[1]
  }))[0].pColName
  return `
    SELECT '${uuid.v4()}',
           '${item.label.split('-')[0]}',
           '${item.label.split('-')[1]}',
           COUNT(DISTINCT t1.${pColName}),
           '${getCurrentDateTime()}'
    FROM ${item.key.toString().split(':')[1]} t1
           INNER JOIN (SELECT ${pColName}, MAX(cd_time) AS max_cd_time
                       FROM ${item.key.toString().split(':')[1]}
                       GROUP BY ${pColName}) t2
                      ON t1.${pColName} = t2.${pColName} AND t1.cd_time = t2.max_cd_time
    UNION ALL`
}

const execSql = async () => {
  isExecuting.value = true

  let paramModel = {
    sourceId: '6',
    dbType: 'tbds-hive',
    sourceName: '',
    dataTierCode: '',
    dataTierName: '',
    namedJson: '',
    datamodelTableFieldsVoList: [],
    lifeCycle: '1',
    ddlSql: insertSql.value,
    tableName: 'execSql'
  }

  await exec_sql(paramModel).then((res) => {
    if ((res.code == 500 && res.message === '服务器内部错误') || (res.code == 200 && res.success)) {
      window.$message.success('执行成功')
    } else {
      window.$dialog.error({
        title: '执行失败',
        content: res.message.replace(/建表失败，/g, ''),
        positiveText: '确定'
      });
    }

  }).finally(() => {
    isExecuting.value = false
  })

}

</script>

<style scoped>

</style>
