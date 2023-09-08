<template>
  <n-layout>
    <div ref="g6Container" id="g6Container" class="bg-gray-100" style="height: calc(100vh - 110px);overflow: auto"/>
    <div id="minimapContainer" class="absolute right-2 bottom-2 opacity-80" style="background-color: #ededed"/>
    <div id="toolbarContainer" class="absolute right-2 top-2 opacity-95 w-auto h-auto bg-white p-1 rounded">
      <n-space :size="'small'">
        <n-input-group>
          <n-select
              :size="'small'"
              v-model:value="queryParam"
              :options="nodesOptionsRef"
              placeholder="节点搜索"
              filterable
              clearable
              remote
              @search="nodesOptionsUpdate"
              @update:value="nodeFocus"
              :consistent-menu-width="false"
          />
        </n-input-group>
      </n-space>
    </div>
  </n-layout>

</template>

<script setup lang="ts">
import G6, {Graph, IEdge} from "@antv/g6";
import {ICombo} from "@antv/g6-core/lib/interface/item";
import {ComboConfig, EdgeConfig} from "@antv/g6-core/lib/types";
import {JobDetail} from "@main/entity/JobDetail";
import {ProjectJobDependency} from "@main/entity/ProjectJobDependency";
import {find_all_job_detail} from "@render/api/jobDetail.controller";
import {find_all_project_job_dependency} from "@render/api/projectJobDependency.api";
import {customCombo, rectCombo} from "@render/graph/customCombo";
import {jobEdge} from "@render/graph/customEdge";
import {customNode, jobNode, JobNodeConfig} from "@render/graph/customNodes";
import {convertJobRelation2Edges, generateJobNodes, generateOwnDependencies} from "@render/graph/jobNodeUtils";
import {SelectGroupOption, SelectOption} from "naive-ui";
import {ref, onMounted, onUnmounted} from 'vue'

const g6Container = ref(null);
let graph: Graph = null;

onMounted(async () => {
  // 1.画布初始化
  graphInit()

  // 2.自定义节点注册
  nodeRegister();

  // 3.自定义边注册
  edgeRegister()

  // 4.自定义分组注册
  comboRegister()

  // 5.加载画布数据，判断缓存内是否已存在画布数据
  await loadGraphData();

  // 6.注册画布事件
  graphEventRegister()

  // 7.画布渲染
  graph.render();

  // 8.监听窗口变化
  if (typeof window !== 'undefined') {
    window.onresize = () => {
      if (!graph || graph.get('destroyed')) return;
      if (!g6Container.value || !g6Container.value.scrollWidth || !g6Container.value.scrollHeight) return;
      graph.changeSize(g6Container.value.clientWidth, g6Container.value.clientHeight - 5);
    };
  }

  nodesOptionsUpdate('')

})

onUnmounted(() => {
  if (!graph.destroyed) {
    graph.destroy()
  }
})

/*
 * 画布初始化
 **/
const graphInit = () => {
  const minimap = new G6.Minimap({
    container: 'minimapContainer',
    size: [150, 100],
  });

  const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 0,
    fixToNode: [1, 0],
    // 允许出现 tooltip 的 item 类型
    itemTypes: ['node'],
    // 自定义 tooltip 内容
    getContent: (e) => {
      const outDiv = document.createElement('div');

      // 获取节点的边
      const edges = graph.getEdges().filter((edge: IEdge) => edge.getTarget().getID() === e.item.getModel().id);
      const source = edges.map(edge => edge.getSource().getModel().jobName).join(',')
      outDiv.innerHTML = `
      <h3>${e.item.getModel().jobName}</h3>
      <p>依赖于：${source || '--'}</p>`
      return outDiv;
    },
  });

  const toolbar = new G6.ToolBar({
    position: {
      x: 10,
      y: 10
    }
  });

  graph = new G6.Graph({
    container: 'g6Container',
    width: g6Container.value.scrollWidth,
    height: g6Container.value.scrollHeight - 5,
    fitView: true,
    fitViewPadding: 10,
    maxZoom: 1.5,
    defaultNode: {
      type: customNode.jobNode,
    },
    modes: {
      /* behavior */
      default: [
        'drag-canvas',
        'zoom-canvas',
        {
          type: 'drag-combo',
          onlyChangeComboSize: true
        },
        'click-select',
        'activate-relations',
        {
          type: 'drag-node',
          // 不将节点从 Combo 中拖出或将节点拖入到 Combo 中
          onlyChangeComboSize: true
        }
      ],
    },
    plugins: [minimap, tooltip, toolbar],
    // 设置为true，启用 redo & undo 栈功能
    enabledStack: true,
    defaultEdge: {
      type: 'polyline',
      style: {
        radius: 10,
        offset: 36,
        lineWidth: 2,
        // endArrow: true,
        startArrow: {
          // 自定义箭头指向(0, 0)，尾部朝向 x 轴正方向的 path
          path: 'M 0,0 L 14,7 L 14,-7 Z',
          // 箭头的偏移量，负值代表向 x 轴正方向移动
          // d: -10,
          fill: '#72c4fa',
          stroke: '#72c4fa',
          opacity: 0.8,
        },
        stroke: '#72c4fa',
      },
    },
    defaultCombo: {
      type: customCombo.rectCombo
    },
    comboStateStyles: {
      dragenter: {
        lineWidth: 4,
        stroke: '#1d96f1',
      },
    },
    edgeStateStyles: {
      active: {
        lineWidth: 3,
        stroke: '#32a7fa',
        startArrow: {
          // 自定义箭头指向(0, 0)，尾部朝向 x 轴正方向的 path
          path: 'M 0,0 L 14,7 L 14,-7 Z',
          // 箭头的偏移量，负值代表向 x 轴正方向移动
          // d: -10,
          fill: '#32a7fa',
          stroke: '#32a7fa',
          opacity: 0.8,
        },
      },
      inactive: {
        lineWidth: 2,
        stroke: '#72c4fa',
      }
    },
    layout: {
      type: 'comboCombined',
      innerLayout: new G6.Layout['dagre']({
        rankdir: 'LR',
        nodesep: 80, //同层级间节点间距
        ranksep: 80, //层级间间距
      }),
      outerLayout: new G6.Layout['dagre']({
        rankdir: 'LR',
        nodesep: 80, //同层级间节点间距
        ranksep: 200, //层级间间距
      })
    },

  });

}

/*自定义节点注册*/
const nodeRegister = () => {
  G6.registerNode(jobNode.shapeType, jobNode.nodeDefinition, jobNode.extendShapeType)
}

const edgeRegister = () => {
  G6.registerEdge(jobEdge.shapeType, jobEdge.edgeDefinition)
}

const comboRegister = () => {
  G6.registerCombo(rectCombo.shapeType, rectCombo.comboDefinition, rectCombo.extendShapeType)
}

const loadGraphData = async () => {

  const records: JobDetail[] = await find_all_job_detail()

  let nodes: JobNodeConfig[] = []
  let edges: EdgeConfig[] = []
  let combos: ComboConfig[] = []

  if (records != null && records.length > 0) {

    records.forEach(record => {
      nodes.push(...generateJobNodes(record.tableProjectAbbr, record.tableAbbr, record.basicTable))
      edges.push(...generateOwnDependencies(record.tableProjectAbbr, record.tableAbbr, record.basicTable))
    })

    combos = records.map((record => {
      if (record.basicTable) {
        return ({
          id: `${record.tableProjectAbbr}_${record.tableAbbr}`,
          label: record.tableAbbr.toUpperCase(),
          collapsed: false,
        })
      } else {
        return ({
          id: `${record.tableProjectAbbr}_${record.tableAbbr}`,
          label: `${record.tableProjectAbbr.toUpperCase()}_${record.tableAbbr.toUpperCase()}`,
          collapsed: false
        })
      }
    }))

  }

  const projectJobDependencies: ProjectJobDependency[] = await find_all_project_job_dependency()

  if (projectJobDependencies != null) {
    edges.push(...convertJobRelation2Edges(projectJobDependencies.map(((item: {
      source: any;
      target: any;
    }) => ({
      source: item.source,
      target: item.target,
    })))))
  }

  const data = {
    nodes: nodes,
    edges: edges,
    combos: combos,
  };

  graph.data(data);
}

const graphEventRegister = () => {
  graph.on('node:dragend', () => {
    graph.getCombos().forEach((combo) => {
      graph.setItemState(combo, 'dragenter', false);
    });
  });

  graph.on('combo:dragend', () => {
    graph.getCombos().forEach((combo) => {
      graph.setItemState(combo, 'dragenter', false);
    });
  });

  graph.on('combo:click', (e) => {
    if (e.target.get('name') === 'combo-marker-shape') {
      graph.collapseExpandCombo(e.item as ICombo);
      graph.refreshPositions();
    }
  });

  graph.on('combo:dragenter', (e) => {
    graph.setItemState(e.item, 'dragenter', true);
  });
  graph.on('combo:dragleave', (e) => {
    graph.setItemState(e.item, 'dragenter', false);
  });

  graph.on('combo:mouseenter', (evt) => {
    const {item} = evt;
    graph.setItemState(item, 'active', true);
  });
  graph.on('combo:mouseleave', (evt) => {
    const {item} = evt;
    graph.setItemState(item, 'active', false);
  });
}

// region 节点搜索
const queryParam = ref<string>(null)
const nodesOptionsRef = ref<Array<SelectOption | SelectGroupOption>>()

const nodesOptionsUpdate = (v: string) => {
  const nodes = graph.findAll("node", (node) => (node.getModel().jobName as string).includes(v))

  nodesOptionsRef.value = nodes.map((item) => ({
    label: item.getModel().jobName as string,
    value: item.getModel().id as string
  }))
}

const nodeFocus = () => {
  let item = graph.findById(queryParam.value);
  if (item != undefined) {
    graph.zoomTo(0.8)
    graph.focusItem(item, true, {
      easing: 'easeCubic',
      duration: 400,
    })
    graph.setItemState(item, 'active', true);
  }
}

// endregion

</script>

<style scoped>
:deep(.g6-component-tooltip ) {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0 10px 0 10px;
}
</style>
