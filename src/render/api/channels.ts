import {reactive} from "vue";

export const channels = reactive({
    app: {
        relaunch: 'app/relaunch',
        openDefaultBrowser: 'app/openDefaultBrowser',
        updateSettings: 'app/updateSettings',
        getSettings: 'app/getSettings',
        updateTheme: "app/updateTheme",
        getAppVersion: "app/getAppVersion",
    },
    sys: {
        shouldUseDarkColors: 'sys/shouldUseDarkColors'
    },
    window: {
        max: 'window/max',
        min: "window/min",
        close: "window/close"
    },
    login: {
        signIn: 'login/signIn',
        signUp: 'login/signUp',
        sendCanLogin: 'login/sendCanLogin',
        rememberMe: 'login/rememberMe',
        readUserConfig: 'login/readUserConfig',
    },
    ldDecrypt: {
        decrypt: 'ldDecrypt/decrypt'
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
        jobProjectList: 'datacenter/jobProjectList',
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
        dataxJobStart: 'datacenter/dataxJobStart',
        dataxJobStop: 'datacenter/dataxJobStop',
        dataxJobRun: 'datacenter/dataxJobRun',
        schedJobDelete: 'datacenter/schedJobDelete',
        dataxJobDelete: 'datacenter/dataxJobDelete',
        workflowRun: 'datacenter/workflowRun',
        workflowDelete: 'datacenter/workflowDelete',
        getTablesInfo: 'datacenter/getTablesInfo',
        tablePreview: 'datacenter/tablePreview',
        tableDelete: 'datacenter/tableDelete',
        getDataxJobLog: 'datacenter/getDataxJobLog',
        createValidConfig: 'datacenter/createValidConfig',
        getValidConfigPage: 'datacenter/getValidConfigPage',
        workflowRerun: 'datacenter/workflowRerun',
        login: 'datacenter/login',
        getUsrcOrgTree: 'datacenter/getUsrcOrgTree',
        getDictByName: 'datacenter/getDictByName',
        getDictListById: 'datacenter/getDictListById',
        workflowLog: 'datacenter/workflowLog',
        inspHomeList: 'datacenter/inspHomeList',
        getInpsRecordPage: 'datacenter/getInpsRecordPage',
        getWorkflow: 'datacenter/getWorkflow',
        updateWorkflow: 'datacenter/updateWorkflow',
        getDataXJob: 'datacenter/getDataXJob',
        getProject: 'datacenter/getProject',

    },
    auxiliaryDb: {
        getProjectInfo: 'auxiliaryDb/getProjectInfo',
        updateProjectInfo: 'auxiliaryDb/updateProjectInfo',
        findByProjectId: 'auxiliaryDb/findByProjectId',
        getProjectByProAbbr: 'auxiliaryDb/getProjectByProAbbr',
        getProjectByTableAbbr: 'auxiliaryDb/getProjectByTableAbbr',
        getProjectByProjectName: 'auxiliaryDb/getProjectByProjectName',

        getProjectCjCron: 'auxiliaryDb/getProjectCjCron',
        getProjectByCjCronIsNull: 'auxiliaryDb/getProjectByCjCronIsNull',
        updateCjCron: 'auxiliaryDb/updateCjCron',
        getCjCronByProjectId: 'auxiliaryDb/getCjCronByProjectId',

        getAuthTokenByAccount: 'auxiliaryDb/getAuthTokenByAccount',
        updateAuthTokenByAccount: 'auxiliaryDb/updateAuthTokenByAccount',

        getTableSql: 'auxiliaryDb/getTableSql',
        updateTableSql: 'auxiliaryDb/updateTableSql',

        getRhJson: 'auxiliaryDb/getRhJson',
        getRhJsonById: 'auxiliaryDb/getRhJsonById',
        updateRh1Json: 'auxiliaryDb/updateRh1Json',
        updateRh2Json: 'auxiliaryDb/updateRh2Json',

        getZjJson: 'auxiliaryDb/getZjJson',
        getZjJsonById: 'auxiliaryDb/getZjJsonById',
        updateZjJson: 'auxiliaryDb/updateZjJson',

        getPreDatabaseDepart: 'auxiliaryDb/getPreDatabaseDepart',
        getPreDatabaseTableInfoJson: 'auxiliaryDb/getPreDatabaseTableInfoJson',
        updateTableInfoJson: 'auxiliaryDb/updateTableInfoJson',

        getSztkDict: 'auxiliaryDb/getSztkDict',
        saveSztkDict: 'auxiliaryDb/saveSztkDict',
        getParentDict: 'auxiliaryDb/getParentDict',
        getDictByParentId: 'auxiliaryDb/getDictByParentId',
        getDictByBzId: 'auxiliaryDb/getDictByBzId',

        getSimpZjJson: 'auxiliaryDb/getSimpZjJson',
        getSimpZjJsonById: 'auxiliaryDb/getSimpZjJsonById',
        updateSimpZjJson: 'auxiliaryDb/updateSimpZjJson',

    },
    cron: {
        createCronJob: 'cron/createCronJob',
        datacenterCronJobInit: 'cron/datacenterCronJobInit',
    },
    xlsx: {
        createDataInpsStat: 'xlsx/createDataInpsStat'
    },
    front: {
        getTableData: 'front/getTableData'
    },
    updater: {
        msg: 'updater/msg'
    },

})
