import {AppDataSource} from "@main/data-source";
import {Dict} from "@main/entity/Dict";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle, IpcSend} from "einf";
import {net} from "electron";

@Controller()
export class DatacenterController {
    constructor() {
    }

    private static apiUrl = 'http://19.15.97.242:19080/szrzyt/data_center/gateway';

    public async getAuthToken() {
        let res
        await AppDataSource.getRepository(Dict).findOneBy({
            name: 'authToken'
        }).then((data) => {
            res = data.value
        })
        return res
    }

    @IpcSend(channels.datacenter.authTokenNotice)
    public handleAuthTokenNotice() {
        return `数据中台访问令牌已不合法，请前往设置修改令牌`
    }

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
        params = JSON.parse(params)
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
    public async handleGetTables(datasourceId: string, tableSchema: string) {
        let result

        const query = `datasourceId=${datasourceId}&tableSchema=${tableSchema}`;

        await this.commonGetRequest('/gather/api/metadata/getTables', query).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.buildDataXJson)
    public async handleBuildDataXJson(params: any) {
        let result

        params = JSON.parse(params)

        await this.commonPostRequest('/gather/api/dataxJson/buildJson', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.addDataXJob)
    public async handleAddDataXJob(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest('/gather/api/jobTemplate/add', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.addSchedTask)
    public async handleAddSchedTask(params: any) {
        let result
        await this.commonPostRequest('/gather/api/job/add', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.execSql)
    public async handleExecSql(params: any) {
        let result
        await this.commonPostRequest('/datawork/datamodelTables/save', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.sqlValid)
    public async handleSqlValid(params: any) {
        let result
        await this.commonPostRequest('/gather/api/metadataCatch/executeSqlPost', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    public commonGetRequest(url: string, query: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const request = net.request({
                method: 'GET',
                url: `${DatacenterController.apiUrl}${url}?${query || ''}`
            });
            request.setHeader('Authorization', `bearer ${await this.getAuthToken()}`)
            //  request.setHeader('Content-Type', 'application/json;charset=UTF-8');

            let data = '';

            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const res = JSON.parse(data);
                        if (res?.res_body?.includes('4010')) {
                            this.handleAuthTokenNotice()
                        }
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

    public commonPostRequest(url: string, params: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const request = net.request({
                method: 'POST',
                url: `${DatacenterController.apiUrl}${url}`
            });
            request.setHeader('Authorization', `bearer ${await this.getAuthToken()}`)
            request.setHeader('Content-Type', 'application/json;charset=UTF-8');

            let data = '';

            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const res = JSON.parse(data);
                        if (res.code == '4010') {
                            this.handleAuthTokenNotice()
                        }
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
