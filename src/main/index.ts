import {AdbController} from "@main/controller/adb.controller";
import {DatacenterController} from "@main/controller/datacenter.controller";
import {LdDecryptController} from "@main/controller/ldDecrypt.controller";
import {OcrController} from "@main/controller/ocr.controller";
import {SvgController} from "@main/controller/svg.controller";
import {AppDataSource} from "@main/data-source";
import {app} from 'electron'
import {createEinf} from 'einf'
import {AppController} from './controller/app.controller'
import {createWindow} from './main.window'
import {WindowController} from "@main/controller/window.controller";
import "reflect-metadata";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

async function electronAppInit() {
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
                    AdbController
                ],
            injects: [{
                name: 'IS_DEV',
                inject: !app.isPackaged,
            }],
        })

        AppDataSource.initialize().then(async () => {
            console.log("应用程序数据源连接初始化成功")
        }).catch(error => console.log(error))

    } catch (error) {
        console.error(error)
        app.quit()
    }
}

bootstrap()
