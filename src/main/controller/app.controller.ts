import {SetupModelType} from "@common/types";
import {getAppDataPath} from "@main/utils/appPath";
import {APP_CONFIG_PATH, getAppSettings} from "@main/utils/configUtils";
import {jsonfileWrite, readFsSync} from "@main/utils/fsUtils";
import {failure, Result, success} from "@main/vo/resultVo";
import {MAIN_WINDOW} from "@main/window/constants";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle, IpcSend} from 'einf'
import {app, shell, clipboard} from "electron";
import log from "electron-log";
import {autoUpdater} from "electron-updater";
import {isEmpty} from "lodash";
import {join} from "path";
import {tray, trayInit} from "../../app/app.tray";

type SetupModelTypeAlias = SetupModelType

@Controller()
export class AppController {
    constructor() {
    }

    @IpcHandle(channels.app.openDefaultBrowser)
    public handleOpenDefaultBrowser(link: string) {
        shell.openExternal(link).catch(error => {
            log.error(error)
        });
    }

    // 应用重启
    @IpcHandle(channels.app.relaunch)
    public handleRelaunch() {
        app.relaunch()
        app.exit(0)
    }

    @IpcHandle(channels.app.getSettings)
    public async handleGetSettings() {
        try {
            let result: Result
            const filePath = join(getAppDataPath(), 'config', 'app.json')
            const buffer = readFsSync(filePath)
            if (buffer == null || isEmpty(buffer.toString())) {
                result = success()
                result.data = null
            } else {
                result = success()
                result.data = JSON.parse(buffer.toString())
            }
            return result
        } catch (e) {
            log.error(e)
            return failure()
        }
    }

    @IpcHandle(channels.app.updateSettings)
    public async handleUpdateSettings(setupModel: SetupModelTypeAlias) {
        try {
            const newSettings = Object.assign({}, await getAppSettings(), setupModel);

            await jsonfileWrite(APP_CONFIG_PATH, newSettings, {spaces: 2})

            /*设置开机自启*/
            //mac系统
            if (process.platform === "darwin") {
                app.setLoginItemSettings({
                    openAtLogin: newSettings?.openAtLogin || false
                });
            } else {
                app.setLoginItemSettings({
                    openAtLogin: newSettings?.openAtLogin || false
                });
            }

            /*设置是否启用托盘*/
            if (newSettings?.enableSysTray) {
                trayInit()
            } else if (tray != null) {
                tray.destroy()
            }

            /*设置主题*/
            this.handleSendUpdateTheme()

            return success()
        } catch (e) {
            log.error(e)
            return failure()
        }
    }

    @IpcSend(channels.app.updateTheme, MAIN_WINDOW)
    public handleSendUpdateTheme() {
        return true
    }

    @IpcHandle(channels.app.getAppVersion)
    public handleGetAppVersion() {
        let result: Result
        try {
            result = success()
            result.data = autoUpdater.currentVersion.version
        } catch (e) {
            log.error(e)
            result = failure()
            result.data = e
        }
        return result
    }

    @IpcSend(channels.app.sendAppInstallNotice, MAIN_WINDOW)
    public handleSendAppInstallNotice() {
        return true
    }

    @IpcHandle(channels.app.quitAndInstall)
    public handleQuitAndInstall() {
        autoUpdater.quitAndInstall();
    }

    @IpcHandle(channels.app.clipboard.writeText)
    public handleClipboardWriteText(text: string) {
        clipboard.writeText(text)
    }
}
