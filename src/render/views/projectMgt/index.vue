<template>
  <n-layout class="m-2">
    <n-scrollbar class="pr-2" style="height: calc(100vh - 42px);" trigger="hover">
      <n-alert type="default" :show-icon="false">
        在这里对整个中台任务进行管理
      </n-alert>

      <n-layout has-sider style="height: calc(100vh - 92px);">
        <n-layout-sider content-style="padding: 12px;overflow:hidden">
          <n-input v-model:value="pattern" placeholder="搜索">
            <template #prefix>
              <n-icon :component="Search"/>
            </template>
            <template #suffix>
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button text type="default" ghost
                            @click="filterNode = !filterNode"
                  >
                    <n-icon>
                      <Filter v-show="filterNode"/>
                      <FilterOff v-show="!filterNode"/>
                    </n-icon>
                  </n-button>
                </template>
                是否过滤无关节点
              </n-tooltip>
            </template>
          </n-input>
          <n-tree
              class="mt-2 pr-2"
              block-line
              :data="data"
              expand-on-click
              selectable
              :pattern="pattern"
              :show-irrelevant-nodes="!filterNode"
              :node-props="nodeProps"
              virtual-scroll
              @load="handleLoad"
              style="height: calc(100vh - 150px);"
              :default-expanded-keys="['-1']"
              :default-selected-keys="['0-6-G1010']"
          />
        </n-layout-sider>
        <n-layout-content content-style="padding: 12px;border-left: 1px solid rgb(237 237 237)">
          <n-tabs type="line" animated>
            <n-tab-pane name="1" tab="数据归集任务">
              <job-tab :node="curNode" :tree-Data="data"/>
            </n-tab-pane>
<!--            <n-tab-pane name="2" tab="中台相关表">

            </n-tab-pane>
            <n-tab-pane name="3" tab="执行日志">

            </n-tab-pane>-->
          </n-tabs>
        </n-layout-content>
      </n-layout>
    </n-scrollbar>
  </n-layout>
</template>

<script setup lang="ts">
import {find_by_project_id, get_table_sql} from "@render/api/auxiliaryDb";
import {get_cj_job_page, get_sched_job_page, get_workflow_page} from "@render/api/datacenter";
import {projectIdOptions, projectIdOptionsUpdate} from "@render/typings/datacenterOptions";
import JobTab from "@render/views/projectMgt/jobTab.vue";
import {h, onMounted, reactive, ref} from 'vue'
import {DataTableColumns, NButton, TreeOption} from 'naive-ui'
import {Refresh, Search} from '@vicons/ionicons5'
import {Filter, FilterOff} from '@vicons/tabler'

const basicTableAbbrs = ['g1010', 'g1020', 'y2010', 'y2020', 'y2030', 'y3010', 'y4010', 'z2010', 'z2020',
  'z2030', 'z2050', 'z3010', 'f2010', 'f2010', 'f2020', 'f1010', 'f1011', 'f1012', 'f1016', 'f3010', 'f3011',
  'd1010', 'd1020', 'd1030', 'd1040']

const pattern = ref('')

const filterNode = ref(false)

// 当前选中节点
const curNode = ref(null)

const data = ref<TreeOption[]>([
  {
    label: '全省数据归集',
    key: '-1',
    children: [{
      label: '基础数据归集',
      key: '0',
      children: [
        {
          label: '广东省司法厅数据归集',
          key: '0-6',
          children: [
            {
              label: 'G1010',
              key: '0-6-G1010',
              isLeaf: true
            }, {
              label: 'G1020',
              key: '0-6-G1020',
              isLeaf: true
            }, {
              label: 'Z2010',
              key: '0-6-Z2010',
              isLeaf: true
            }, {
              label: 'Z2020',
              key: '0-6-Z2020',
              isLeaf: true
            }, {
              label: 'Z2030',
              key: '0-6-Z2030',
              isLeaf: true
            }, {
              label: 'Z2050',
              key: '0-6-Z2050',
              isLeaf: true
            }, {
              label: 'Z3010',
              key: '0-6-Z3010',
              isLeaf: true
            }, {
              label: 'Y2010',
              key: '0-6-Y2010',
              isLeaf: true
            }, {
              label: 'Y2020',
              key: '0-6-Y2020',
              isLeaf: true
            }, {
              label: 'Y2030',
              key: '0-6-Y2030',
              isLeaf: true
            }, {
              label: 'Y3010',
              key: '0-6-Y3010',
              isLeaf: true
            }, {
              label: 'Y4010',
              key: '0-6-Y4010',
              isLeaf: true
            },
          ]
        },
        {
          label: '广东省政务服务数据管理局数据归集',
          key: '0-11',
          children: [
            {
              label: 'F1010',
              key: '0-11-F1010',
              isLeaf: true
            }, {
              label: 'F1011',
              key: '0-11-F1011',
              isLeaf: true
            }, {
              label: 'F1012',
              key: '0-11-F1012',
              isLeaf: true
            }, {
              label: 'F1016',
              key: '0-11-F1016',
              isLeaf: true
            },
            {
              label: 'F2010',
              key: '0-11-F2010',
              isLeaf: true
            }, {
              label: 'F2020',
              key: '0-11-F2020',
              isLeaf: true
            },
          ]
        },
        {
          label: '广东省市场监督管理局数据归集',
          key: '0-5',
          children: [
            {
              label: 'F3010',
              key: '0-5-F3010',
              isLeaf: true
            }, {
              label: 'F3011',
              key: '0-5-F3011',
              isLeaf: true
            },
            {
              label: 'D1010',
              key: '0-5-D1010',
              isLeaf: true
            }, {
              label: 'D1020',
              key: '0-5-D1020',
              isLeaf: true
            }, {
              label: 'D1030',
              key: '0-5-D1030',
              isLeaf: true
            }, {
              label: 'D1040',
              key: '0-5-D1040',
              isLeaf: true
            }
          ]
        }
      ]
    },
      {
        label: '行为数据归集',
        key: '1',
        children: [
          {
            label: '省直行为数据',
            key: '1-0',
            isLeaf: false
          },
          {
            label: '地市行为数据',
            key: '1-1',
            isLeaf: false
          }
        ]
      },
      {
        label: '其他',
        key: '2'
      }]
  }
])

onMounted(() => {
  projectIdOptionsUpdate()
})

const handleLoad = (node: TreeOption) => {
  return new Promise<void>(async (resolve) => {
    if (node.key.toString() === '1-0') {
      // 省直
      node.children = projectIdOptions.filter((element) =>
          !["5", "6", "11"].includes(element.value as string) &&
          (element.label as string).includes('数据归集') &&
          (element.label as string).includes('广东省')
      ).map((element) => ({
        label: element.label,
        key: `${node.key}-${element.value}`,
        isLeaf: false
      })) as TreeOption[]
    } else if (node.key.toString() === '1-1') {
      // 地市
      node.children = projectIdOptions.filter((element) =>
          !["5", "6", "11"].includes(element.value as string) &&
          (element.label as string).includes('数据归集') &&
          !(element.label as string).includes('广东省') &&
          (element.label as string).includes('市')
      ).map((element) => ({
        label: element.label,
        key: `${node.key}-${element.value}`,
        isLeaf: false
      })) as TreeOption[]
    } else {
      const projectId = node.key.toString().split('-')[2]
      const projectAbbr = (await find_by_project_id(projectId))?.projectAbbr || ''
      if (projectAbbr !== '') {

        //工作流任务
        const workflowJobs = (await get_workflow_page({
          page: 1,
          size: 10000,
          status: null,
          procName: projectAbbr
        })).data.records.filter(element => element.projectId == projectId).map((v) => ({
          tableAbbr: v.procName.split('_')[2]
        })).filter((obj, index, array) => {
          return index === array.findIndex(item => item.tableAbbr === obj.tableAbbr);
        })

        // 采集任务
        const cjJobs = (await get_cj_job_page({
          current: 1,
          size: 10000,
          blurry: projectAbbr,
          subsystemName: "采集"
        })).data.records.map((v) => ({
          tableAbbr: v.jobDesc.split('_')[2]
        })).filter(item => !basicTableAbbrs.includes(item.tableAbbr.toLowerCase())).filter((obj, index, array) => {
          return index === array.findIndex(item => item.tableAbbr === obj.tableAbbr);
        })

        //调度任务
        const SchedJobs = (await get_sched_job_page(
            1,
            10000,
            projectAbbr,
        )).data.records.map((v) => ({
          tableAbbr: v.jobContent.split('_')[2]
        })).filter(item => !basicTableAbbrs.includes(item.tableAbbr.toLowerCase())).filter((obj, index, array) => {
          return index === array.findIndex(item => item.tableAbbr === obj.tableAbbr);
        })

        const newArr = Array.from(new Set([...workflowJobs, ...cjJobs, ...SchedJobs])).filter((obj, index, array) => {
          return index === array.findIndex(item => item.tableAbbr === obj.tableAbbr);
        })

        node.children = newArr.map((v) => ({
          label: v.tableAbbr.toUpperCase(),
          key: `${node.key}-${v.tableAbbr}`,
          isLeaf: true
        })) as TreeOption[]
      } else {
        node.children = []
      }
    }
    resolve()
  })
}

const nodeProps = ({option}: { option: TreeOption }) => {
  return {
    onClick() {
      if (option.isLeaf) {
        curNode.value = option.key
      }
    },
    onContextmenu(e: MouseEvent): void {
      e.preventDefault()
    }
  }
}

</script>

<style scoped>

</style>
