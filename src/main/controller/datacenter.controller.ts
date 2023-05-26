import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {net} from "electron";

@Controller()
export class DatacenterController {
    constructor() {
    }

    private static apiUrl = 'http://19.15.97.242:19080/szrzyt/data_center/gateway';

    private static authToken = 'bb34f495-6a6c-47c4-ad6a-6fcf554389df';

    @IpcHandle(channels.datacenter.jobList)
    public async handleJobList() {
        let result
        await this.commonGetRequest('/gather/api/jobProject/list', null)
            .then((res) => {
                result = res;
            })
            .catch((err) => {
                console.error(err);
            });
        return result
    }

    @IpcHandle(channels.datacenter.personList)
    public async handlePersonList() {
        let result
        await this.commonPostRequest('/services/am-usrc/usrc/user/sm-list', {}).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.dataSourceList)
    public async handleDataSourceList(current: number, size: number) {
        let result
        const query = `current=${current}&size=${size}`

        await this.commonGetRequest('/gather/api/jobJdbcDatasource/findPage', query)
            .then((res) => {
                result = res;
            })
            .catch((err) => {
                console.error(err);
            });
        return result
    }

    @IpcHandle(channels.datacenter.checkInsertSql)
    public async handleCheckInsertSql(params: any) {
        let result
        await this.commonPostRequest('/data_develop/assembly/checkSql', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.addWorkFlow)
    public async handleAddWorkFlow(params: any) {
        let result
        await this.commonPostRequest('/workflow/proc/add', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getColumns)
    public async handleGetColumns(datasourceId: string, tableName: string) {
        let result

        const query = `datasourceId=${datasourceId}&tableName=${tableName}`;

        await this.commonGetRequest('/gather/api/metadata/getColumns', query).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getTables)
    public async handleGetTables(datasourceId: string) {
        let result

        const query = `datasourceId=${datasourceId}`;

        await this.commonGetRequest('/gather/api/metadata/getTables', query).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    public commonGetRequest(url: string, query: string) {
        return new Promise((resolve, reject) => {
            const request = net.request({
                method: 'GET',
                url: `${DatacenterController.apiUrl}${url}?${query || ''}`
            });
            request.setHeader('Authorization', `bearer ${DatacenterController.authToken}`)
            //  request.setHeader('Content-Type', 'application/json;charset=UTF-8');

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
        })
    }

    public commonPostRequest(url: string, params: any) {
        return new Promise((resolve, reject) => {
            const request = net.request({
                method: 'POST',
                url: `${DatacenterController.apiUrl}${url}`
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
        })
    }
}
