import {MAIN_WINDOW_URL} from "@main/window/constants";
import {join} from 'path'
import {BrowserWindow, app} from 'electron'

const isDev = !app.isPackaged

export const createMainWindow = (): BrowserWindow => {
    const mainWindow = new BrowserWindow({
        width: 435,
        height: 550,
        resizable: false,
        frame: false, // 无边框
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: join(__dirname, '../preload/index.js'),
            devTools: isDev,
            webSecurity: false,// 允许跨域访问
            // nodeIntegration: false, // 允许 Node.js APIs 在渲染进程中使用
            // nodeIntegrationInWorker: true, // 允许 Node.js APIs 在 Web Worker 中使用（仅 Electron 5+）
            //  nodeIntegrationInSubFrames: true // 允许 Node.js APIs 在子 frame 中使用（仅 Electron 5+）
        },
        show: false,
        autoHideMenuBar: !isDev,
    })

    mainWindow.loadURL(MAIN_WINDOW_URL)

    // 监听 "ready-to-show" 事件
    mainWindow.once('ready-to-show', async () => {
        mainWindow.show() // 当渲染器加载完毕时显示窗口
    });

    if (isDev) {
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.removeMenu()
    }

    mainWindow.on('closed', () => {
        mainWindow.destroy()
    })
    return mainWindow
}
