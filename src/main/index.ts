import {AdbController} from "@main/controller/adb.controller";
import {CronController} from "@main/controller/cron.controller";
import {DatacenterController} from "@main/controller/datacenter.controller";
import {LdDecryptController} from "@main/controller/ldDecrypt.controller";
import {OcrController} from "@main/controller/ocr.controller";
import {SvgController} from "@main/controller/svg.controller";
import {AppDataSource} from "@main/data-source";
import {appLogInit} from "@main/log";
import {getAppDataPath} from "@main/utils/appPath";
import {app} from 'electron'
import log from 'electron-log'
import {createEinf} from 'einf'
import fs from "fs";
import {join} from "path";
import {AppController} from './controller/app.controller'
import {createWindow} from './main.window'
import {WindowController} from "@main/controller/window.controller";
import "reflect-metadata";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

async function electronAppInit() {

    //应用单例运行，不可存在多个同时运行
    if (!app.requestSingleInstanceLock()) app.quit();

    //设置操作系统全局名称
    app.setAppUserModelId('N1Tool')

    const isDev = !app.isPackaged
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.exit()
        }
    })

    if (isDev) {
        if (process.platform === 'win32') {
            process.on('message', (data) => {
                if (data === 'graceful-exit') {
                    app.exit()
                }
            })
        } else {
            process.on('SIGTERM', () => {
                app.exit()
            })
        }
    }
}

async function bootstrap() {
    try {
        appLogInit()

        appDataFolderInit()

        await electronAppInit()

        await createEinf({
            window: createWindow,
            controllers:
                [
                    AppController,
                    WindowController,
                    LdDecryptController,
                    OcrController,
                    SvgController,
                    DatacenterController,
                    AdbController,
                    CronController
                ],
            injects: [{
                name: 'IS_DEV',
                inject: !app.isPackaged,
            }],
        })

        AppDataSource.initialize().then(async () => {
            console.log("应用程序数据源连接初始化成功")

            const cron = new CronController()
            await cron.datacenterCronJobInit();
        }).catch(error => console.log(error))

    } catch (error) {
        console.error(error)
        app.quit()
    }
}

bootstrap()

/**
 * 创建cron文件夹，防止不存在报错
 */
function appDataFolderInit() {
    fs.mkdir(join(getAppDataPath(), 'cron'), {recursive: true}, (error) => {
        if (error) log.error(error)
    })
}
