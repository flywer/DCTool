import {reactive} from "vue";

export const channels = reactive({
    app: {
        relaunch: 'app/relaunch',
        openDefaultBrowser: 'app/openDefaultBrowser',
        updateSettings: 'app/updateSettings',
        getSettings: 'app/getSettings',
        updateTheme: "app/updateTheme",
        getAppVersion: "app/getAppVersion",
        sendAppInstallNotice: "app/sendAppInstallNotice",
        quitAndInstall: "app/quitAndInstall",
        clipboard: {
            writeText: "app/clipboard/writeText",
        }
    },
    sys: {
        shouldUseDarkColors: 'sys/shouldUseDarkColors'
    },
    window: {
        max: 'window/max',
        min: "window/min",
        close: "window/close",
        top: "window/top"
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
        getUser: 'datacenter/getUser',
        request: 'datacenter/request',
        dataSourceList: 'datacenter/dataSourceList',
        checkInsertSql: 'datacenter/checkInsertSql',
        addWorkFlow: 'datacenter/addWorkFlow',
        getColumns: 'datacenter/getColumns',
        jobProjectListAll: 'datacenter/jobProjectListAll',
        getJobProjectListByPage: 'datacenter/getJobProjectListByPage',
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
        getWorkflowListByProjectId: 'datacenter/getWorkflowListByProjectId',
        updateDataXJob: 'datacenter/updateDataXJob',
        updateSchedJob: 'datacenter/updateSchedJob',
        updateIsProcessed: 'datacenter/updateIsProcessed',
        runDataxJobByJobContent: 'datacenter/runDataxJobByJobContent',
        getSchedJobById: 'datacenter/getSchedJobById',
        getAllDataSource: 'datacenter/getAllDataSource',
        getTableInfoById: 'datacenter/getTableInfoById',
        getTableStoreFormat: 'datacenter/getTableStoreFormat',
        getTableFieldType: 'datacenter/getTableFieldType',
        updateTable: 'datacenter/updateTable',
        getNorm: 'datacenter/getNorm',
        getNormCodeSet: 'datacenter/getNormCodeSet',
        getColumnsInfo: 'datacenter/getColumnsInfo',
    },
    auxiliaryDb: {
        projectInfo: {
            getProjectInfo: 'auxiliaryDb/projectInfo/getProjectInfo',
            getProjectInfoByProjectName: 'auxiliaryDb/projectInfo/getProjectInfoByProjectName',
            updateProjectInfo: 'auxiliaryDb/projectInfo/updateProjectInfo',
            findByProjectId: 'auxiliaryDb/projectInfo/findByProjectId',
            getProjectByProAbbr: 'auxiliaryDb/projectInfo/getProjectByProAbbr',
            getProjectByTableAbbr: 'auxiliaryDb/projectInfo/getProjectByTableAbbr',
            getProjectByProjectName: 'auxiliaryDb/projectInfo/getProjectByProjectName',
            getProjectCjCron: 'auxiliaryDb/projectInfo/getProjectCjCron',
            getProjectByCjCronIsNull: 'auxiliaryDb/projectInfo/getProjectByCjCronIsNull',
            updateCjCron: 'auxiliaryDb/projectInfo/updateCjCron'
        },
        user: {
            getAuthTokenByAccount: 'auxiliaryDb/user/getAuthTokenByAccount',
            updateAuthTokenByAccount: 'auxiliaryDb/user/updateAuthTokenByAccount',
        },
        tableSql: {
            getTableSql: 'auxiliaryDb/tableSql/getTableSql',
            updateTableSql: 'auxiliaryDb/tableSql/updateTableSql',
        },
        jobJson: {
            getRhJson: 'auxiliaryDb/jobJson/getRhJson',
            getRhJsonById: 'auxiliaryDb/jobJson/getRhJsonById',
            updateRh1Json: 'auxiliaryDb/jobJson/updateRh1Json',
            updateRh2Json: 'auxiliaryDb/jobJson/updateRh2Json',

            getZjJson: 'auxiliaryDb/jobJson/getZjJson',
            getZjJsonById: 'auxiliaryDb/jobJson/getZjJsonById',
            updateZjJson: 'auxiliaryDb/jobJson/updateZjJson',

            getSimpZjJson: 'auxiliaryDb/jobJson/getSimpZjJson',
            getSimpZjJsonById: 'auxiliaryDb/jobJson/getSimpZjJsonById',
            updateSimpZjJson: 'auxiliaryDb/jobJson/updateSimpZjJson',
        },
        preDatabase: {
            getPreDatabaseDepart: 'auxiliaryDb/preDatabase/getPreDatabaseDepart',
            getPreDatabaseTableInfoJson: 'auxiliaryDb/preDatabase/getPreDatabaseTableInfoJson',
            updateTableInfoJson: 'auxiliaryDb/preDatabase/updateTableInfoJson',
            updateFETableNameByExcel: 'auxiliaryDb/preDatabase/updateFETableNameByExcel',
            getFEDepartTableNameByPage: 'auxiliaryDb/preDatabase/getFEDepartTableNameByPage',
            downloadTemplate: 'auxiliaryDb/preDatabase/downloadTemplate',
            getInfoByDepartNameAndTableType: 'auxiliaryDb/preDatabase/getInfoByDepartNameAndTableType',
            updateFETableName: 'auxiliaryDb/preDatabase/updateFETableName',
            deleteFETableName: 'auxiliaryDb/preDatabase/deleteFETableName',
            getAllFEDepartTableName: 'auxiliaryDb/preDatabase/getAllFEDepartTableName',
        },
        sztkDict: {
            getSztkDict: 'auxiliaryDb/sztkDict/getSztkDict',
            saveSztkDict: 'auxiliaryDb/sztkDict/saveSztkDict',
            getParentDict: 'auxiliaryDb/sztkDict/getParentDict',
            getDictByParentId: 'auxiliaryDb/sztkDict/getDictByParentId',
            getDictByBzId: 'auxiliaryDb/sztkDict/getDictByBzId',
        },
        dict: {
            getMaxRunningWorkFlowJobNum: 'auxiliaryDb/dict/getMaxRunningWorkFlowJobNum',
        },
        jobDetail: {
            findAll: 'auxiliaryDb/jobDetail/findAll',
        },
        projectJobDependency: {
            findAll: 'auxiliaryDb/jobDetail/projectJobDependency',
        },
        jobTemplate: {
            findTemplate: 'auxiliaryDb/jobTemplate/findTemplate',
            templateSave: 'auxiliaryDb/jobTemplate/templateSave',
            templateDelete: 'auxiliaryDb/jobTemplate/templateDelete',
        },
        templateStructTable: {
            findTemplateStructTable: 'auxiliaryDb/templateStructTable/findTemplateStructTable',
            save: 'auxiliaryDb/templateStructTable/save',
            delete: 'auxiliaryDb/templateStructTable/delete',
            saveTableJobRel: 'auxiliaryDb/templateStructTable/saveTableJobRel',
        },
        fieldInspectionRule: {
            findFieldInspectionRule: 'auxiliaryDb/fieldInspectionRule/findFieldInspectionRule',
            save: 'auxiliaryDb/fieldInspectionRule/save',
            delete: 'auxiliaryDb/fieldInspectionRule/delete',
        }
    },
    cron: {
        createCronJob: 'cron/createCronJob',
        datacenterCronJobInit: 'cron/datacenterCronJobInit',
    },
    xlsx: {
        createDataInpsStat: 'xlsx/createDataInpsStat',
        generateInsertStatements: 'xlsx/generateInsertStatements',
        createDepartDataVolExcel: 'xlsx/createDepartDataVolExcel',
    },
    front: {
        getTableData: 'front/getTableData',
        getAllFrontEndDataVol: 'front/getAllFrontEndDataVol',
        getFrontEndDataVolByDepartNameAndTableType: 'front/getFrontEndDataVolByDepartNameAndTableType',
        getDataLakeDataVolByDepartNameAndTableType: 'front/getDataLakeDataVolByDepartNameAndTableType',
        getThemeBaseDataVolByDepartNameAndTableType: 'front/getThemeBaseDataVolByDepartNameAndTableType',

    },
    updater: {
        checkUpdate: "updater/checkUpdate",
    },
    taskScheduler: {
        getScheduler: 'taskScheduler/getScheduler',
        saveTask: 'taskScheduler/saveTask',
        getTask: 'taskScheduler/getTask',
        taskDelete: 'taskScheduler/taskDelete',
        taskEnable: 'taskScheduler/taskEnable',
        cronJobStart: 'taskScheduler/cronJobStart',
        cronJobStop: 'taskScheduler/cronJobStop',
        taskRun: 'taskScheduler/taskRun',
        sendTaskExecEnd: 'taskScheduler/sendTaskExecEnd',
        taskInterrupt: 'taskScheduler/taskInterrupt',
        findJobById: 'taskScheduler/findJobById'
    },
    share: {
        getDataVolume: 'share/getDataVolume'
    },
    extractLaws: {
        extract: 'extractLaws/extract'
    }
})
