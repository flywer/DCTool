import {getAppTempDataPath} from "@main/utils/appPath";
import {getDayString} from "@main/utils/dateUtils";
import Path from "path";
import log from 'electron-log'

// 设置日志存储位置
export const LOG_PATH = Path.join(Path.join(getAppTempDataPath(), 'logs'), '/dct-' + getDayString() + '.log')

/**
 * 应用日志初始化
 */
export const appLogInit = () => {
    // 根据日期来存日志
    log.transports.file.resolvePath = () => LOG_PATH
}
