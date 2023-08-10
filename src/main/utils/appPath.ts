import os from "os";
import path from "path";

/**
 * 获取本应用在操作系统中的文件存储位置
 */
export const getAppDataPath = () => {
    return path.join(os.homedir(), '/AppData/Local/DCTool')
}

/**
 * 获取本应用在操作系统的临时文件存储位置
 */
export const getAppTempDataPath = () => {
    return path.join(os.tmpdir(), '/DCTool')
}

export const getResourcePath = () => {
    return !process.env.NODE_ENV || process.env.NODE_ENV === "production"
        ? process.resourcesPath // Live Mode
        : process.cwd(); // Dev Mode
}
