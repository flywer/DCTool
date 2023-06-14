import {reactive} from "vue";

export const channels = reactive({
    window: {
        max: 'window/max',
        min: "window/min",
        close: "window/close"
    },
    ldDecrypt: {
        decrypt: 'ldDecrypt/decrypt'
    },
    ocr: {
        scan: 'ocr/scan'
    },
    svg: {
        saveSvgFile: 'svg/saveSvgFile'
    },
    datacenter: {
        request: 'datacenter/request',
        dataSourceList: 'datacenter/dataSourceList',
        checkInsertSql: 'datacenter/checkInsertSql',
        addWorkFlow: 'datacenter/addWorkFlow',
        getColumns: 'datacenter/getColumns',
        jobList: 'datacenter/jobList',
        personList: 'datacenter/personList',
        getTables: 'datacenter/getTables',
        buildDataXJson: 'datacenter/buildDataXJson',
        addDataXJob: 'datacenter/addDataXJob',
        addSchedTask: 'datacenter/addSchedTask',
        execSql: 'datacenter/execSql',
        sqlValid: 'datacenter/sqlValid',
        authTokenNotice: 'datacenter/authTokenNotice',
        createTable: 'datacenter/createTable',
        getWorkflowPage: 'datacenter/getWorkflowPage',
        getCjJobPage: 'datacenter/getCjJobPage',
        getSchedJobPage: 'datacenter/getSchedJobPage',
        workflowActive: 'datacenter/workflowActive',
        cjJobStart: 'datacenter/cjJobStart',
        cjJobStop: 'datacenter/cjJobStop',
        cjJobRun: 'datacenter/cjJobRun',
        schedJobDelete: 'datacenter/schedJobDelete',
        cjJobDelete: 'datacenter/cjJobDelete',
        workflowRun: 'datacenter/workflowRun',
        workflowDelete: 'datacenter/workflowDelete',
        getTablesInfo: 'datacenter/getTablesInfo',
        tablePreview: 'datacenter/tablePreview',
        tableDelete: 'datacenter/tableDelete',
        getCjJobLog: 'datacenter/getCjJobLog',
        createValidConfig: 'datacenter/createValidConfig',
        getValidConfigPage:'datacenter/getValidConfigPage',

    },
    auxiliaryDb: {
        getProjectInfo: 'auxiliaryDb/getProjectInfo',
        updateProjectInfo: 'auxiliaryDb/updateProjectInfo',
        findByProjectId: 'auxiliaryDb/findByProjectId',
        getAuthToken: 'auxiliaryDb/getAuthToken',
        updateAuthToken: 'auxiliaryDb/updateAuthToken',
        getTableSql: 'auxiliaryDb/getTableSql',
        updateTableSql: 'auxiliaryDb/updateTableSql',
        getRhJson: 'auxiliaryDb/getRhJson',
        updateRhJson: 'auxiliaryDb/updateRhJson',
        getProjectByProAbbr: 'auxiliaryDb/getProjectByProAbbr',
        getZjJson: 'auxiliaryDb/getZjJson',
        updateZjJson: 'auxiliaryDb/updateZjJson',

    },
    cron: {
        createCronJob: 'cron/createCronJob',
        datacenterCronJobInit: 'cron/datacenterCronJobInit',
    }

})
