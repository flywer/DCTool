import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const scan = () => {
    return ipcInstance.send<string>(channels.ocr.scan);
}
