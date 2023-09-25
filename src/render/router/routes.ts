import {RouteRecordRaw} from 'vue-router'

const App = () => import ('@render/App.vue')
const Main = () => import ('@render/pages/main.vue')
const Updater = () => import ('@render/pages/updater.vue')
const jobCreate = () => import('@render/views/jobCreate/index.vue')
const jobMgt = () => import('@render/views/jobMgt/index.vue')
const projectAbbr = () => import('@render/views/projectAbbr/index.vue')
const sqlProcess = () => import('@render/views/sqlProcess/index.vue')
const settings = () => import('@render/views/settings/index.vue')
const createTable = () => import('@render/views/createTable/index.vue')
const preDatabase = () => import('@render/views/preDatabase/index.vue')
const sztkDict = () => import('@render/views/sztkDict/index.vue')
const dataStat = () => import('@render/views/dataStat/index.vue')
const schedulingMgt = () => import('@render/views/schedulingMgt/index.vue')
const toolbox = () => import('@render/views/toolbox/index.vue')
const jobDependency = () => import('@render/views/jobDependency/index.vue')
const taskScheduler = () => import('@render/views/taskScheduler/index.vue')

export const routeName = {
    app: 'app',
    main: 'main-page',
    updater: 'updater-page',
    home: 'home',
    jobCreate: 'jobCreate',
    cjJob: 'cjJob',
    zjJob: 'zjJob',
    bfJob: 'bfJob',
    qcJob: 'qcJob',
    rkJob: 'rkJob',
    gxJob: 'gxJob',
    rhJob: 'rhJob',
    execSql: 'execSql',
    sqlValid: 'sqlValid',
    sqlProcess: 'sqlProcess',
    hiveSqlTrans: 'hiveSqlTrans',
    projectAbbr: 'projectAbbr',
    createTable: 'createTable',
    settings: 'settings',
    jobMgt: 'jobMgt',
    preDatabase: 'preDatabase',
    sztkDict: 'sztkDict',
    dataStat: 'dataStat',
    schedulingMgt: 'schedulingMgt',
    toolbox: 'toolbox',
    jobDependency: 'jobDependency',
    taskScheduler: 'taskScheduler'
}

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: routeName.app,
        component: App,
        children: [
            {
                name: routeName.main,
                path: 'main-page',
                component: Main,
                children: [
                    {
                        name: routeName.jobMgt,
                        path: 'jobMgt/index',
                        component: jobMgt
                    },
                    {
                        name: routeName.jobCreate,
                        path: '/jobCreate/index',
                        component: jobCreate
                    },
                    {
                        name: routeName.createTable,
                        path: '/createTable/index',
                        component: createTable
                    },
                    {
                        name: routeName.schedulingMgt,
                        path: '/schedulingMgt/index',
                        component: schedulingMgt
                    },
                    {
                        name: routeName.sqlProcess,
                        path: '/sqlProcess/index',
                        component: sqlProcess
                    },
                    {
                        name: routeName.projectAbbr,
                        path: '/projectAbbr/index',
                        component: projectAbbr
                    },
                    {
                        name: routeName.preDatabase,
                        path: '/preDatabase/index',
                        component: preDatabase
                    },
                    {
                        name: routeName.dataStat,
                        path: '/dataStat/index',
                        component: dataStat
                    },
                    {
                        name: routeName.sztkDict,
                        path: '/sztkDict/index',
                        component: sztkDict
                    },
                    {
                        name: routeName.toolbox,
                        path: '/toolbox/index',
                        component: toolbox
                    },
                    {
                        name: routeName.settings,
                        path: '/settings/index',
                        component: settings
                    },
                    {
                        name: routeName.jobDependency,
                        path: '/jobDependency/index',
                        component: jobDependency
                    }, {
                        name: routeName.taskScheduler,
                        path: '/taskScheduler/index',
                        component: taskScheduler
                    },
                ]
            },
            {
                name: routeName.updater,
                path: 'updater-page',
                component: Updater
            }
        ]
    }
]
