import {RouteRecordRaw} from 'vue-router'

const view1 = () => import('@render/views/examples/view1.vue')
const ldDecrypt = () => import ('@render/views/ldDecrypt/index.vue')
const ocr = () => import('@render/views/ocr/index.vue')
const svg = () => import('@render/views/svgConvert/index.vue')
const datacenter = () => import('@render/views/datacenter/index.vue')

const flattenText = () => import('@render/views/flattenText/index.vue')
const cjJob = () => import('@render/views/cjJob/index.vue')
const execSql = () => import('@render/views/execSql/index.vue')
const sqlValid = () => import('@render/views/sqlValid/index.vue')
const hiveSqlTrans = () => import('@render/views/datacenter/hiveSqlTab.vue')
const projectAbbr = () => import('@render/views/projectAbbr/index.vue')

export const routeName = {
    home: 'home',
    ldDecrypt: 'ldDecrypt',
    ocr: 'ocr',
    svg: 'svg',
    datacenter: 'datacenter',
    flattenText: 'flattenText',
    cjJob: 'cjJob',
    execSql: 'execSql',
    sqlValid: 'sqlValid',
    hiveSqlTrans: 'hiveSqlTrans',
    projectAbbr: 'projectAbbr'
}

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/datacenter/index',
    },
    {
        path: '/examples',
        name: routeName.home,
        component: view1,
    },
    {
        name: routeName.ldDecrypt,
        path: '/ldDecrypt/index',
        component: ldDecrypt
    },
    {
        name: routeName.ocr,
        path: '/ocr/index',
        component: ocr
    },
    {
        name: routeName.svg,
        path: '/svg/index',
        component: svg
    },
    {
        name: routeName.datacenter,
        path: '/datacenter/index',
        component: datacenter
    },
    {
        name: routeName.flattenText,
        path: '/flattenText/index',
        component: flattenText
    },
    {
        name: routeName.cjJob,
        path: '/cjJob/index',
        component: cjJob
    },
    {
        name: routeName.execSql,
        path: '/execSql/index',
        component: execSql
    },
    {
        name: routeName.sqlValid,
        path: '/sqlValid/index',
        component: sqlValid
    },
    {
        name: routeName.hiveSqlTrans,
        path: '/hiveSqlTrans/index',
        component: hiveSqlTrans
    },
    {
        name: routeName.projectAbbr,
        path: '/projectAbbr/index',
        component: projectAbbr
    }
]
