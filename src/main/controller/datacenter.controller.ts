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
import jschardet from 'jschardet';

@Controller()
export class DatacenterController {
    constructor() {
    }

    private static apiUrl: string = 'http://19.15.97.242:19080/szrzyt/data_center/gateway';

    public async getAuthToken(account: string): Promise<string> {
        return new Promise<string>(async (resolve) => {
            try {
                await AppDataSource.getRepository(User).findOneBy({
                    account: account
                }).then((data) => {
                    resolve(data.dcToken)
                })
            } catch (e) {
                log.error(e)
                await dialog.showMessageBox({
                    type: 'error',
                    title: '网络连接错误',
                    message: `无法连接到辅助库，中台辅助功能无法使用，查看政务外网连接是否正常`,
                    buttons: ['ok']
                })
                resolve(null)
            }
        })

    }

    @IpcSend(channels.datacenter.authTokenNotice, MAIN_WINDOW)
    public handleAuthTokenNotice(): string {
        return `数据中台访问令牌出错或不存在，请前往应用设置修改令牌`
    }

    @IpcHandle(channels.datacenter.getUser)
    public handleGetUser() {
        return new Promise<any>((resolve) => {
            resolve(this.commonGetRequest('/services/am-uaa/uaa/auth/user', null))
        });
    }

    @IpcHandle(channels.datacenter.jobProjectListAll)
    public async handleGetJobListAll() {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest('/gather/api/jobProject/list', null))
        });
    }

    @IpcHandle(channels.datacenter.getJobProjectListByPage)
    public async handleGetJobProjectListByPage(param: any) {
        const query: string = `pageNo=${param.pageNo}&pageSize=${param.pageSize}&searchVal=${param.searchParam}&subsystemName=%E9%87%87%E9%9B%86`
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest('/gather/api/jobProject/listAll', query))
        });
    }

    @IpcHandle(channels.datacenter.getProject)
    public async handleGetProject(id: string) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/gather/api/jobProject/${id}`, null))
        });
    }

    @IpcHandle(channels.datacenter.personList)
    public async handlePersonList() {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/services/am-usrc/usrc/user/sm-list', {}))
        });
    }

    @IpcHandle(channels.datacenter.login)
    public async handleLogin() {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('services/am-uaa/uaa/auth/login', {
                username: 'admin',
                password: 'efK8+UmtAmmDbcK16wJgKMgJO4ROZPXi4ahnqrr0ALN2MZUBuJx8aFsBMnz4vzZxEj4WQrXNCaGeuncQvng7mA==',
                code: '2883',
                key: '8b816100f53a49f9b94d7867d225e7c0'
            }))
        });
    }

    @IpcHandle(channels.datacenter.dataSourceList)
    public async handleDataSourceList(current: number, size: number) {
        const query = `current=${current}&size=${size}`
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest('/gather/api/jobJdbcDatasource/findPage', query))
        });
    }

    @IpcHandle(channels.datacenter.getAllDataSource)
    public async handleGetAllDataSource(datasource: string) {
        const query = `datasource=${datasource}`
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest('/gather/api/jobJdbcDatasource/findAll', query))
        });
    }

    @IpcHandle(channels.datacenter.checkInsertSql)
    public async handleCheckInsertSql(params: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/data_develop/assembly/checkSql', params))
        });
    }

    @IpcHandle(channels.datacenter.addWorkFlow)
    public async handleAddWorkFlow(params: any) {
        params = JSON.parse(params)
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/workflow/proc/add', params))
        });
    }

    @IpcHandle(channels.datacenter.getColumns)
    public async handleGetColumns(datasourceId: string, tableName: string) {
        const query: string = `datasourceId=${datasourceId}&tableName=${tableName}`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest('/gather/api/metadata/getColumns', query))
        });
    }

    @IpcHandle(channels.datacenter.getTables)
    public async handleGetTables(datasourceId: string, tableSchema: string) {
        const query: string = `datasourceId=${datasourceId}&tableSchema=${tableSchema}`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest('/gather/api/metadata/getTables', query))
        });
    }

    @IpcHandle(channels.datacenter.buildDataXJson)
    public async handleBuildDataXJson(params: string) {
        params = JSON.parse(params)
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/gather/api/dataxJson/buildJson', params))
        });
    }

    @IpcHandle(channels.datacenter.addDataXJob)
    public async handleAddDataXJob(params: string) {
        params = JSON.parse(params)
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/gather/api/jobTemplate/add', params))
        });
    }

    @IpcHandle(channels.datacenter.updateDataXJob)
    public async handleUpdateDataXJob(params: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/gather/api/jobTemplate/update', params))
        });
    }

    @IpcHandle(channels.datacenter.addSchedTask)
    public async handleAddSchedTask(params: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/gather/api/job/add', params))
        });
    }

    @IpcHandle(channels.datacenter.getSchedJobById)
    public async handleGetSchedJobById(id: number | string) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/gather/api/job/${id}`, 'subsystemName=%E9%87%87%E9%9B%86'))
        });
    }

    @IpcHandle(channels.datacenter.updateSchedJob)
    public async handleUpdateSchedJob(params: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/gather/api/job/update`, params))
        });
    }

    @IpcHandle(channels.datacenter.execSql)
    public async handleExecSql(params: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/datawork/datamodelTables/save', params))
        });
    }

    @IpcHandle(channels.datacenter.sqlValid)
    public async handleSqlValid(params: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/gather/api/metadataCatch/executeSqlPost', params))
        });
    }

    @IpcHandle(channels.datacenter.createTable)
    public async handleCreateTable(params: any) {
        params = JSON.parse(params)
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/datawork/datamodelTables/save', params))
        });
    }

    @IpcHandle(channels.datacenter.getWorkflowPage)
    public async handleGetWorkflowPage(params: object) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/workflow/proc/page', params))
        });
    }

    @IpcHandle(channels.datacenter.getCjJobPage)
    public async handleGetCjJobPage(params: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/gather/api/jobTemplate/findPage', params))
        });
    }

    @IpcHandle(channels.datacenter.getSchedJobPage)
    public async handleGetSchedJobPage(params: any) {
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
            paramStr += `jobDesc=${params.jobDesc}&`;
        }
        if (params.projectName !== undefined) {
            paramStr += `projectName=${params.projectName}&`;
        }
        if (params.subsystemName !== undefined) {
            paramStr += `subsystemName=${encodeURIComponent(params.subsystemName)}&`;
        }

        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest('/gather/api/job/pageList', paramStr.slice(0, -1)))
        });
    }

    @IpcHandle(channels.datacenter.dataxJobStart)
    public async handleDataXJobStart(id: string) {
        const query: string = `id=${id}&subsystemName=%E9%87%87%E9%9B%86`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest('/gather/api/job/start', query))
        });
    }

    @IpcHandle(channels.datacenter.dataxJobStop)
    public async handleDataXJobStop(id: string) {
        const query: string = `id=${id}&subsystemName=%E9%87%87%E9%9B%86`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest('/gather/api/job/stop', query))
        });
    }

    @IpcHandle(channels.datacenter.workflowActive)
    public async handleWorkflowActive(obj: { id: string, type: '01' | '02' }) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/workflow/proc/activate', obj))
        });
    }

    @IpcHandle(channels.datacenter.dataxJobRun)
    public async handleDataXJobRun(params: any) {
        params = JSON.parse(params)
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/gather/api/job/trigger', params))
        });
    }

    @IpcHandle(channels.datacenter.runDataxJobByJobContent)
    public async handleRunDataxJobByJobContent(jobContent: string) {
        const params = {
            jobContent: jobContent,
            subsystemName: "采集"
        }
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest('/gather/api/jobTemplate/trigger', params))
        });
    }

    @IpcHandle(channels.datacenter.dataxJobDelete)
    public async handleCjJobDelete(id: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/gather/api/jobTemplate/remove/${id}`, {
                subsystemName: "采集"
            }))
        });
    }

    @IpcHandle(channels.datacenter.workflowRun)
    public async handleWorkflowRun(params: {
        businessKey: string,
        code: string,
        createBy: string,
        creator: string
    }) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/workflow/proc-inst/start`, params))
        });
    }

    @IpcHandle(channels.datacenter.getTablesInfo)
    public async handleGetTablesInfo(params: {
        size: number,
        page: number,
        sourceId: number,
        likeValue: string
    }) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/datawork/datamodelTables/page`, params))
        });
    }

    @IpcHandle(channels.datacenter.getTableInfoById)
    public handleGetTableInfoById(id: string) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/datawork/datamodelTables/get/${id}`, ``))
        });
    }

    @IpcHandle(channels.datacenter.getDataxJobLog)
    public async handleGetDataXJobLog(params: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/gather/api/log/pageList`, params))
        });
    }

    @IpcHandle(channels.datacenter.createValidConfig)
    public async handleCreateValidConfig(params: any) {
        params = JSON.parse(params)
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/qaportal/dwInspectionPortalConfig/add`, params))
        });
    }

    @IpcHandle(channels.datacenter.getValidConfigPage)
    public async handleGetValidConfigPage(params: any) {
        params = JSON.parse(params)
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/qaportal/dwInspectionPortalConfig/page`, params))
        });
    }

    @IpcHandle(channels.datacenter.getUsrcOrgTree)
    public async handleGetUsrcOrgTree() {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/services/am-usrc/usrc/org/findOrgTree?orgType=GA&area=`, {}))
        });
    }

    @IpcHandle(channels.datacenter.getDictByName)
    public async handleGetDictByName(params: any) {
        params = JSON.parse(params)
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/datawork/normCodeSet/page`, params))
        });
    }

    @IpcHandle(channels.datacenter.getDictListById)
    public async handleGetDictListById(id: string) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/datawork/normCode/findList`, {
                codeSetId: id
            }))
        });
    }

    @IpcHandle(channels.datacenter.schedJobDelete)
    public async handleSchedJobDelete(id: string) {
        const query: string = `subsystemName=%E9%87%87%E9%9B%86`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/gather/api/job/remove/${id}`, query))
        });
    }

    @IpcHandle(channels.datacenter.workflowDelete)
    public async handleWorkflowDelete(id: string) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/workflow/proc/delete/${id}`, ``))
        });
    }

    @IpcHandle(channels.datacenter.tablePreview)
    public async handleTablePreview(datasourceId: number, tableName: string, limitNum?: number) {
        const query = `id=${datasourceId}&tableName=${tableName}&limitNum=${limitNum || 10}`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/datawork/dataSource/getLimitNum`, query))
        });
    }

    @IpcHandle(channels.datacenter.tableDelete)
    public async handleTableDelete(id: string) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/datawork/datamodelTables/delete/${id}`, ``))
        });
    }

    @IpcHandle(channels.datacenter.workflowLog)
    public async handleWorkflowLog(id: string, size: number, page: number) {
        const query: string = `procInfoId=${id}&size=${size}&page=${page}`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/workflow/workflow-log/list`, query))
        });
    }

    @IpcHandle(channels.datacenter.workflowRerun)
    public async handleWorkflowRerun(id: string, type: number) {
        const query: string = `type=${type}`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/workflow/proc/rerun/${id}`, query))
        });
    }

    @IpcHandle(channels.datacenter.inspHomeList)
    public async handleInspHomeList() {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/qaportal/dwInspectionRecord/findHomeList`, ``))
        });
    }

    @IpcHandle(channels.datacenter.getInpsRecordPage)
    public async handleGetInpsRecordPage(obj: any) {
        obj = JSON.parse(obj)
        let params: {
            likeName?: any;
            likeType?: any;
            inspectionTimeStart?: any;
            inspectionTimeEnd?: any;
            page?: any;
            size?: any;
            orgIds?: any;
            orders?: {
                asc: boolean;
                column: string;
            }[];
        }
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

        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/qaportal/dwInspectionRecord/page`, params))
        });
    }

    @IpcHandle(channels.datacenter.updateIsProcessed)
    public async handleUpdateIsProcessed(id: string, isProcessed: number) {
        const query: string = `id=${id}&isProcessor=${isProcessed}`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/qaportal/dwInspectionRecord/updateByIsProcessor`, query))
        });
    }

    @IpcHandle(channels.datacenter.getWorkflow)
    public async handleGetWorkflow(jobId: string) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/workflow/proc/get/${jobId}`, ``))
        });
    }

    @IpcHandle(channels.datacenter.updateWorkflow)
    public async handleUpdateWorkflow(jobId: string, param: any) {
        const params = JSON.parse(param)
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/workflow/proc/update/${jobId}`, params))
        });
    }

    @IpcHandle(channels.datacenter.getDataXJob)
    public async handleGetDataXJob(jobId: string) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/gather/api/jobTemplate/get/${jobId}`, `subsystemName=%E9%87%87%E9%9B%86`))
        });
    }

    @IpcHandle(channels.datacenter.getWorkflowListByProjectId)
    public async handleGetWorkflowListByProjectId(projectId: string, procName: string) {

        let params: {
            projectId: string;
            procName?: string;
        }

        if (procName != undefined && procName.length > 0) {
            params = {
                projectId: projectId,
                procName: procName
            }
        } else {
            params = {
                projectId: projectId
            }
        }

        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/workflow/proc/findList`, params))
        });
    }

    @IpcHandle(channels.datacenter.getTableStoreFormat)
    public handleGetTableStoreFormat() {
        return new Promise<any>(async (resolve) => {
            resolve(this.commonPostRequest(`/services/am-usrc/usrc/dictDetail/treeList`, {
                dictName: "datawork_datamodel_storeformat"
            }))
        });
    }

    @IpcHandle(channels.datacenter.getTableFieldType)
    public handleGetTableFieldType(type: string) {
        const query: string = `type=${type}`;
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonGetRequest(`/datawork/datamodelTables/fieldTypes`, query))
        });
    }

    @IpcHandle(channels.datacenter.updateTable)
    public handleUpdateTable(params: string) {
        return new Promise<any>(async (resolve) => {
            resolve(this.commonPostRequest(`/datawork/datamodelTables/update`, JSON.parse(params)))
        });
    }

    @IpcHandle(channels.datacenter.getNorm)
    public handleGetNorm() {
        return new Promise<any>(async (resolve) => {
            resolve(this.commonPostRequest(`/datawork/norm/findList`, {}))
        });
    }

    @IpcHandle(channels.datacenter.getNormCodeSet)
    public handleGetNormCodeSet(normId: string) {
        return new Promise<any>(async (resolve) => {
            resolve(this.commonPostRequest(`/datawork/normCodeSet/findList`, {normId: normId}))
        });
    }

    @IpcHandle(channels.datacenter.getColumnsInfo)
    public handleGetColumnsInfo(datasourceId: number | string, tableName: string) {
        const query: string = `datasourceId=${datasourceId}&tableName=${tableName}`;
        return new Promise<any>(async (resolve) => {
            resolve(this.commonGetRequest(`/gather/api/metadata/getColumnsInfo`, query))
        });
    }

    @IpcHandle(channels.datacenter.getInspectionPortalRecordDetail)
    public handleGetInspectionPortalRecordDetail(params: any) {
        return new Promise<any>(async (resolve) => {
            resolve(await this.commonPostRequest(`/qaportal/dwInspectionPortalRecordDetail/page`, params))
        });
    }

    @IpcHandle(channels.datacenter.getInspectionPortalConfigByTable)
    public handleGetInspectionPortalConfigByTable(dbId: number | string, tableName: string) {
        const query: string = `dbId=${dbId}&tableName=${tableName}`;
        return new Promise<any>(async (resolve) => {
            resolve(this.commonGetRequest(`/qaportal/dwInspectionPortalConfig/getByTable`, query))
        });
    }

    public async getAccountByConfig() {
        const filePath = join(getAppDataPath(), 'config', 'user.json')
        const buffer = readFsSync(filePath)
        let account: any
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

                request.on('response', (response) => {
                    let chunks = [];

                    response.on('data', (chunk) => {
                        chunks.push(chunk); // 这里保存的是Buffer类型的数据而不是字符串
                    });

                    response.on('end', () => {
                        const data = this.decodeBuffer(chunks)
                        try {
                            const res = JSON.parse(data);
                            if (res?.res_body?.includes('4010')) {
                                this.handleAuthTokenNotice()
                            }
                            resolve(res);
                        } catch (err) {
                            log.error(data)
                            log.error(err)
                            // 服务器JVM GC内存泄露
                            if (data.includes('nested exception is java.lang.OutOfMemoryError: GC overhead limit exceeded')|| data.includes('502 Bad Gateway')) {
                                resolve(null);
                            } else {
                                this.handleAuthTokenNotice()
                            }
                            resolve(null);
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
                request.setHeader('Content-Type', 'application/json'); // ;charset=UTF-8

                request.on('response', (response) => {
                    let chunks = [];

                    response.on('data', (chunk) => {
                        chunks.push(chunk); // 这里保存的是Buffer类型的数据而不是字符串
                    });

                    response.on('end', () => {
                        const data = this.decodeBuffer(chunks)

                        try {
                            const res = JSON.parse(data);
                            if (res.code == '4010') {
                                this.handleAuthTokenNotice()
                            }
                            resolve(res);
                        } catch (err) {
                            log.error(data)
                            log.error(err)
                            // 服务器JVM GC内存泄露  ；
                            if (data.includes('nested exception is java.lang.OutOfMemoryError: GC overhead limit exceeded') || data.includes('502 Bad Gateway')) {
                                resolve(null);
                            } else {
                                this.handleAuthTokenNotice()
                            }
                            resolve(null);
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
