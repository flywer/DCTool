// 更新其中sjk开头的uuid
import {ArrayUtils} from "@render/utils/common/ArrayUtils";
import {uuid} from "vue3-uuid";

export const updateSjkUUID = (json: any) => {
    let xmlIds: string[] = []
    json.modelXml.match(/id="sjk[^"]*"/g).forEach(idStr => {
        xmlIds.push(idStr.replace(/id="|"/g, ''));
    })

    let jsonIds: string[] = []
    json.modelJson.match(/"id":"sjk[^"]*"/g).forEach(idStr => {
        jsonIds.push(idStr.replace(/"id":"|"/g, ''));
    })

    const mergeArr = ArrayUtils.mergeAndDistinctArrays(xmlIds, jsonIds)

    let jsonStr = JSON.stringify(json, null, 2)

    for (const i of mergeArr) {
        if (jsonStr.includes(i)) {
            const uuidStr = 'sjk' + uuid.v4().replace(/-/g, '');
            jsonStr = jsonStr.replaceAll(i, uuidStr);
        }
    }

    return jsonStr
}
