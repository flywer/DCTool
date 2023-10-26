import {getResourcePath} from "@main/utils/appPath";
import {readFsSync} from "@main/utils/fsUtils";
import {failure, success} from "@main/vo/resultVo";
import {cut, cutForSearch, loadDict} from "@node-rs/jieba";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import log from "electron-log";
import path from "path";

@Controller()
export class ExtractLawsController {
    constructor() {
        loadDict(readFsSync(path.join(getResourcePath(), '/assets/jieba_dict/jieba_THUOCL_law.txt')))
    }

    @IpcHandle(channels.extractLaws.extract)
    public async handleExtract(texts: string[]) {
        try {
            let data: string[][] = []
            texts.forEach(text => {
                data.push(cutForSearch(text, false))
            })

            let result = success()
            result.data = data
            return result
        } catch (e) {
            log.error(e)
            return failure('提取失败')
        }

    }

}
