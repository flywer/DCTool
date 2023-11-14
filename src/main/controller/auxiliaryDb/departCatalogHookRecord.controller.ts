import {PageResult, PageVo} from "@common/types";
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
            return new Promise((resolve, reject) => {
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
                    reject(failure('模板错误：表头错误'))
                }

                (worksheet.getColumn(5) as ExcelJS.Column).eachCell((cell, rowNumber) => {
                    if (rowNumber > 1) {
                        if (cell.text == null || cell.text === '') {
                            reject(failure(`数据错误：部门/区划名称不可为空`))
                        }
                    }
                })

                resolve(success())
            })
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

                            workbook.eachSheet((worksheet: ExcelJS.Worksheet) => {
                                templateCheck(worksheet).then(() => {
                                    worksheet.eachRow(async (row: ExcelJS.Row, rowNumber) => {
                                        if (rowNumber > 1) {
                                            const updateArr: DepartCatalogHookRecord[] = []
                                            const updateTime = new Date()

                                            const departInfo = await this.handleGetInfoByDepartName(row.getCell(5).text)
                                            if (departInfo != null) {
                                                departInfo.cityName = row.getCell(2).text
                                                departInfo.districtName = row.getCell(3).text
                                                departInfo.townName = row.getCell(4).text
                                                departInfo.AL = this.getCatalogHookType(row.getCell(6).text)
                                                departInfo.AE = this.getCatalogHookType(row.getCell(7).text)
                                                departInfo.AC = this.getCatalogHookType(row.getCell(8).text)
                                                departInfo.AP = this.getCatalogHookType(row.getCell(9).text)
                                                departInfo.AF = this.getCatalogHookType(row.getCell(10).text)
                                                departInfo.updateTime = updateTime
                                                updateArr.push(departInfo)
                                            } else {
                                                const newDepart = new DepartCatalogHookRecord()
                                                newDepart.cityName = row.getCell(2).text
                                                newDepart.districtName = row.getCell(3).text
                                                newDepart.townName = row.getCell(4).text
                                                newDepart.departName = row.getCell(5).text
                                                newDepart.AL = this.getCatalogHookType(row.getCell(6).text)
                                                newDepart.AE = this.getCatalogHookType(row.getCell(7).text)
                                                newDepart.AC = this.getCatalogHookType(row.getCell(8).text)
                                                newDepart.AP = this.getCatalogHookType(row.getCell(9).text)
                                                newDepart.AF = this.getCatalogHookType(row.getCell(10).text)
                                                newDepart.updateTime = updateTime
                                                updateArr.push(newDepart)
                                            }

                                            resolve(new Promise<any>((resolve) => {
                                                AppDataSource.getRepository(DepartCatalogHookRecord).save(updateArr).then(() => {
                                                    resolve(success('更新成功'))
                                                })
                                            }))

                                        }
                                    })
                                }).catch(error => {
                                    resolve(error)
                                })
                            })

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

}
