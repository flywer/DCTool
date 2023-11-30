import {PageResult, PageVo} from "@common/types";
import {AppDataSource} from "@main/dataSource/data-source";
import {FEDepartTableName} from "@main/entity/FEDepartTableName";
import {getResourcePath} from "@main/utils/appPath";
import {readFsSync} from "@main/utils/fsUtils";
import {failure, success} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {actionTableNames, basicTableNames} from "@render/utils/datacenter/constants";
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
export class FEDepartTableNameController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.preDatabase.updateFETableNameByExcel)
    public async handleUpdateFETableNameByExcel() {

        const templateCheck = (worksheet: ExcelJS.Worksheet) => {
            return new Promise((resolve, reject) => {
                if (worksheet.getCell('A2').text != '上报单位' || worksheet.getCell('B2').text != '数据元分类号' || worksheet.getCell('C2').text != '表名') {
                    reject(failure('模板错误：表头错误'))
                }

                (worksheet.getColumn(2) as ExcelJS.Column).eachCell((cell, rowNumber) => {
                    if (rowNumber > 2) {
                        if (!basicTableNames.includes(cell.text.toLowerCase()) &&
                            !actionTableNames.includes(cell.text.toLowerCase()) &&
                            cell.text != 'DATA_CHECK') {
                            reject(failure(`数据错误：[B,${rowNumber}]数据元分类号(${cell.text})不在规定值域范围内`))
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
                                        if (rowNumber > 2) {
                                            const updateArr: FEDepartTableName[] = []
                                            const updateTime = new Date()

                                            const tableNameInfo = await this.handleGetInfoByDepartNameAndTableType(row.getCell(1).text, row.getCell(2).text)
                                            if (tableNameInfo != null) {
                                                tableNameInfo.tableName = row.getCell(3).text
                                                tableNameInfo.updateTime = updateTime
                                                updateArr.push(tableNameInfo)
                                            } else {
                                                updateArr.push({
                                                    id: null,
                                                    departName: row.getCell(1).text,
                                                    tableType: row.getCell(2).text,
                                                    tableName: row.getCell(3).text,
                                                    updateTime: updateTime
                                                })
                                            }

                                            resolve(new Promise<any>((resolve) => {
                                                AppDataSource.getRepository(FEDepartTableName).save(updateArr).then(() => {
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

    @IpcHandle(channels.auxiliaryDb.preDatabase.getAllFEDepartTableName)
    public handleGetAllFEDepartTableName() {
        return AppDataSource.getRepository(FEDepartTableName).find()
    }

    @IpcHandle(channels.auxiliaryDb.preDatabase.getFEDepartTableNameByPage)
    public async handleGetFEDepartTableNameByPage(page: PageVoAlias) {

        const pageResult: PageResult<FEDepartTableName> = {
            records: [],
            total: 0
        }

        const result = await AppDataSource.getRepository(FEDepartTableName).findAndCount({
            where: [
                {
                    departName: Like(`%${page.searchParam || ''}%`)
                },
                {
                    tableType: Like(`%${page.searchParam || ''}%`)
                },
                {
                    tableName: Like(`%${page.searchParam || ''}%`)
                },
            ],
            skip: (page.pageNo - 1) * page.pageSize,
            take: page.pageSize,
            order: {
                departName: 'asc',
                tableType: 'asc'
            }
        })

        if (result != null) {
            pageResult.records = result[0]
            pageResult.total = result[1]
        }

        return pageResult
    }

    @IpcHandle(channels.auxiliaryDb.preDatabase.getInfoByDepartNameAndTableType)
    public handleGetInfoByDepartNameAndTableType(departName: string, tableType: string) {
        return AppDataSource.getRepository(FEDepartTableName).findOne({
            where: {
                departName: departName,
                tableType: tableType
            }
        })
    }

    @IpcHandle(channels.auxiliaryDb.preDatabase.downloadTemplate)
    public handleDownloadTemplate() {
        return new Promise((resolve) => {
            dialog.showSaveDialog({
                title: '选择文件保存位置',
                filters: [{
                    name: 'xlsx',
                    extensions: ['xlsx']
                }],
                defaultPath: '前置机单位表名信息导入模板'
            }).then(res => {
                if (!res.canceled) {
                    const filePath = join(getResourcePath(), '/assets/excelTemplate/departTableNameImportTemplate.xlsx')
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

    @IpcHandle(channels.auxiliaryDb.preDatabase.updateFETableName)
    public async handleUpdateFETableName(model: FEDepartTableName) {
        try {
            model.updateTime = new Date()
            await AppDataSource.getRepository(FEDepartTableName).save(model)
            return success('保存成功')
        } catch (e) {
            log.error(e)
            return failure('保存失败')
        }
    }

    @IpcHandle(channels.auxiliaryDb.preDatabase.deleteFETableName)
    public async handleDeleteFETableName(id: number) {
        try {
            await AppDataSource.getRepository(FEDepartTableName).delete(id)
            return success('删除成功')
        } catch (e) {
            log.error(e)
            return failure('删除失败')
        }
    }
}
