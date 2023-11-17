import {EdgeConfig} from "@antv/g6-core/lib/types";
import {JobNodeConfig} from "@render/graph/customNodes";

/**
 * 项目任务自身节点生成
 * @param tableAbbr 项目表名简称
 * @param tableName 表名缩写
 * @param isBasicTable 是否为基础数据表
 **/
export const generateJobNodes = (tableAbbr: string, tableName: string, isBasicTable: boolean) => {
    const basicJobPrefix = ['cj', 'zj', 'bf', 'qc', 'rh', 'rk', 'gx']
    const actionJobPrefix = ['cj', 'zj', 'bf', 'qc', 'rh1', 'rh2']

    let nodes: JobNodeConfig[] = []
    if (isBasicTable) {
        for (let i = 0; i < basicJobPrefix.length; i++) {
            nodes.push({
                id: `${basicJobPrefix[i]}_${tableAbbr}_${tableName}`,
                jobName: `${basicJobPrefix[i]}_${tableAbbr}_${tableName}`,
                jobType: getJobType(`${basicJobPrefix[i]}_${tableAbbr}_${tableName}`),
                jobStatus: 2,
                lastExecTime: '--',
                lastExecResult: '--',
                comboId: `${tableAbbr}_${tableName}`,
            })
        }
    } else {
        for (let i = 0; i < actionJobPrefix.length; i++) {
            nodes.push({
                id: `${actionJobPrefix[i]}_${tableAbbr}_${tableName}`,
                jobName: `${actionJobPrefix[i]}_${tableAbbr}_${tableName}`,
                jobType: getJobType(`${actionJobPrefix[i]}_${tableAbbr}_${tableName}`),
                jobStatus: 2,
                lastExecTime: '--',
                lastExecResult: '--',
                comboId: `${tableAbbr}_${tableName}`,
            })
        }
    }
    return nodes
}

const getJobType = (jobName: string) => {
    switch (jobName.split('_')[0]) {
        case 'cj':
            return '数据采集任务'
        case 'gx':
            return '数据共享任务'
        case 'zj':
            return '数据质检任务'
        case 'zj1':
            return '初步质检任务'
        case 'zj2':
            return '完整质检任务'
        case 'bf':
            return '数据备份任务'
        case 'qc':
            return '数据清除任务'
        case 'rh':
            return '数据融合任务'
        case 'rh1':
            return '单表融合任务'
        case 'rh2':
            return '入湖融合任务'
        case 'rh3':
            return '入库融合任务'
        case 'rk':
            return '数据入库任务'
        default :
            return '未知任务'
    }
}

/**
 * 根据任务依赖生成边
 **/
export const convertJobRelation2Edges = (dependencies: { source: string, target: string }[]) => {

    const edges: EdgeConfig[] = dependencies.map((dep => ({
        id: `${dep.source}-${dep.target}`,
        source: dep.source,
        target: dep.target
    })))

    return edges
}

/**
 * 项目任务自身依赖生成
 * @param tableAbbr 项目表名简称
 * @param tableName 表名缩写
 * @param isBasicTable 是否为基础数据表
 **/
export const generateOwnDependencies = (tableAbbr: string, tableName: string, isBasicTable: boolean) => {

    const tableNameSuffix: string = `${tableAbbr}_${tableName}`

    if (isBasicTable) {
        return convertJobRelation2Edges([
            {
                source: `cj_${tableNameSuffix}`,
                target: `zj_${tableNameSuffix}`,
            },
            {
                source: `zj_${tableNameSuffix}`,
                target: `bf_${tableNameSuffix}`,
            },
            {
                source: `bf_${tableNameSuffix}`,
                target: `qc_${tableNameSuffix}`,
            },
            {
                source: `zj_${tableNameSuffix}`,
                target: `rh_${tableNameSuffix}`,
            }, {
                source: `rh_${tableNameSuffix}`,
                target: `rk_${tableNameSuffix}`,
            },
            {
                source: `rk_${tableNameSuffix}`,
                target: `gx_${tableNameSuffix}`,
            },
        ])
    } else {
        return convertJobRelation2Edges([
            {
                source: `cj_${tableNameSuffix}`,
                target: `zj_${tableNameSuffix}`,
            },
            {
                source: `zj_${tableNameSuffix}`,
                target: `bf_${tableNameSuffix}`,
            },
            {
                source: `bf_${tableNameSuffix}`,
                target: `qc_${tableNameSuffix}`,
            },
            {
                source: `zj_${tableNameSuffix}`,
                target: `rh1_${tableNameSuffix}`,
            }, {
                source: `rh1_${tableNameSuffix}`,
                target: `rh2_${tableNameSuffix}`,
            }
        ])
    }
}






