import {FilePathType} from "@main/enum/filePathEnum";
import log from 'electron-log'
import fs from "fs";
import jsonfile from 'jsonfile'

/**
 *  获取此文件路径类型
 **/
export function checkPath(path: string): Promise<FilePathType> {
    return new Promise((resolve, reject) => {
        fs.stat(path, (error, stats) => {
            if (error) {
                reject(error);
            } else {
                const isFile = stats.isFile();
                const isDir = stats.isDirectory();
                if (isFile) {
                    resolve(FilePathType.file);
                } else if (isDir) {
                    resolve(FilePathType.dir);
                } else {
                    reject(FilePathType.unknown);
                }
            }
        });
    });
}

/**
 *  获取文件绝对路径的盘符
 **/
export const getDriveLetter = (filePath: string) => {
    // 获取路径中的盘符（仅适用于Windows）
    return filePath.match(/^([A-Za-z]:)/)[0];
}

/**
 * 同步读取文件，文件不存在则返回null
 * @param filePath
 */
export const readFsSync = (filePath: string) => {
    try {
        return fs.readFileSync(filePath);
    } catch (error) {
        log.error(error);
        return null;
    }
};

/**
 * 异步读取文件，文件不存在则返回null
 **/
export const readFsAsync = async (filePath: string) => {
    try {
        return await fs.promises.readFile(filePath);
    } catch (error) {
        log.error(error);
        return null;
    }
};

export const jsonfileWrite = (filePath: string, obj: any, option?: {}) => {
    jsonfile.writeFile(filePath, obj, option, function (err: any) {
        if (err) {
            log.error(err)
        }
    })
}
