import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {dialog} from "electron";
import fs from "fs";
import path from "path";
import {uniqueId} from 'lodash';

@Controller()
export class SvgController {
    constructor() {
    }

    @IpcHandle(channels.svg.saveSvgFile)
    public async decodeSvgBase64(svgBase64Str: string) {
        // 去除Base64编码中的前缀
        const prefix = 'data:image/svg+xml;base64,';
        const base64String = svgBase64Str.substring(prefix.length);

        // 将Base64字符串转成Buffer
        const svgBuffer = Buffer.from(base64String, 'base64');

        // 写入SVG文件
        fs.writeFileSync(path.join(__dirname, 'example.svg'), svgBuffer);

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'svg',
                extensions: ['svg']
            }],
            defaultPath: 'svg_' + uniqueId()
        }).then(res => {
            if (!res.canceled) {
                // 写入SVG文件
                fs.writeFileSync(res.filePath, svgBuffer);
            }
        })
    }
}
