import {FilePathType} from "@common/enum/filePath";
import {checkPath} from "@main/utils/fsUtils";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {dialog} from "electron";
import fs from 'fs';
import {exec} from 'child_process';
import path from 'path';
import log from "electron-log";

@Controller()
export class LdDecryptController {
    constructor() {
    }

    @IpcHandle(channels.ldDecrypt.decrypt)
    public async ldDecrypt() {
        dialog.showOpenDialog({
            title: '选择待解密的文件',
            properties: ['openFile', 'multiSelections'],
            buttonLabel: '解密'
        }).then(result => {
            if (!result.canceled) {
                const filePaths = result.filePaths;

                filePaths.forEach(filePath => {
                    checkPath(filePath)
                        .then((type) => {
                            if (type == FilePathType.file) {

                                fs.readFile(filePath, (err, data) => {
                                    if (err) throw err;

                                    // 获取文件路径（不包含文件名）
                                    const dirPath = path.dirname(filePath);

                                    //文件类型
                                    const fileExt = path.extname(filePath);

                                    //文件名
                                    const fileName = path.basename(filePath, fileExt);

                                    //保存文件路径
                                    const savePath = dirPath + '\\' + fileName + '_temp' + '.js';

                                    fs.writeFileSync(savePath, data);

                                    //修改文件名
                                    exec(`ren \"${path.basename(savePath)}\" \"${fileName + '_解密' + fileExt}\"`, {cwd: `${path.dirname(savePath)}`}, (error) => {
                                        if (error) {
                                            log.error(error)
                                            throw err;
                                        }
                                    });

                                    //fes.move('C:\\Users\\aknith\\Desktop\\执法人员性质_解密.xlsx','D:\\执法人员性质_解密.xlsx')

                                });
                            } else if (type == FilePathType.dir) {

                            } else {
                                //无法解析此文件路径
                            }

                        })
                        .catch((error) => {
                            log.error(error);
                        });
                })
            }

        }).catch(err => {
            log.log(err)
        })

    }

}
