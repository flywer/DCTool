import {join} from 'path'
import {BrowserWindow, app} from 'electron'

const isDev = !app.isPackaged

export async function createWindow() {
    const win = new BrowserWindow({
        width: 943,
        height: 625,
        frame: false, // 无边框
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: join(__dirname, '../preload/index.js'),
            devTools: isDev,
            webSecurity: false,// 允许跨域访问
           // nodeIntegration: false, // 允许 Node.js APIs 在渲染进程中使用
           // nodeIntegrationInWorker: true, // 允许 Node.js APIs 在 Web Worker 中使用（仅 Electron 5+）
          //  nodeIntegrationInSubFrames: true // 允许 Node.js APIs 在子 frame 中使用（仅 Electron 5+）
        },
        autoHideMenuBar: !isDev,
    })

    //win.maximize()

    const URL = isDev
        ? process.env.DS_RENDERER_URL
        : `file://${join(app.getAppPath(), 'dist/render/index.html')}`

    win.loadURL(URL)

    if (isDev) {
        win.webContents.openDevTools()
    } else {
        win.removeMenu()
    }

    win.on('closed', () => {
        win.destroy()
    })

    return win
}

export async function restoreOrCreateWindow() {
    let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed())

    if (window === undefined) {
        window = await createWindow()
    }

    if (window.isMinimized()) {
        window.restore()
    }

    window.focus()
}
