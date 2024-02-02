import {Controller, IpcHandle} from "einf";
import {channels} from "@render/api/channels";
import {net} from "electron";
import log from "electron-log";
import jschardet from "jschardet";

@Controller()
export class GdZwfwController {

    @IpcHandle(channels.gdZwfw.fetchOrgNode)
    public handleFetchOrgNode(regCode: string) {
        return new Promise(async (resolve, reject) => {
            const urlParams = new URLSearchParams();
            urlParams.append("regCode", regCode);

            const request = net.request({
                method: 'POST',
                url: `https://www.gdzwfw.gov.cn/portal/api/v2/node/gdbsNav/current`
            });

            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');

            request.on('response', (response) => {
                let chunks = [];

                response.on('data', (chunk) => {
                    chunks.push(chunk); // 这里保存的是Buffer类型的数据而不是字符串
                });

                response.on('end', () => {
                    const data = this.decodeBuffer(chunks)
                    try {
                        const res = JSON.parse(data);
                        resolve(res);
                    } catch (err) {
                        log.error(data)
                        log.error(err)
                        reject(err)
                    }
                });
            });

            request.on('error', (err) => {
                log.error(err)
                reject(err);
            });

            request.write(urlParams.toString())
            request.end();
        })
    }

    @IpcHandle(channels.gdZwfw.fetchTaskTypeList)
    public handleFetchTaskTypeList(orgNumber: string) {
        return new Promise(async (resolve, reject) => {
            const request = net.request({
                method: 'GET',
                url: `https://www.gdzwfw.gov.cn/portal/api/v2/search/listTaskTypeByOrgNumber?orgNumber=${orgNumber}`
            });

            request.on('response', (response) => {
                let chunks = [];

                response.on('data', (chunk) => {
                    chunks.push(chunk); // 这里保存的是Buffer类型的数据而不是字符串
                });

                response.on('end', () => {
                    const data = this.decodeBuffer(chunks)
                    try {
                        const res = JSON.parse(data);
                        resolve(res);
                    } catch (err) {
                        log.error(data)
                        log.error(err)
                        reject(err);
                    }
                });
            });

            request.on('error', (err) => {
                log.error(err)
                reject(err);
            });

            request.end();
        })
    }

    private decodeBuffer(chunks: any[]) {
        const bufferData = Buffer.concat(chunks); // 将所有的Buffer合并为一个
        const encodingDetected = jschardet.detect(bufferData);

        let data: string | string[];

        const encodings = ["ascii", "utf8", "utf-8", "utf16le", "ucs2", "ucs-2", "base64", "base64url", "latin1", "binary", "hex"];
        // 检查检测到的编码是否属于允许的编码
        if (encodings.includes(encodingDetected.encoding.toLowerCase())) {
            data = bufferData.toString(encodingDetected.encoding as BufferEncoding);
        } else {
            data = bufferData.toString('utf-8'); // 使用默认的编码
        }

        return data
    }
}
