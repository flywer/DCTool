import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const save_svg_file = (base64Str: string) => {
    return ipcInstance.send<string>(channels.svg.saveSvgFile, base64Str);
}
