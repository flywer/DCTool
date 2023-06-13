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

    @IpcHandle(channels.datacenter.createTable)
    public async handleCreateTable(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest('/datawork/datamodelTables/save', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getWorkflowPage)
    public async handleGetWorkflowPage(params: string) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest('/workflow/proc/page', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getCjJobPage)
    public async handleGetCjJobPage(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest('/gather/api/jobTemplate/findPage', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getSchedJobPage)
    public async handleGetSchedJobPage(current: number, size: number, blurry: string) {
        let result

        const query = `current=${current}&size=${size}&blurry=${blurry}&subsystemName=%E9%87%87%E9%9B%86`;

        await this.commonGetRequest('/gather/api/job/pageList', query).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.cjJobStart)
    public async handleCjJobStart(id: string) {
        let result

        const query = `id=${id}&subsystemName=%E9%87%87%E9%9B%86`;

        await this.commonGetRequest('/gather/api/job/start', query).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.cjJobStop)
    public async handleCjJobStop(id: string) {
        let result

        const query = `id=${id}&subsystemName=%E9%87%87%E9%9B%86`;

        await this.commonGetRequest('/gather/api/job/stop', query).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.workflowActive)
    public async handleWorkflowActive(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest('/workflow/proc/activate', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.cjJobRun)
    public async handleCjJobRun(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest('/gather/api/job/trigger', params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.cjJobDelete)
    public async handleCjJobDelete(id: any) {
        let result
        const params = {
            subsystemName: "采集"
        }
        await this.commonPostRequest(`/gather/api/jobTemplate/remove/${id}`, params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.workflowRun)
    public async handleWorkflowRun(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest(`/workflow/proc-inst/start`, params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getTablesInfo)
    public async handleGetTablesInfo(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest(`/datawork/datamodelTables/page`, params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getCjJobLog)
    public async handleGetCjJobLog(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest(`/gateway/gather/api/log/pageList`, params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.createValidConfig)
    public async handleCreateValidConfig(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest(`/qaportal/dwInspectionPortalConfig/add`, params).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.schedJobDelete)
    public async handleSchedJobDelete(id: string) {
        let result

        const query = `subsystemName=%E9%87%87%E9%9B%86`;

        await this.commonGetRequest(`/gather/api/job/remove/${id}`, query).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.workflowDelete)
    public async handleWorkflowDelete(id: string) {
        let result

        const query = ``;

        await this.commonGetRequest(`/workflow/proc/delete/${id}`, query).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.tablePreview)
    public async handleTablePreview(datasourceId: number, tableName: string) {
        let result

        const query = `datasourceId=${datasourceId}&tableName=${tableName}&subsystemName=%E9%87%87%E9%9B%86`;

        await this.commonGetRequest(`/gather/api/metadata/getDataTen`, query).then((res) => {
            result = res;
        }).catch((err) => {
            console.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.tableDelete)
    public async handleTableDelete(id: string) {
        let result

        const query = ``;

        await this.commonGetRequest(`/datawork/datamodelTables/delete/${id}`, query).then((res) => {
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
