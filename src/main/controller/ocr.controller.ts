import {ocr} from "@main/ocr";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {dialog} from "electron";

@Controller()
export class OcrController {
    constructor() {
    }

    @IpcHandle(channels.ocr.scan)
    public async scan() {
        let result = ''
        await dialog.showOpenDialog({
            title: '选择待解密的文件',
            filters: [{
                name: 'pic',
                extensions: ['png', 'jpg', 'jpeg']
            }],
            properties: ['openFile']
        }).then(async res => {
            if (!res.canceled) {
                const filePaths = res.filePaths;
                result = await ocr(filePaths[0])
            }
        });

        return result
    }
}
