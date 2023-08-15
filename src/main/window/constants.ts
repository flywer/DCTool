import {app} from "electron";
import {join} from "path";

export const MAIN_WINDOW = 'main-window'
export const UPDATER_WINDOW = 'updater-window'

const isDev = !app.isPackaged

export const MAIN_WINDOW_URL = isDev
    ? process.env.DS_RENDERER_URL + '/#/main-page'
    : `file://${join(app.getAppPath(), 'dist/render/index.html')}#/main-page`

export const UPDATER_WINDOW_URL = isDev
    ? process.env.DS_RENDERER_URL + '/#/updater-page'
    : `file://${join(app.getAppPath(), 'dist/render/index.html')}#/updater-page`
