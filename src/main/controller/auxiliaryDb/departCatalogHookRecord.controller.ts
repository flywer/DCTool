import {PageResult, PageVo} from "@common/types";
import {CatalogHookData} from "@common/types/dataStat";
import {AppDataSource} from "@main/dataSource/data-source";
import {CatalogHookType, DepartCatalogHookRecord} from "@main/entity/DepartCatalogHookRecord";
import {getResourcePath} from "@main/utils/appPath";
import {readFsSync} from "@main/utils/fsUtils";
import {failure, success} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {dialog} from "electron";
import log from "electron-log";
import * as ExcelJS from "exceljs";
import fs from "fs";
import {isEmpty} from "lodash";
import {join} from "path";
import {Like} from "typeorm";

type PageVoAlias = PageVo

@Controller()
export class DepartCatalogHookRecordController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.departCatalogHookRecord.updateByExcel)
    public async handleGetMaxRunningWorkFlowJobNum() {

        const templateCheck = (worksheet: ExcelJS.Worksheet) => {
            if (worksheet.getCell('B1').text != '地市' ||
                worksheet.getCell('C1').text != '区县' ||
                worksheet.getCell('D1').text != '镇街' ||
                worksheet.getCell('E1').text != '部门/区划名称' ||
                worksheet.getCell('F1').text != '行政许可' ||
                worksheet.getCell('G1').text != '行政征收' ||
                worksheet.getCell('H1').text != '行政检查' ||
                worksheet.getCell('I1').text != '行政处罚' ||
                worksheet.getCell('J1').text != '行政强制'
            ) {
                return `【${worksheet.name}】：模板错误-表头错误`
            }

            (worksheet.getColumn(5) as ExcelJS.Column).eachCell((cell, rowNumber) => {
                if (rowNumber > 1) {
                    if (cell.text == null || cell.text === '') {
                        return `【${worksheet.name}】：数据错误-部门/区划名称不可为空`
                    }
                }
            })

            return null

        }

        return new Promise<any>(async (resolve) => {
            dialog.showOpenDialog({
                title: '选择模板文件',
                properties: ['openFile'],
                buttonLabel: '提取',
                filters: [
                    {
                        name: 'Excel',
                        extensions: ['xlsx', 'xls']
                    }
                ]
            })
                .then(async result => {

                    if (!result.canceled) {
                        try {
                            const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
                            await (workbook.xlsx as ExcelJS.Xlsx).readFile(result.filePaths[0]);

                            const error = await new Promise<string[]>((resolve) => {
                                let errorInfo: string[] = []
                                workbook.eachSheet((worksheet: ExcelJS.Worksheet) => {
                                    const error = templateCheck(worksheet)
                                    if (error == null) {
                                        worksheet.eachRow(async (row: ExcelJS.Row, rowNumber) => {
                                            if (rowNumber > 1) {
                                                const updateArr: DepartCatalogHookRecord[] = []
                                                const updateTime = new Date()

                                                const departName = row.getCell(5).text.trim()
                                                const cityName = row.getCell(2).text.trim()

                                                if (departName != '部门/区划名称' && departName != null && departName != '' && cityName != '') {
                                                    const departInfo = await this.handleGetInfoByDepartName(row.getCell(5).text.trim())
                                                    if (departInfo != null) {
                                                        departInfo.cityName = row.getCell(2).text.trim()
                                                        departInfo.districtName = row.getCell(3).text.trim()
                                                        departInfo.townName = row.getCell(4).text.trim()
                                                        departInfo.AL = this.getCatalogHookType(row.getCell(6).text.trim())
                                                        departInfo.AE = this.getCatalogHookType(row.getCell(7).text.trim())
                                                        departInfo.AC = this.getCatalogHookType(row.getCell(8).text.trim())
                                                        departInfo.AP = this.getCatalogHookType(row.getCell(9).text.trim())
                                                        departInfo.AF = this.getCatalogHookType(row.getCell(10).text.trim())
                                                        departInfo.updateTime = updateTime
                                                        updateArr.push(departInfo)
                                                    } else {
                                                        const newDepart = new DepartCatalogHookRecord()
                                                        newDepart.cityName = row.getCell(2).text.trim()
                                                        newDepart.districtName = row.getCell(3).text.trim()
                                                        newDepart.townName = row.getCell(4).text.trim()
                                                        newDepart.departName = row.getCell(5).text.trim()
                                                        newDepart.AL = this.getCatalogHookType(row.getCell(6).text.trim())
                                                        newDepart.AE = this.getCatalogHookType(row.getCell(7).text.trim())
                                                        newDepart.AC = this.getCatalogHookType(row.getCell(8).text.trim())
                                                        newDepart.AP = this.getCatalogHookType(row.getCell(9).text.trim())
                                                        newDepart.AF = this.getCatalogHookType(row.getCell(10).text.trim())
                                                        newDepart.updateTime = updateTime
                                                        updateArr.push(newDepart)
                                                    }

                                                    await AppDataSource.getRepository(DepartCatalogHookRecord).save(updateArr)
                                                }
                                            }
                                        })
                                    } else {
                                        errorInfo.push(error)
                                    }
                                })
                                resolve(errorInfo)
                            })
                            if (error.length > 0) {
                                if (error.length == workbook.worksheets.length) {
                                    resolve(failure('全部文件导入失败\n' + error.join('\n')))
                                } else {
                                    resolve(failure('部分文件导入失败\n' + error.join('\n')))
                                }
                            } else {
                                resolve(success('全部导入成功'))
                            }

                        } catch (e) {
                            log.error(e)
                            resolve(failure('文件解析错误，查看文件是否已加密'))
                        }

                    }
                })
        })
    }

    public handleGetInfoByDepartName(departName: string) {
        return AppDataSource.getRepository(DepartCatalogHookRecord).findOne({
            where: {
                departName: departName
            }
        })
    }

    public getCatalogHookType(typeStr: string): number {
        switch (typeStr) {
            case '无职权':
                return CatalogHookType.noAuthority
            case '未编目':
                return CatalogHookType.noCatalog
            case '已编目无数据':
                return CatalogHookType.catalogedNoData
            case '已编目已挂接':
                return CatalogHookType.hooked
            case '使用国垂系统':
                return CatalogHookType.nationalVertical
            case '使用省垂系统':
                return CatalogHookType.provincialVertical
            case '粤执法':
                return CatalogHookType.yzf
            default:
                return CatalogHookType.undefined
        }
    }

    @IpcHandle(channels.auxiliaryDb.departCatalogHookRecord.downloadImportTemplate)
    public handleDownloadTemplate() {
        return new Promise((resolve) => {
            dialog.showSaveDialog({
                title: '选择文件保存位置',
                filters: [{
                    name: 'xlsx',
                    extensions: ['xlsx']
                }],
                defaultPath: '行政执法综合数据编目情况统计模板'
            }).then(res => {
                if (!res.canceled) {
                    const filePath = join(getResourcePath(), '/assets/excelTemplate/departCatalogHookRecordImportTemplate.xlsx')
                    const buffer = readFsSync(filePath)
                    if (buffer == null || isEmpty(buffer.toString())) {
                        resolve(failure('模板不存在，请联系开发者'))
                    } else {
                        fs.writeFileSync(res.filePath, buffer);
                        resolve(success('下载成功'))
                    }
                }
            })
        })
    }

    @IpcHandle(channels.auxiliaryDb.departCatalogHookRecord.getCatalogHookInfoByDepartName)
    public async handleGetCatalogHookInfoByDepartName(page: PageVoAlias) {

        const pageResult: PageResult<DepartCatalogHookRecord> = {
            records: [],
            total: 0
        }

        const result = await AppDataSource.getRepository(DepartCatalogHookRecord).findAndCount({
            where: [
                {
                    departName: Like(`%${page.searchParam || ''}%`)
                },
            ],
            skip: (page.pageNo - 1) * page.pageSize,
            take: page.pageSize,
            order: {
                departName: 'asc',
            }
        })

        if (result != null) {
            pageResult.records = result[0]
            pageResult.total = result[1]
        }

        return pageResult

    }

    @IpcHandle(channels.auxiliaryDb.departCatalogHookRecord.deleteCatalogHookRecord)
    public async handleDeleteCatalogHookRecord(id: number) {
        try {
            await AppDataSource.getRepository(DepartCatalogHookRecord).delete(id)
            return success('删除成功')
        } catch (e) {
            log.error(e)
            return failure('删除失败')
        }
    }

    @IpcHandle(channels.auxiliaryDb.departCatalogHookRecord.exportCatalogHookData)
    public async handleExportCatalogHookData() {

        type DepartStr = {
            departs: string
        }

        try {
            const resultData: CatalogHookData[] = []

            const cityNames: {
                cityName: string
            }[] = await AppDataSource.getRepository(DepartCatalogHookRecord).createQueryBuilder()
                .select('city_name', 'cityName')
                .groupBy('city_name')
                .execute()

            for (const cityName of cityNames) {
                //单位总数
                const departCount = (await AppDataSource.getRepository(DepartCatalogHookRecord).findAndCountBy({cityName: cityName.cityName}))[1]

                // 许可
                const al: DepartStr[] = await AppDataSource.getRepository(DepartCatalogHookRecord)
                    .query(`
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AL = 4 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AL = 5 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AL = 6 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AL IN (1,2,3) UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AL IN (0,7)
                `);

                // 征收
                const ae: DepartStr[] = await AppDataSource.getRepository(DepartCatalogHookRecord)
                    .query(`
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AE = 4 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AE = 5 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AE = 6 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AE IN (1,2,3) UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AE IN (0,7)
                `);

                // 行政检查
                const ac: DepartStr[] = await AppDataSource.getRepository(DepartCatalogHookRecord)
                    .query(`
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AC = 4 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AC = 5 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AC = 6 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AC IN (1,2,3) UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AC IN (0,7)
                `);

                // 行政处罚
                const ap: DepartStr[] = await AppDataSource.getRepository(DepartCatalogHookRecord)
                    .query(`
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AP = 4 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AP = 5 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AP = 6 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AP IN (1,2,3) UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AP IN (0,7)
                `);

                // 行政处罚
                const af: DepartStr[] = await AppDataSource.getRepository(DepartCatalogHookRecord)
                    .query(`
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AF = 4 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AF = 5 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AF = 6 UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AF IN (1,2,3) UNION ALL
                SELECT GROUP_CONCAT(depart_name) AS 'departs' FROM depart_catalog_hook_record WHERE city_name = '${cityName.cityName}' AND AF IN (0,7)
                `);

                resultData.push({
                    cityName: cityName.cityName,
                    departCount: departCount,
                    AL: {
                        nationalVertical: al[0].departs?.split(',') || [],
                        provincialVertical: al[1].departs?.split(',') || [],
                        yzf: al[2].departs?.split(',') || [],
                        citySystem: al[3].departs?.split(',') || [],
                        noSystem: [],
                        noData: al[4].departs?.split(',') || [],
                    },
                    AE: {
                        nationalVertical: ae[0].departs?.split(',') || [],
                        provincialVertical: ae[1].departs?.split(',') || [],
                        yzf: ae[2].departs?.split(',') || [],
                        citySystem: ae[3].departs?.split(',') || [],
                        noSystem: [],
                        noData: ae[4].departs?.split(',') || [],
                    },
                    AC: {
                        nationalVertical: ac[0].departs?.split(',') || [],
                        provincialVertical: ac[1].departs?.split(',') || [],
                        yzf: ac[2].departs?.split(',') || [],
                        citySystem: ac[3].departs?.split(',') || [],
                        noSystem: [],
                        noData: ac[4].departs?.split(',') || [],
                    },
                    AP: {
                        nationalVertical: ap[0].departs?.split(',') || [],
                        provincialVertical: ap[1].departs?.split(',') || [],
                        yzf: ap[2].departs?.split(',') || [],
                        citySystem: ap[3].departs?.split(',') || [],
                        noSystem: [],
                        noData: ap[4].departs?.split(',') || [],
                    },
                    AF: {
                        nationalVertical: af[0].departs?.split(',') || [],
                        provincialVertical: af[1].departs?.split(',') || [],
                        yzf: af[2].departs?.split(',') || [],
                        citySystem: af[3].departs?.split(',') || [],
                        noSystem: [],
                        noData: af[4].departs?.split(',') || [],
                    }
                })
            }

            const result = success()
            result.data = resultData
            return result
        } catch (e) {
            log.error(e)
            return failure('获取编目挂接信息失败')
        }

    }

    @IpcHandle(channels.auxiliaryDb.departCatalogHookRecord.findCatalogHookRecordByDepartName)
    public handleFindCatalogHookRecordByDepartName(departName: string) {
        return AppDataSource.getRepository(DepartCatalogHookRecord).findOneBy({
            departName: departName
        })
    }
}
