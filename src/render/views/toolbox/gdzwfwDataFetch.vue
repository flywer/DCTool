<template>
  <n-flex justify="center">
    <n-button type="primary" @click="handleFetch" :loading="isFetching">{{ buttonText }}</n-button>
  </n-flex>
</template>

<script setup lang="ts">
import {ZwfwOrgNode, ZwfwOrgTask, ZwfwOrgTaskType, ZwfwTaskType} from "@common/types/Gdzwfw";
import {fetch_org_node, fetch_task_type_list} from "@render/api/GdZwfw.api";
import {ref} from "vue";
import {export_gdZwfw_org_task_type} from "@render/api/xlsx.api";

const buttonText = ref('获取数据')
const isFetching = ref(false)

const handleFetch = () => {

  isFetching.value = true

  // 使用方法
  fetchAllTaskTypeLists("440000")
      .then(async data => {
        buttonText.value = `正在导出数据...`
        await export_gdZwfw_org_task_type(data)
      })
      .catch(error => {
        console.error('出错了:', error)
      })
      .finally(() => {
        isFetching.value = false
        buttonText.value = '获取数据'
      })
}

const fetchAllTaskTypeLists = async (regCode: string): Promise<any[]> => {
  // 先获取顶级 ZwfwOrgNode 数据
  const topLevelNode: ZwfwOrgNode = await fetch_org_node(regCode);
  // 执行递归函数获取所有数据
  return await fetchAllTaskTypeListsForNode(topLevelNode);
}

const fetchAllTaskTypeListsForNode = async (orgNode: ZwfwOrgNode): Promise<any[]> => {
  buttonText.value = `正在获取[${orgNode.currentArr.slice(-1).map(v => v.ORGNAME).join('/')}]数据...`

  let results: ZwfwOrgTask[] = [];

  // 递归异步函数来处理 ZwfwOrgNode
  const fetchRecursive = async (node: ZwfwOrgNode) => {
    // 处理当前 node 的 department
    for (const department of node.department) {
      await sleep(500)
      const taskType = await fetchTaskTypeList(department.ORGNUMBER);
      results.push({
        orgName: department.ORGNAME,
        orgAreaCode: department.ORGAREACODE,
        province: department.province,
        city: department.city,
        county: department.county,
        taskType: taskType
      });
    }
    // 递归处理当前 node 的 hall，需要每次先使用 fetchOrgNode 获取数据
    for (const hallItem of node.hall) {
      await sleep(500)
      const newNode: ZwfwOrgNode = await fetch_org_node(hallItem.ORGAREACODE);

      // 街道无部门，无需统计
      if (newNode.currentArr.length <= 3) {
        buttonText.value = `正在获取[${newNode.currentArr.slice(-1).map(v => v.ORGNAME).join('/')}]数据...`

        await fetchRecursive(newNode);
      }
    }
  };

  // 开始递归处理
  await fetchRecursive(orgNode);

  return results;
}

const fetchTaskTypeList = async (orgNumber: string) => {
  const list = await fetch_task_type_list(orgNumber)

  // 初始化B为一个每个属性都为false的对象
  let result: ZwfwOrgTaskType = {
    AL: false,
    AP: false,
    AF: false,
    AE: false,
    AG: false,
    AC: false,
    ACQ: false,
    AA: false,
    AFJ: false
  }

  // 对A的每个属性检查ZwfwTaskType，并更新B对象
  for (const key in list) {
    if (list.hasOwnProperty(key)) {
      // 使用反向查找，根据值找到zwfwTaskType的键
      const taskTypeKey = Object.keys(ZwfwTaskType).find(k => ZwfwTaskType[k as keyof typeof ZwfwTaskType] === key);
      if (taskTypeKey) {
        result[taskTypeKey as keyof ZwfwOrgTaskType] = true;
      }
    }
  }

  return result
}

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

</script>

<style scoped>

</style>
