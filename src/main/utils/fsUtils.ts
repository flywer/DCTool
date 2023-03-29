import {FilePathType} from "@main/enum/filePathEnum";
import fs from "fs";

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
