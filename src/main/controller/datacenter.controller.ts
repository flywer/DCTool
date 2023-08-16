import {AppDataSource} from "@main/dataSource/data-source";
import {User} from "@main/entity/User";
import {getAppDataPath} from "@main/utils/appPath";
import {readFsSync} from "@main/utils/fsUtils";
import {MAIN_WINDOW} from "@main/window/constants";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle, IpcSend} from "einf";
import {dialog, net} from "electron";
import log from 'electron-log'
import {isEmpty} from "lodash";
import {join} from "path";

@Controller()
export class DatacenterController {
    constructor() {
    }

    private static apiUrl = 'http://19.15.97.242:19080/szrzyt/data_center/gateway';

    public async getAuthToken(account: string) {
        let res
        try {
            await AppDataSource.getRepository(User).findOneBy({
                account: account
            }).then((data) => {
                res = data.dcToken
            })
        } catch (e) {
            log.error(e)
            dialog.showMessageBox({
                type: 'error',
                title: '网络连接错误',
                message: `无法连接到辅助库，中台辅助功能无法使用，查看政务外网连接是否正常`,
                buttons: ['ok']
            })
            res = null
        }
        return res
    }

    @IpcSend(channels.datacenter.authTokenNotice, MAIN_WINDOW)
    public handleAuthTokenNotice() {
        return `数据中台访问令牌出错或不存在，请前往应用设置修改令牌`
    }

    @IpcHandle(channels.datacenter.jobProjectListAll)
    public async handleGetJobListAll() {
        let result

        await this.commonGetRequest('/gather/api/jobProject/list', null)
            .then((res) => {
                result = res;
            })
            .catch((err) => {
                log.error(err);
            });
        return result
    }

    @IpcHandle(channels.datacenter.getJobProjectListByPage)
    public async handleGetJobProjectListByPage(param:any) {
        let result

        const query = `pageNo=${param.pageNo}&pageSize=${param.pageSize}&searchVal=${param.searchParam}&subsystemName=%E9%87%87%E9%9B%86`
        await this.commonGetRequest('/gather/api/jobProject/listAll', query)
            .then((res) => {
                result = res;
            })
            .catch((err) => {
                log.error(err);
            });
        return result
    }

    @IpcHandle(channels.datacenter.getProject)
    public async handleGetProject(id: string) {
        let result

        await this.commonGetRequest(`/gather/api/jobProject/${id}`, null)
            .then((res) => {
                result = res;
            })
            .catch((err) => {
                log.error(err);
            });
        return result
    }

    @IpcHandle(channels.datacenter.personList)
    public async handlePersonList() {
        let result
        await this.commonPostRequest('/services/am-usrc/usrc/user/sm-list', {}).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.login)
    public async handleLogin() {
        let result
        await this.commonPostRequest('services/am-uaa/uaa/auth/login', {
            username: 'admin',
            password: 'efK8+UmtAmmDbcK16wJgKMgJO4ROZPXi4ahnqrr0ALN2MZUBuJx8aFsBMnz4vzZxEj4WQrXNCaGeuncQvng7mA==',
            code: '2883',
            key: '8b816100f53a49f9b94d7867d225e7c0'
        }).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
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
                log.error(err);
            });
        return result
    }

    @IpcHandle(channels.datacenter.checkInsertSql)
    public async handleCheckInsertSql(params: any) {
        let result
        await this.commonPostRequest('/data_develop/assembly/checkSql', params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
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
            log.error(err);
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
            log.error(err);
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
            log.error(err);
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
            log.error(err);
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
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.addSchedTask)
    public async handleAddSchedTask(params: any) {
        let result
        await this.commonPostRequest('/gather/api/job/add', params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.execSql)
    public async handleExecSql(params: any) {
        let result
        await this.commonPostRequest('/datawork/datamodelTables/save', params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.sqlValid)
    public async handleSqlValid(params: any) {
        let result
        await this.commonPostRequest('/gather/api/metadataCatch/executeSqlPost', params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
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
            log.error(err);
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
            log.error(err);
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
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getSchedJobPage)
    public async handleGetSchedJobPage(obj: string) {
        let result

        const params = JSON.parse(obj)

        let paramStr = '';
        if (params.current !== undefined) {
            paramStr += `current=${params.current}&`;
        }
        if (params.size !== undefined) {
            paramStr += `size=${params.size}&`;
        }
        if (params.blurry !== undefined) {
            paramStr += `blurry=${params.blurry}&`;
        }
        if (params.jobContent !== undefined) {
            paramStr += `jobContent=${params.jobContent}&`;
        }
        if (params.jobDesc !== undefined) {
            paramStr += `jobContent=${params.jobDesc}&`;
        }
        if (params.projectName !== undefined) {
            paramStr += `jobContent=${params.projectName}&`;
        }
        if (params.subsystemName !== undefined) {
            paramStr += `subsystemName=${encodeURIComponent(params.subsystemName)}&`;
        }

        await this.commonGetRequest('/gather/api/job/pageList', paramStr.slice(0, -1)).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.dataxJobStart)
    public async handleDataXJobStart(id: string) {
        let result

        const query = `id=${id}&subsystemName=%E9%87%87%E9%9B%86`;

        await this.commonGetRequest('/gather/api/job/start', query).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.dataxJobStop)
    public async handleDataXJobStop(id: string) {
        let result

        const query = `id=${id}&subsystemName=%E9%87%87%E9%9B%86`;

        await this.commonGetRequest('/gather/api/job/stop', query).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
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
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.dataxJobRun)
    public async handleDataXJobRun(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest('/gather/api/job/trigger', params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.dataxJobDelete)
    public async handleCjJobDelete(id: any) {
        let result
        const params = {
            subsystemName: "采集"
        }
        await this.commonPostRequest(`/gather/api/jobTemplate/remove/${id}`, params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
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
            log.error(err);
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
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getDataxJobLog)
    public async handleGetDataXJobLog(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest(`/gather/api/log/pageList`, params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
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
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getValidConfigPage)
    public async handleGetValidConfigPage(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest(`/qaportal/dwInspectionPortalConfig/page`, params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getUsrcOrgTree)
    public async handleGetUsrcOrgTree() {
        let result

        await this.commonPostRequest(`/services/am-usrc/usrc/org/findOrgTree?orgType=GA&area=`, {}).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getDictByName)
    public async handleGetDictByName(params: any) {
        let result
        params = JSON.parse(params)
        await this.commonPostRequest(`/datawork/normCodeSet/page`, params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getDictListById)
    public async handleGetDictListById(id: string) {
        let result
        const params = {
            codeSetId: id
        }
        await this.commonPostRequest(`/datawork/normCode/findList`, params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
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
            log.error(err);
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
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.tablePreview)
    public async handleTablePreview(datasourceId: number, tableName: string) {
        let result

        const query = `id=${datasourceId}&tableName=${tableName}&limitNum=10`;

        await this.commonGetRequest(`/datawork/dataSource/getLimitNum`, query).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
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
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.workflowLog)
    public async handleWorkflowLog(id: string, size: number, page: number) {
        let result

        const query = `procInfoId=${id}&size=${size}&page=${page}`;

        await this.commonGetRequest(`/workflow/workflow-log/list`, query).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.workflowRerun)
    public async handleWorkflowRerun(id: string, type: number) {
        let result

        const query = `type=${type}`;

        await this.commonGetRequest(`/workflow/proc/rerun/${id}`, query).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.inspHomeList)
    public async handleInspHomeList() {
        let result
        await this.commonGetRequest(`/qaportal/dwInspectionRecord/findHomeList`, ``).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getInpsRecordPage)
    public async handleGetInpsRecordPage(obj: any) {
        let result
        obj = JSON.parse(obj)
        let params
        params = {
            page: obj.page,
            size: obj.size,
            orgIds: obj.orgIds,
            orders: [
                {
                    asc: false,
                    column: 'create_time'
                }
            ]
        }

        if (obj.likeName != undefined && obj.likeName.length > 0) {
            params.likeName = obj.likeName
            params.likeType = 1
        }

        if (!isEmpty(obj.inspTime)) {
            params.inspectionTimeStart = obj.inspTime[0]
            params.inspectionTimeEnd = obj.inspTime[1]
        }

        await this.commonPostRequest(`/qaportal/dwInspectionRecord/page`, params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getWorkflow)
    public async handleGetWorkflow(jobId: string) {
        let result
        await this.commonGetRequest(`/workflow/proc/get/${jobId}`, ``).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.updateWorkflow)
    public async handleUpdateWorkflow(jobId: string, param: any) {
        let result
        const params = JSON.parse(param)
        await this.commonPostRequest(`/workflow/proc/update/${jobId}`, params).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    @IpcHandle(channels.datacenter.getDataXJob)
    public async handleGetDataXJob(jobId: string) {
        let result
        await this.commonGetRequest(`/gather/api/jobTemplate/get/${jobId}`, `subsystemName=%E9%87%87%E9%9B%86`).then((res) => {
            result = res;
        }).catch((err) => {
            log.error(err);
        });
        return result
    }

    public async getAccountByConfig() {
        const filePath = join(getAppDataPath(), 'config', 'user.json')
        const buffer = await readFsSync(filePath)
        let account
        if (buffer == null || isEmpty(buffer.toString())) {
            account = null
        } else {
            account = JSON.parse(buffer.toString()).account
        }
        return account
    }

    public commonGetRequest(url: string, query: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const request = net.request({
                method: 'GET',
                url: `${DatacenterController.apiUrl}${url}?${query || ''}`
            });

            const authToken = await this.getAuthToken(await this.getAccountByConfig())

            if (authToken != null) {
                request.setHeader('Authorization', `bearer ${authToken}`)
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
                            log.error(data)
                            reject(err);
                        }
                    });
                });

                request.on('error', (err) => {
                    reject(err);
                });

                request.end();
            } else {
                this.handleAuthTokenNotice()
                return null
            }

        })
    }

    public commonPostRequest(url: string, params: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const request = net.request({
                method: 'POST',
                url: `${DatacenterController.apiUrl}${url}`
            });

            const authToken = await this.getAuthToken(await this.getAccountByConfig())
            if (authToken != null) {
                request.setHeader('Authorization', `bearer ${authToken}`)
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
                            log.error(err)
                            reject(err);
                        }
                    });
                });

                request.on('error', (err) => {
                    log.error(err)
                    reject(err);
                });

                request.write(JSON.stringify(params))

                request.end();
            } else {
                this.handleAuthTokenNotice()
                return null
            }

        })

    }
}
