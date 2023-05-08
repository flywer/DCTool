import {RouteRecordRaw} from 'vue-router'

const view1 = () => import('@render/views/examples/view1.vue')
const ldDecrypt = () => import ('@render/views/ldDecrypt/index.vue')
const ocr = () => import('@render/views/ocr/index.vue')
const svg = () => import('@render/views/svgConvert/index.vue')
const datacenter = () => import('@render/views/datacenter/index.vue')

export const routeName = {
    home: 'home',
    ldDecrypt: 'ldDecrypt',
    ocr: 'ocr',
    svg: 'svg',
    datacenter:'datacenter'
}

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/examples',
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
    }
]
