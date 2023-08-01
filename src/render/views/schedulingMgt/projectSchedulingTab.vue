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
          >
            <template #prefix>
              <n-icon>
                <Search/>
              </n-icon>
            </template>
          </n-input>
          <n-button secondary type="info" @click="showCreateModal">
            新增
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
      >
      </n-data-table>

    </n-scrollbar>
  </n-layout>


  <n-modal
      v-model:show="showCreateModalRef"
      :mask-closable="false"
      :closable="true"
      preset="dialog"
      role="dialog"
      :show-icon="false"
      :title="modelTitle"
      :size="'small'"
      style="width: 566px"
  >

    <n-scrollbar class="pr-2" style="max-height: calc(100vh - 300px);" trigger="hover">
      <n-form
          class="mt-4"
          ref="cronConfigModalFormRef"
          :model="cronConfigModalFormModel"
          :rules="cronConfigModalFormRules"
          :size="'small'"
      >
        <n-grid :cols="10" :x-gap="4">
          <n-form-item-gi :span="10" label="项目" path="projectId">
            <n-select
                v-model:value="cronConfigModalFormModel.projectId"
                placeholder="选择项目"
                :options="modalProjectIdOptions"
                :loading="isProjectOptionsLoading"
                :consistent-menu-width="false"
                filterable
            />
          </n-form-item-gi>

          <n-form-item-gi :span="2" label="秒" path="sec" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="cronConfigModalFormModel.sec"
                     @keydown.enter.prevent readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="日" path="day" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="cronConfigModalFormModel.day"
                     @keydown.enter.prevent readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="月" path="month" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="cronConfigModalFormModel.month"
                     @keydown.enter.prevent readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="周" path="week" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="cronConfigModalFormModel.week"
                     @keydown.enter.prevent readonly
            />
          </n-form-item-gi>
          <n-form-item-gi :span="2" label="年" path="year" :label-style="{margin:'0 auto'}">
            <n-input class="text-center" v-model:value="cronConfigModalFormModel.year"
                     @keydown.enter.prevent readonly
            />
          </n-form-item-gi>

          <n-form-item-gi :span="5" label="起始分" path="min">
            <n-input-number v-model:value="cronConfigModalFormModel.min[0]" min="0" max="59"/>
          </n-form-item-gi>
          <n-form-item-gi :span="5" label="结束分" path="min">
            <n-input-number v-model:value="cronConfigModalFormModel.min[1]" min="0" max="59"/>
          </n-form-item-gi>

          <n-form-item-gi :span="10" label="时" path="hour">
            <n-input-group>
              <n-input v-model:value="cronConfigModalFormModel.hour[0]" readonly/>
              <n-input v-model:value="cronConfigModalFormModel.hour[1]" readonly>
                <template #suffix>
                  <n-button text type="default" ghost
                            @click="hourDecrease"
                            :disabled="parseInt(cronConfigModalFormModel.hour[0])<=0"
                  >
                    <template #icon>
                      <n-icon>
                        <RemoveOutline/>
                      </n-icon>
                    </template>
                  </n-button>

                  <n-button text type="default" ghost
                            @click="hourIncrease"
                            :disabled="parseInt(cronConfigModalFormModel.hour[0])>=12"
                  >
                    <template #icon>
                      <n-icon>
                        <AddOutline/>
                      </n-icon>
                    </template>
                  </n-button>
                </template>
              </n-input>

            </n-input-group>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
    <template #action>
      <n-button type="primary" :size="'small'" @click="onSave" :loading="isSaving">保存
      </n-button>
      <n-button :size="'small'" @click="showCreateModalRef=!showCreateModalRef">返回</n-button>
    </template>
  </n-modal>

</template>

<script setup lang="ts">
import {get_project_by_cj_cron_is_null, get_project_cj_cron, update_cj_cron} from "@render/api/auxiliaryDb";
import {projectIdOptions, projectIdOptionsUpdate} from "@render/typings/datacenterOptions";
import {isTimeConflict} from "@render/utils/common/cronUtils";
import {showButton, showConfirmation} from "@render/utils/datacenter/jobTabUtil";
import {Add, Refresh, RemoveOutline, AddOutline, Search} from '@vicons/ionicons5'
import {DataTableColumns, FormInst, NButton, NSpace, SelectGroupOption, SelectOption} from "naive-ui";
import {h, onMounted, reactive, ref} from "vue";

const isTableLoading = ref(false)

const tableDataRef = ref<Project[]>([])

type Project = {
  id: string
  projectName: string
  projectId: string
  cron: string
  comment: string
}

const queryParam = ref('')

onMounted(async () => {
  await tableDataInit(queryParam.value)
})

const tableDataInit = async (v: string) => {
  isTableLoading.value = true

  tableDataRef.value = (await get_project_cj_cron(v)).map((v => ({
    id: v.id,
    projectName: v.projectName,
    projectId: v.projectId,
    cron: v.cjCron
  })))

  isTableLoading.value = false
}

const createColumns = (): DataTableColumns<Project> => {
  return [
    {
      title: '项目名称',
      key: 'projectName',
      width: '25%'
    },
    {
      title: 'cron表达式',
      key: 'cron',
      width: '15%',
    },
    {
      title: '描述',
      key: 'comment',
      width: '20%',
      render(row: Project) {
        const minRange = row.cron.split(' ')[1]
        const hour = row.cron.split(' ')[2]
        return `任务在${hour.split(',')[0]}时与${hour.split(',')[1]}时的${minRange.split('-')[0]}分到${minRange.split('-')[1]}分执行`
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: '15%',
      align: 'center',
      render(row) {
        return h(NSpace, {
          justify: 'center'
        }, [
          showButton('编辑', () => {
            edit(row)
          }),
          showConfirmation('删除', () => {
            deleteConfig(row)
          })
        ])
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

const edit = (row: Project) => {
  modalTitle.value = '更新配置'
  modalProjectIdOptions.value = projectIdOptions
  cronConfigModalFormModel.value.projectId = row.projectId

  const min = row.cron.split(' ')[1]
  cronConfigModalFormModel.value.min = [parseInt(min.split('-')[0]), parseInt(min.split('-')[1])]

  const hour = row.cron.split(' ')[2]
  cronConfigModalFormModel.value.hour = [hour.split(',')[0], hour.split(',')[1]]

  showCreateModalRef.value = true
}

const deleteConfig = (row: Project) => {
  update_cj_cron({
    projectId: row.projectId,
    cron: null
  }).then(() => {
    window.$message.success('删除成功')
    tableDataInit()
  })

}

const showCreateModalRef = ref(false)
const modalTitle = ref('')
const cronConfigModalFormRef = ref<FormInst | null>(null);

const cronConfigModalFormModel = ref({
  projectId: '',
  sec: '*',
  min: [0, 5],
  hour: ['0', '12'],
  day: '?',
  month: '*',
  week: '*',
  year: '*',
  cron: ''
})

const cronConfigModalFormRules = ref({
  projectId: {
    required: true,
    trigger: ['change'],
    message: '请选择项目'
  },
  min: {
    validator() {
      if (cronConfigModalFormModel.value.min[0] > cronConfigModalFormModel.value.min[1]) {
        return new Error('起始分需小于等于结束分')
      }
      return true
    },
    type: 'number',
    trigger: ['blur', 'change', 'input'],
  },
  hour: {
    required: true
  }
})

const modalProjectIdOptions = ref<Array<SelectOption | SelectGroupOption>>([])

const isProjectOptionsLoading = ref(false)

const showCreateModal = async () => {

  cronConfigModalFormModel.value.projectId = ''
  cronConfigModalFormModel.value.min = [0, 5]
  cronConfigModalFormModel.value.hour = ['0', '12']

  isProjectOptionsLoading.value = true

  modalTitle.value = '新增配置'

  get_project_by_cj_cron_is_null(false).then(res => {
    // 已配置的项目
    const projectIds: string[] = res.map(project => project.projectId)
    projectIdOptionsUpdate().then(() => {
      modalProjectIdOptions.value = projectIdOptions.filter(project => !projectIds.includes(project.value as string))
    }).finally(() => isProjectOptionsLoading.value = false)
  })

  showCreateModalRef.value = true
}

const hourDecrease = () => {
  cronConfigModalFormModel.value.hour = cronConfigModalFormModel.value.hour.map(time => (parseInt(time) - 1).toString())
}

const hourIncrease = () => {
  cronConfigModalFormModel.value.hour = cronConfigModalFormModel.value.hour.map(time => (parseInt(time) + 1).toString())
}

const isSaving = ref(false)

const onSave = () => {
  isSaving.value = true

  cronConfigModalFormRef.value?.validate((errors) => {
    if (!errors) {
      cronConfigModalFormModel.value.cron = `* ${cronConfigModalFormModel.value.min.join('-')} ${cronConfigModalFormModel.value.hour.join(',')} ? * * *`;
      get_project_by_cj_cron_is_null(false)
          .then(res => {
            const crons: string[] = res.filter(project => project.projectId != cronConfigModalFormModel.value.projectId).map(project => project.cjCron)
            const conflictingExpressions = isTimeConflict(crons, cronConfigModalFormModel.value.cron)
            if (conflictingExpressions.length > 0) {

              let conflictingProjectsStr = ``

              conflictingExpressions.forEach(exp => {
                const project = res.find(project => project.cjCron === exp)
                conflictingProjectsStr += `${project.projectName}：${exp}\n`
              })

              window.$notification.create({
                title: "表达式执行时间冲突",
                content: `表达式[${cronConfigModalFormModel.value.cron}]与以下项目冲突:\n${conflictingProjectsStr}`,
                type: "error"
              })

              isSaving.value = false
            } else {
              update_cj_cron({
                projectName: projectIdOptions.find(option => option.value === cronConfigModalFormModel.value.projectId).label as string,
                projectId: cronConfigModalFormModel.value.projectId,
                cron: cronConfigModalFormModel.value.cron
              })
                  .then(() => {
                    showCreateModalRef.value = false
                    window.$message.success('保存成功')
                    tableDataInit()
                  })
                  .finally(() => isSaving.value = false)
            }

          })
          .catch(errors => {
            console.error(errors)
            isSaving.value = false
          })

    } else {
      isSaving.value = false
      console.error(errors)
    }
  })
}

</script>

<style scoped>

</style>
