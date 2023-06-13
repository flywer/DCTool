import {getAppTempDataPath} from "@main/utils/appPath";
import {getDayString} from "@main/utils/dateUtils";
import Path from "path";
import log from 'electron-log'

/**
 * 应用日志初始化
 */
export const appLogInit = () => {
    //设置日志存储位置
    const logPath = Path.join(getAppTempDataPath(), 'logs')

    //根据日期来存日志
    log.transports.file.resolvePath = () => Path.join(logPath, '/n1-' + getDayString() + '.log')
}
