import {Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const extract = async (texts: string[]): Promise<Result> => {
    const {data} = (await ipcInstance.send(channels.extractLaws.extract, texts))
    return data
}
