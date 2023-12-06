import {ActionJobNodeSuffix} from "@common/types/jobMgt";
import {getAppDataPath} from "@main/utils/appPath";
import {jsonfileWrite, readFsSync} from "@main/utils/fsUtils";
import {MAIN_WINDOW} from "@main/window/constants";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle, IpcSend} from "einf";
import log from "electron-log";
import {isEmpty} from "lodash";
import {join} from "path";

@Controller()
export class JobTreeController {
    constructor() {
    }

    @IpcHandle(channels.jobTree.updateNodeSuffix)
    public async handleUpdateNodeSuffix(nodeSuffixMap: Map<string, ActionJobNodeSuffix>) {
        const jsonString = JSON.stringify([...nodeSuffixMap]);

        const filePath = join(getAppDataPath(), 'config', 'jobTreeNodeSuffix.json')
        await jsonfileWrite(filePath, jsonString)

        this.handleSendNodeSuffixUpdated(nodeSuffixMap)
    }

    @IpcSend(channels.jobTree.sendNodeSuffixUpdated, MAIN_WINDOW)
    public handleSendNodeSuffixUpdated(nodeSuffix: Map<string, ActionJobNodeSuffix>) {
        return nodeSuffix
    }

    @IpcHandle(channels.jobTree.getNodeSuffix)
    public async handleGetNodeSuffix() {
        let nodeSuffix = new Map<string, ActionJobNodeSuffix>()

        const filePath = join(getAppDataPath(), 'config', 'jobTreeNodeSuffix.json')
        const buffer = readFsSync(filePath)

        if (buffer == null || isEmpty(buffer.toString())) {

        } else {
            try {
                // 将 JSON 字符串转换回 Map 对象
                const jsonMap: [string, ActionJobNodeSuffix][] =  JSON.parse(JSON.parse(buffer.toString()))
                if (jsonMap && jsonMap.length > 0) {
                    jsonMap.forEach(item => {
                        nodeSuffix.set(<string>item.at(0), <ActionJobNodeSuffix>item.at(1))
                    })
                }
            } catch (e) {
                log.error(e)
                await jsonfileWrite(filePath, JSON.stringify([...nodeSuffix]), {spaces: 2})
            }
        }

        return nodeSuffix
    }
}
