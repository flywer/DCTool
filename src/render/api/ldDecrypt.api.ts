import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const ld_decrypt = () => {
    return ipcInstance.send<string>(channels.ldDecrypt.decrypt);
}
