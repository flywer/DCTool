import {EdgeConfig} from "@antv/g6-core/lib/types";
import {JobNodeConfig} from "@render/graph/customNodes";
import {getJobType} from "@render/utils/datacenter/jobTabUtil";

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






