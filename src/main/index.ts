import {DepartCatalogHookRecordController} from "@main/controller/auxiliaryDb/departCatalogHookRecord.controller";
import {DictController} from "@main/controller/auxiliaryDb/dict.controller";
import {FEDepartTableNameController} from "@main/controller/auxiliaryDb/fEDepartTableName.controller";
import {JobJsonController} from "@main/controller/auxiliaryDb/jobJson.controller";
import {FieldInspectionRuleController} from "@main/controller/auxiliaryDb/jobTemplate/fieldInspectionRule.controller";
import {JobTemplateController} from "@main/controller/auxiliaryDb/jobTemplate/jobTemplate.controller";
import {PreDatabaseController} from "@main/controller/auxiliaryDb/preDatabase.controller";
import {SztkDictController} from "@main/controller/auxiliaryDb/sztkDict.controller";
import {TableSqlController} from "@main/controller/auxiliaryDb/tableSql.controller";
import {TemplateStructTableController} from "@main/controller/auxiliaryDb/jobTemplate/templateStructTable.controller";
import {UserController} from "@main/controller/auxiliaryDb/user.controller";
import {CronController} from "@main/controller/cron.controller";
import {DatacenterController} from "@main/controller/datacenter.controller";
import {FrontController} from "@main/controller/front.controller";
import {JobDetailController} from "@main/controller/jobDetail.controller";
import {JobTreeController} from "@main/controller/jobTree.controller";
import {LdDecryptController} from "@main/controller/ldDecrypt.controller";
import {LoginController} from "@main/controller/login.controller";
import {ProjectInfoController} from "@main/controller/auxiliaryDb/projectInfo.controller";
import {ProjectJobDependencyController} from "@main/controller/projectJobDependency.controller";
import {ShareController} from "@main/controller/share.controller";
import {SvgController} from "@main/controller/svg.controller";
import {SysController} from "@main/controller/sys.controller";
import {TaskSchedulerController} from "@main/controller/taskScheduler.controller";
import {ExtractLawsController} from "@main/controller/toolbox/extractLaws.controller";
import {UpdaterController} from "@main/controller/updater.controller";
import {XlsxController} from "@main/controller/xlsx.controller";
import {AppDataSource} from "@main/dataSource/data-source";
import {FrontSource} from "@main/dataSource/front-source";
import {ShareSource} from "@main/dataSource/share-source";
import {getAppSettings} from "@main/utils/configUtils";
import {createWindow} from "@main/window/windowManager";
import {appLogInit} from "../app/app.log";
import {getAppDataPath} from "@main/utils/appPath";
import {app} from 'electron'
import log from 'electron-log'
import {createEinf} from 'einf'
import fs from "fs";
import {join} from "path";
import {tray, trayInit} from "../app/app.tray";
import {handleAutoUpdate} from "../app/app.updater";
import {AppController} from './controller/app.controller'
import {WindowController} from "@main/controller/window.controller";
import "reflect-metadata";
import {InspectionWrongRecordController} from "@main/controller/inspectionWrongRecord.controller";
import {JobOverviewStatRecordController} from "@main/controller/auxiliaryDb/jobOverviewStatRecord.controller";
import {LocalCacheSource} from "@main/dataSource/localCache-source";
import {JobTableItemCacheController} from "@main/controller/localCache/jobTableItemCache.controller";
import {GdZwfwController} from "@main/controller/toolbox/gdZwfw.controller";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

async function electronAppInit() {
    //设置操作系统全局名称
    app.setAppUserModelId('DCTool')
    // 禁用缓存
    app.commandLine.appendSwitch('--disable-http-cache')
    //应用单例运行，不可存在多个同时运行
    if (!app.requestSingleInstanceLock()) app.quit();

    const isDev = !app.isPackaged

    app.on('window-all-closed', () => {
        TaskSchedulerController.getInstance().cronJobsStopAll()
        if (process.platform !== 'darwin') {
            AppDataSource.destroy()
            FrontSource.destroy()
            ShareSource.destroy()

            if (tray != null) {
                tray.destroy()
            }
            app.exit()
        }
    })

    ///应用启动后的操作
    app.whenReady().then(async () => {
        const setup = getAppSettings()
        if (setup != null && setup.enableSysTray) {
            trayInit()
        }
        if (setup != null && setup.autoUpdate) {
            handleAutoUpdate()
        }

        await TaskSchedulerController.getInstance().cronJobsStopAll()
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

        app.whenReady().then(async () => {
            await createEinf({
                window: createWindow(),
                controllers:
                    [
                        AppController,
                        WindowController,
                        LdDecryptController,
                        SvgController,
                        DatacenterController,
                        CronController,
                        XlsxController,
                        FrontController,
                        LoginController,
                        UpdaterController,
                        SysController,
                        JobDetailController,
                        ProjectJobDependencyController,
                        ProjectInfoController,
                        UserController,
                        TableSqlController,
                        JobJsonController,
                        PreDatabaseController,
                        SztkDictController,
                        DictController,
                        TaskSchedulerController,
                        FEDepartTableNameController,
                        ShareController,
                        ExtractLawsController,
                        JobTemplateController,
                        TemplateStructTableController,
                        FieldInspectionRuleController,
                        DepartCatalogHookRecordController,
                        JobTreeController,
                        InspectionWrongRecordController,
                        JobOverviewStatRecordController,
                        JobTableItemCacheController,
                        GdZwfwController
                    ],
                injects: [{
                    name: 'IS_DEV',
                    inject: !app.isPackaged,
                }],
            })
        })

        AppDataSource.initialize().then(async () => {
            log.info("应用程序数据源连接初始化成功")

            const cron = new CronController()
            await cron.datacenterCronJobInit()

            const taskSchedulerInstance = TaskSchedulerController.getInstance()
            await taskSchedulerInstance.cronJobsStartAll()

        }).catch(error => log.error('应用程序数据源连接失败', error))

        LocalCacheSource.initialize().then(async () => {
            log.info("本地缓存库连接初始化成功")
        }).catch(error => log.error('本地缓存库连接失败', error))

    } catch (error) {
        log.error(error)
        app.quit()
    }
}

bootstrap()

/**
 * 创建cron、config文件夹，防止不存在报错
 */
function appDataFolderInit() {
    fs.mkdir(join(getAppDataPath(), 'cron'), {recursive: true}, (error) => {
        if (error) log.error(error)
    })
    fs.mkdir(join(getAppDataPath(), 'config'), {recursive: true}, (error) => {
        if (error) log.error(error)
    })
}
