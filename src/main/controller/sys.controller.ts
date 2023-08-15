import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {nativeTheme} from 'electron'

@Controller()
export class SysController {
    constructor() {
    }

    // 判断系统主题色
    @IpcHandle(channels.sys.shouldUseDarkColors)
    public handleShouldUseDarkColors() {
        // 获取当前是否应该使用深色主题
        return nativeTheme.shouldUseDarkColors;
    }

}
