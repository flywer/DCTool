import {isEmpty} from "lodash-es";
import {TreeOption} from "naive-ui";
import {defineStore} from "pinia";

export const useProjectTreeStore = defineStore({
    id: 'projectTree',
    state: () => ({
        treeNodes: [] as TreeOption[],
        defaultExpandedKeys: ['-1'] as string[],
        defaultSelectedKeys: ['0-6-G1010'] as string[]
    }),
    actions: {
        projectTreeInit() {
            this.treeNodesInit()
            this.defaultExpandedKeysInit()
            this.defaultSelectedKeysInit()

        },
        treeNodesInit() {
            if (isEmpty(this.treeNodes)) {
                this.treeNodes = [
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
                ]
            }
        },
        defaultExpandedKeysInit() {
            if (isEmpty(this.defaultExpandedKeys)) {
                this.defaultExpandedKeys = ['-1']
            }
        },
        defaultSelectedKeysInit() {
            if (isEmpty(this.defaultSelectedKeys)) {
                this.defaultSelectedKeys = ['0-6-G1010']
            }
        }
    }
})
