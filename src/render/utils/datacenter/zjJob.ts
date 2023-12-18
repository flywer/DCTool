import {isBasicTable} from "@render/utils/common/isBasicTable";
import {removeIds} from "@render/utils/datacenter/removeIds";
import {updateSjkUUID} from "@render/utils/datacenter/updateSjkUUID";

export const convertZjJson = (jsonStr: string, tableName: string): string => {
    let jobJson = JSON.parse(jsonStr)
    jobJson.name = ''
    jobJson.email = ''
    jobJson.description = ''
    jobJson.personId = ''
    jobJson.personName = ''
    jobJson.projectId = ''
    jobJson.projectName = ''
    jobJson.dependencyProjectName = null
    jobJson.dependencyWorkflowName = null
    jobJson.dependencyProjectId = null
    jobJson.dependencyWorkflowId = null
    jobJson.schedulingMode = 0
    jobJson.crontab = ''
    jobJson = JSON.parse(updateSjkUUID(removeIds(jobJson)))

    const oldSourceTableName = jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName
    const oldTableAbbr = jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName.split('_')[1]

    jobJson.modelJson = jobJson.modelJson.replaceAll(oldTableAbbr, 'depart')

    const newSourceTableName = `di_depart_${tableName.toLowerCase()}_temp_ods`
    const newAimTableName = `di_depart_${tableName.toLowerCase()}_right_dwd`
    const newWrongTableName = `di_depart_${tableName.toLowerCase()}_error_dwd`

    jobJson.dataDevBizVo.qualityInspectionDtoList[0].incrementColumnName = `cd_time`
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].incrementColumnValueInit = "2023-01-01T03:33:44.132Z"

    jobJson.dataDevBizVo.qualityInspectionDtoList[0].sourceTableName = newSourceTableName
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].aimTableName = newAimTableName
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].wrongTableName = newWrongTableName

    //替换关联表里的表名，但关联的是基础数据的不用替换
    jobJson.dataDevBizVo.qualityInspectionDtoList[0].qualityInspectionFieldList.forEach((inspField: any) => {

        inspField.field = inspField.field.replace(`${oldSourceTableName}.`, '')

        inspField.ruleList.forEach((rule: any) => {
            if (rule.customSqlKey != undefined) {
                rule.customSqlKey = rule.customSqlKey.replaceAll(`${oldSourceTableName}.`, '');
            }
            if (rule.fromTableDataTable != undefined) {
                if (!isBasicTable(rule.fromTableDataTable)) {
                    rule.fromTableDataTable = rule.fromTableDataTable.replaceAll(oldTableAbbr, 'depart');
                }
                // rule.fromTableField = rule.fromTableField.replaceAll(oldTableAbbr, 'depart');
                rule.fromTableField = rule.fromTableField.split('.').pop()
            }

            if (rule.customSql != undefined) {
                rule.customSql = convertCustomSqlTableName(rule.customSql, oldTableAbbr, 'depart')
                rule.customSql = rule.customSql.replaceAll(oldSourceTableName, newSourceTableName)
            }

            if (rule.customDescribe != undefined) {
                rule.customDescribe = replaceQuotes(rule.customDescribe)
            }
        });
    });

    return JSON.stringify(jobJson, null, 2)
}

const replaceQuotes = (sentence: string): string => {
    let result = '';
    let count = 0;

    for (let i = 0; i < sentence.length; i++) {
        if (sentence[i] === '"') {
            count++;
            if (count % 2 === 0) {
                result += '”';
            } else {
                result += '“';
            }
        } else {
            result += sentence[i];
        }
    }

    return result;
}

export const convertCustomSqlTableName = (sql: string, oldTableAbbr: string, newTableAbbr: string) => {
    // 定义正则表达式匹配规则，匹配 xzzf_ods. 后面的表名
    const pattern = /(?<=xzzf_ods\.)\w+/g;

    let newSql = sql

    // 使用正则表达式匹配字符串中的所有表名，并打印结果
    let match: any
    while ((match = pattern.exec(sql)) !== null) {
        if (!isBasicTable(match[0])) {
            const tableName = match[0].replaceAll(oldTableAbbr, newTableAbbr) //转为通用表名
            newSql = newSql.replaceAll(match[0], tableName)//替换此表名
        }
    }
    return newSql
}
