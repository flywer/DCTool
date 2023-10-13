import {NTag, TreeOption} from "naive-ui";
import {defineStore} from "pinia";
import {h} from "vue";

export const useProjectTreeStore = defineStore({
    id: 'projectTree',
    state: () => ({
        treeNodes: [] as TreeOption[],
        selectedKeys: ['0-6-G1010'],
        expandedKeys: ['-1', '0', '0-6', '0-6-G'],
        onlyShowUserJob: false, // 仅显示当前用户任务
        hideEmptyNodes: false, // 隐藏无任务空节点
        isBasicData: true //此项目是否为基础数据项目，否则为行为数据项目
    }),
    actions: {
        treeNodesInit() {
            this.treeNodes = [
                {
                    label: '全省数据归集',
                    key: '-1',
                    children: [
                        {
                            label: '基础数据归集',
                            key: '0',
                            isLeaf: false,
                            children: [
                                {
                                    label: '省司法厅',
                                    key: '0-6',
                                    prefix: () => {
                                        return h(NTag, {
                                                size: 'small',
                                                bordered: false,
                                                type: "info"
                                            },
                                            {default: () => '司'})
                                    },
                                    children: [
                                        {
                                            label: '法律法规',
                                            key: '0-6-G',
                                            children: [
                                                {
                                                    label: 'G1010',
                                                    key: '0-6-G1010',
                                                    isLeaf: true
                                                },
                                                {
                                                    label: 'G1020',
                                                    key: '0-6-G1020',
                                                    isLeaf: true
                                                },
                                            ]
                                        },
                                        {
                                            label: '执法和监督部门',
                                            key: '0-6-Z',
                                            children: [
                                                {
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
                                                },
                                            ]
                                        },
                                        {
                                            label: '执法和监督人员',
                                            key: '0-6-Y',
                                            children: [
                                                {
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
                                                }
                                            ]
                                        },
                                    ]
                                },
                                {
                                    label: '省政务服务数据管理局',
                                    key: '0-11',
                                    prefix: () => {
                                        return h(NTag, {
                                                size: 'small',
                                                bordered: false,
                                                type: "info"
                                            },
                                            {default: () => '政'})
                                    },
                                    children: [
                                        {
                                            label: '行政职权类事项',
                                            key: '0-11-F1',
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
                                            ]
                                        },
                                        {
                                            label: '  “互联网+监管”事项',
                                            key: '0-11-F2',
                                            children: [
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
                                        }

                                    ]
                                },
                                {
                                    label: '省市场监督管理局',
                                    key: '0-5',
                                    prefix: () => {
                                        return h(NTag, {
                                                size: 'small',
                                                bordered: false,
                                                type: "info"
                                            },
                                            {default: () => '市'})
                                    },
                                    children: [
                                        {
                                            label: '“双随机、一公开”事项',
                                            key: '0-5-F3',
                                            children: [
                                                {
                                                    label: 'F3010',
                                                    key: '0-5-F3010',
                                                    isLeaf: true
                                                },
                                                {
                                                    label: 'F3011',
                                                    key: '0-5-F3011',
                                                    isLeaf: true
                                                },
                                            ]
                                        },
                                        {
                                            label: '执法对象',
                                            key: '0-5-D',
                                            children: [
                                                {
                                                    label: 'D1010',
                                                    key: '0-5-D1010',
                                                    isLeaf: true
                                                },
                                                {
                                                    label: 'D1020',
                                                    key: '0-5-D1020',
                                                    isLeaf: true
                                                },
                                                {
                                                    label: 'D1030',
                                                    key: '0-5-D1030',
                                                    isLeaf: true
                                                },
                                                {
                                                    label: 'D1040',
                                                    key: '0-5-D1040',
                                                    isLeaf: true
                                                }
                                            ]
                                        },

                                    ]
                                }
                            ]
                        },
                        {
                            label: '行为数据归集',
                            key: '1',
                            isLeaf: false,
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
                            key: '2',
                            isLeaf: false,
                            children: [
                                {
                                    label: '省政数局主体信息采集',
                                    key: '2-0',
                                    isLeaf: true
                                },
                                {
                                    label: '全省数据统计',
                                    key: '2-1',
                                    children: [
                                        {
                                            label: '累计报送数据量数据同步',
                                            key: '2-1-0',
                                            isLeaf: true
                                        },
                                        {
                                            label: '数据湖数据量数据同步',
                                            key: '2-1-1',
                                            isLeaf: true
                                        }
                                    ]
                                },
                            ]
                        }]
                }
            ]
        },
    }
})
