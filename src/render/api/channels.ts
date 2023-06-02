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
        authTokenNotice:'datacenter/authTokenNotice',

    },
    auxiliaryDb: {
        getProjectInfo: 'auxiliaryDb/getProjectInfo',
        updateProjectInfo: 'auxiliaryDb/updateProjectInfo',
        findByProjectId: 'auxiliaryDb/findByProjectId',
        getAuthToken: 'auxiliaryDb/getAuthToken',
        updateAuthToken: 'auxiliaryDb/updateAuthToken',
    }

})
