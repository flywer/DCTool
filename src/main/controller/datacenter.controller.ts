import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {net} from "electron";

@Controller()
export class DatacenterController {
    constructor() {
    }

    private static apiUrl = 'http://19.15.97.242:19080/szrzyt/data_center/gateway';

    private static authToken = 'bb34f495-6a6c-47c4-ad6a-6fcf554389df';

    @IpcHandle(channels.datacenter.request)
    public async datacenterRequest(path: string, method: 'POST' | 'GET') {
        let result
        await this.makeRequest(method, path)
            .then((res) => {
                result = res;
            })
            .catch((err) => {
                console.error(err);
            });
        return result
    }

    public makeRequest(method, path) {
        return new Promise((resolve, reject) => {
            const request = net.request({
                method: method,
                url: `${DatacenterController.apiUrl}${path}`
            });
            request.setHeader('Authorization', `bearer ${DatacenterController.authToken}`)
            request.setHeader('Content-Type', 'application/json;charset=UTF-8');

            let data = '';

            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const res = JSON.parse(data);
                        resolve(res);
                    } catch (err) {
                        reject(err);
                    }
                });
            });

            request.on('error', (err) => {
                reject(err);
            });

            if (path == '/services/am-usrc/usrc/user/sm-list') {
                request.write('{}')
            }

            request.end();
        });
    }

    @IpcHandle(channels.datacenter.dataSourceList)
    public async handleDataSourceList(current: number, size: number) {
        let result
        await new Promise((resolve, reject) => {
            const request = net.request({
                method: 'GET',
                url: `${DatacenterController.apiUrl}/gather/api/jobJdbcDatasource/findPage?current=${current}&size=${size}`
            });
            request.setHeader('Authorization', `bearer ${DatacenterController.authToken}`)
            request.setHeader('Content-Type', 'application/json;charset=UTF-8');

            let data = '';

            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const res = JSON.parse(data);
                        resolve(res);
                    } catch (err) {
                        reject(err);
                    }
                });
            });

            request.on('error', (err) => {
                reject(err);
            });

            request.end();
        }).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.checkInsertSql)
    public async handleCheckInsertSql(params: any) {
        let result
        await new Promise((resolve, reject) => {
            const request = net.request({
                method: 'POST',
                url: `${DatacenterController.apiUrl}/data_develop/assembly/checkSql`
            });
            request.setHeader('Authorization', `bearer ${DatacenterController.authToken}`)
            request.setHeader('Content-Type', 'application/json;charset=UTF-8');

            let data = '';

            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const res = JSON.parse(data);
                        resolve(res);
                    } catch (err) {
                        reject(err);
                    }
                });
            });

            request.on('error', (err) => {
                reject(err);
            });

            request.write(JSON.stringify(params))

            request.end();
        }).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }
}
