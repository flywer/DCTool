// 更新其中sjk开头的uuid
import {uuid} from "vue3-uuid";

export const updateSjkUUID = (json) => {
    let xmlIds: string[] = []
    json.modelXml.match(/id="sjk[^"]*"/g).forEach(idStr => {
        xmlIds.push(idStr.replace(/id="|"/g, ''));
    })

    let jsonIds: string[] = []
    json.modelJson.match(/"id":"sjk[^"]*"/g).forEach(idStr => {
        jsonIds.push(idStr.replace(/"id":"|"/g, ''));
    })

    const mergeArr = mergeArrays(xmlIds, jsonIds)

    let jsonStr = JSON.stringify(json, null, 2)

    for (const i of mergeArr) {
        if (jsonStr.includes(i)) {
            const uuidStr = 'sjk' + uuid.v4().replace(/-/g, '');
            jsonStr = jsonStr.replaceAll(i, uuidStr);
        }
    }

    return jsonStr
}

function mergeArrays(arr1: string[], arr2: string[]): string[] {
    const mergedArray = [...arr1, ...arr2];
    return Array.from(new Set(mergedArray));
}
