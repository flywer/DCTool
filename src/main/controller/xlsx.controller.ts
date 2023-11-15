import {FilePathType} from "@common/enum/filePath";
import {DepartCaseVolumeExcelModel, DepartDataVolExcelModel, InspectionDataExcelModel} from "@common/types/dataStat";
import {getCurrentTimeInSeconds, getDayString} from "@main/utils/dateUtils";
import {checkPath} from "@main/utils/fsUtils";
import {channels} from "@render/api/channels";
import {formatDate} from "@render/utils/common/dateUtils";
import {Controller, IpcHandle} from "einf";
import {dialog} from "electron";
import * as ExcelJS from 'exceljs';

@Controller()
export class XlsxController {
    constructor() {
    }

    @IpcHandle(channels.xlsx.createDataInpsStat)
    public async handleCreateDataInpsStat(data: InspectionDataExcelModel[]) {
        const createExcelData = (data: InspectionDataExcelModel[]): InspectionDataExcelModel[][] => {
            const excelData: any[][] = [];

            // Add header row
            excelData.push(['部门名称', '数据表名称', '数据表备注', '质检数据总量', '校验通过数量', '校验失败数量', '质检时间']);

            // Add data rows
            for (const item of data) {
                excelData.push([
                    item.orgName,
                    item.tableName,
                    item.tableComment,
                    item.totalRecordSum,
                    item.aimRecordSum,
                    item.wrongRecordSum,
                    item.inspectionTime
                ]);
            }

            return excelData;
        }

        const setColumnWidths = (worksheet: ExcelJS.Worksheet, columnWidths: number[]) => {
            for (let i = 0; i < columnWidths.length; i++) {
                worksheet.getColumn(i + 1).width = columnWidths[i];
            }
        }

        const setFirstRow = (worksheet: ExcelJS.Worksheet) => {

            worksheet.getRow(1).font = {
                size: 12,
                bold: true
            };

            worksheet.getCell('A1').alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            worksheet.getCell('B1').alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            worksheet.getCell('C1').alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            worksheet.getCell('D1').alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            worksheet.getCell('E1').alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            worksheet.getCell('F1').alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            worksheet.getCell('G1').alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
        }

        const setStripeStyle = (worksheet: ExcelJS.Worksheet) => {

            let preOrgName = null
            let color = 'FFFFFFFF'

            worksheet.eachRow((row, index) => {
                if (index > 1) {
                    if (preOrgName == null) {
                        preOrgName = row.getCell(1).value
                    } else {
                        if (row.getCell(1).value != preOrgName) {
                            preOrgName = row.getCell(1).value
                            if (color == 'FFFFFFFF') {
                                color = 'FFEAEAEA'
                            } else {
                                color = 'FFFFFFFF'
                            }
                        }
                    }
                    setRowColor(row, color)
                }
            })
        }

        const setRowColor = (row: ExcelJS.Row, color: string) => {
            row.eachCell({includeEmpty: true}, (cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: color},
                };
            })
        }

        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
        const columnWidths = [20, 30, 30, 20, 20, 20, 20];

        const provinceData: InspectionDataExcelModel[] = data.filter((item) => item.orgName.startsWith('广东省'));
        const cityData: InspectionDataExcelModel[] = data.filter((item) => !item.orgName.startsWith('广东省'));

        const provinceWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('省直部门');

        provinceWorksheet.addRows(createExcelData(provinceData));

        setColumnWidths(provinceWorksheet, columnWidths);
        setFirstRow(provinceWorksheet)
        this.setCellBolder(provinceWorksheet)
        setStripeStyle(provinceWorksheet)

        const cityWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('地市');

        cityWorksheet.addRows(createExcelData(cityData));

        setColumnWidths(cityWorksheet, columnWidths);
        setFirstRow(cityWorksheet)
        this.setCellBolder(cityWorksheet)
        setStripeStyle(cityWorksheet)

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '数据质检情况' + getDayString()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })

    }

    @IpcHandle(channels.xlsx.generateInsertStatements)
    public async handleGenerateInsertStatements(tableName: string) {
        return new Promise<any>(async (resolve) => {
            dialog.showOpenDialog({
                title: '选择待提取的文件',
                properties: ['openFile'],
                buttonLabel: '提取',
                filters: [
                    {
                        name: 'Excel',
                        extensions: ['xlsx', 'xls']
                    }
                ]
            })
                .then(result => {
                    if (!result.canceled) {
                        checkPath(result.filePaths[0]).then(async type => {
                            if (type == FilePathType.file) {
                                const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
                                await (workbook.xlsx as ExcelJS.Xlsx).readFile(result.filePaths[0]);

                                workbook.eachSheet((worksheet: ExcelJS.Worksheet) => {

                                    // 字段名数组
                                    const columns: string[] = [];

                                    (worksheet.getRow(1) as ExcelJS.Row).eachCell((cell: ExcelJS.Cell) => {
                                        columns.push(cell.text)
                                    })

                                    // 待出入值
                                    let insertStatements = '';

                                    worksheet.eachRow((row: ExcelJS.Row, rowNumber) => {
                                        if (rowNumber > 1) {

                                            const rowValues: any[] = []

                                            row.eachCell({includeEmpty: true}, (cell: ExcelJS.Cell) => {
                                                switch (cell.type) {
                                                    case 0:
                                                        rowValues.push('null')
                                                        break
                                                    case 2:
                                                        if (cell.numFmt != undefined) {
                                                            rowValues.push(`'${cell.value.toString().padStart(cell.numFmt.length, '0')}'`)
                                                        } else {
                                                            rowValues.push(`'${cell.value}'`)
                                                        }
                                                        break
                                                    case 4:
                                                        rowValues.push(`'${formatDate(cell.value as Date)}'`)
                                                        break
                                                    default:
                                                        rowValues.push(`'${cell.text}'`)
                                                }
                                            })

                                            const insertQuery = `INSERT INTO ${tableName || 'table'} (${(columns as []).join(', ')}) VALUES (${rowValues.join(', ')});\n`;
                                            insertStatements += insertQuery;
                                        }
                                    });

                                    resolve(insertStatements);
                                });
                            }
                        })
                    }
                })
        })
    }

    @IpcHandle(channels.xlsx.createDepartDataVolExcel)
    public async handleCreateDepartDataVolExcel(excelData: {
        basicData: DepartDataVolExcelModel[],
        actionData: DepartDataVolExcelModel[]
    }) {

        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();

        // region 辅助方法
        const createExcelData = (data: DepartDataVolExcelModel[], isBasicData: boolean): DepartDataVolExcelModel[][] => {
            const excelData: any[][] = [];

            if (isBasicData) {
                excelData.push(['数源单位', '职权分类', '数据元分类号', '编目名称', '前置机表名', '累计报送数据量', '累计报送数据量统计时间', '主题库数据量', '主题库数据量统计时间']);

                for (const item of data) {

                    excelData.push([
                        item.departName,
                        getAuthorityTypeByTableType(item.tableType),
                        item.tableType,
                        item.tableComment,
                        item.feTableName,
                        item.feDataCount,
                        item.feDataStatTime,
                        item.themeBaseDataCount,
                        item.themeBaseDataStatTime
                    ]);
                }
            } else {
                excelData.push(['数源单位', '职权分类', '数据元分类号', '编目名称', '前置机表名', '累计报送数据量', '累计报送数据量统计时间', '数据湖数据量', '数据湖数据量统计时间', '主题库数据量', '主题库数据量统计时间']);

                for (const item of data) {

                    excelData.push([
                        item.departName,
                        getAuthorityTypeByTableType(item.tableType),
                        item.tableType,
                        item.tableComment,
                        item.feTableName,
                        item.feDataCount,
                        item.feDataStatTime,
                        item.dataLakeDataCount,
                        item.dataLakeDataStatTime,
                        item.themeBaseDataCount,
                        item.themeBaseDataStatTime
                    ]);
                }
            }

            return excelData;
        }

        const getAuthorityTypeByTableType = (tableType: string) => {
            if (tableType.startsWith('G')) {
                return '法律法规'
            } else if (tableType.startsWith('Z')) {
                return '执法和监督部门'
            } else if (tableType.startsWith('Y')) {
                return '执法和监督人员'
            } else if (tableType.startsWith('F20')) {
                return '“互联网+监管”事项'
            } else if (tableType.startsWith('F10')) {
                return '行政职权类事项'
            } else if (tableType.startsWith('F30')) {
                return '“双随机、一公开”事项'
            } else if (tableType.startsWith('D')) {
                return '执法对象'
            } else if (tableType.startsWith('DATA_CHECK')) {
                return '数据对账信息'
            } else if (tableType.startsWith('C10')) {
                return '行政许可'
            } else if (tableType.startsWith('C20') || tableType == 'C2100') {
                return '行政处罚'
            } else if (tableType.startsWith('C30')) {
                return '行政强制'
            } else if (tableType == 'C4010') {
                return '行政征收'
            } else if (tableType == 'C4110') {
                return '行政征用'
            } else if (tableType.startsWith('C60')) {
                return '行政检查'
            } else if (tableType == 'C7090') {
                return '行为救济'
            } else {
                return '未知职权'
            }
        }

        const setColumnWidths = (worksheet: ExcelJS.Worksheet, columnWidths: number[]) => {
            for (let i = 0; i < columnWidths.length; i++) {
                worksheet.getColumn(i + 1).width = columnWidths[i];
            }
        }

        const setFirstRow = (worksheet: ExcelJS.Worksheet) => {

            worksheet.getRow(1).font = {
                size: 12,
                bold: true
            };

            worksheet.getRow(1).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
        }

        const setFirstCol = (worksheet: ExcelJS.Worksheet) => {
            worksheet.getColumn(1).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };

            worksheet.getColumn(2).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
        }

        const mergeCells = (worksheet: ExcelJS.Worksheet, col: string) => {
            // 合并相同部门名称的单元格
            let currentDepartment = '';
            let mergeStartRowIndex = 2; // 从第二行开始合并，跳过标题行
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const departmentCell = worksheet.getCell(`${col}${i}`);

                if (departmentCell.text != currentDepartment) {
                    if (i > mergeStartRowIndex + 1) {

                        // 只在至少有两行时进行单元格合并
                        worksheet.mergeCells(`${col}${mergeStartRowIndex}:${col}${i - 1}`);
                    }
                    currentDepartment = departmentCell.text;
                    mergeStartRowIndex = i;
                }
            }
            // 处理最后一组相同部门名称的单元格合并
            if (worksheet.rowCount > mergeStartRowIndex + 1) {

                worksheet.mergeCells(`${col}${mergeStartRowIndex}:${col}${worksheet.rowCount}`);
            }
        }

        const setCountCol = (worksheet: ExcelJS.Worksheet, isBasicData: boolean) => {
            if (isBasicData) {
                worksheet.getColumn(6).alignment = {
                    horizontal: 'right'
                };
                worksheet.getColumn(7).alignment = {
                    horizontal: 'center'
                };
                worksheet.getColumn(8).alignment = {
                    horizontal: 'right'
                };
                worksheet.getColumn(9).alignment = {
                    horizontal: 'center'
                };
            } else {
                worksheet.getColumn(6).alignment = {
                    horizontal: 'right'
                };
                worksheet.getColumn(7).alignment = {
                    horizontal: 'center'
                };
                worksheet.getColumn(8).alignment = {
                    horizontal: 'right'
                };
                worksheet.getColumn(9).alignment = {
                    horizontal: 'center'
                };
                worksheet.getColumn(10).alignment = {
                    horizontal: 'right'
                };
                worksheet.getColumn(11).alignment = {
                    horizontal: 'center'
                };
            }

        }

        const setTotalRow = (worksheet: ExcelJS.Worksheet, isBasicData: boolean) => {

            let feDataCountTotal = 0
            let dataLakeCountTotal = 0
            let themeBaseCountTotal = 0;

            if (isBasicData) {
                (worksheet.getColumn(6) as ExcelJS.Column).eachCell((cell: ExcelJS.Cell, rowNumber: number) => {
                    if (rowNumber > 1) {
                        feDataCountTotal += parseInt(cell.text)
                    }

                });

                (worksheet.getColumn(8) as ExcelJS.Column).eachCell((cell: ExcelJS.Cell, rowNumber: number) => {
                    if (rowNumber > 1) {
                        themeBaseCountTotal += parseInt(cell.text)
                    }

                })

                worksheet.addRow(['合计', '', '', '', '', feDataCountTotal.toString(), '', themeBaseCountTotal.toString(), ''])

            } else {
                (worksheet.getColumn(6) as ExcelJS.Column).eachCell((cell: ExcelJS.Cell, rowNumber: number) => {
                    if (rowNumber > 1) {
                        feDataCountTotal += parseInt(cell.text)
                    }

                });

                (worksheet.getColumn(8) as ExcelJS.Column).eachCell((cell: ExcelJS.Cell, rowNumber: number) => {
                    if (rowNumber > 1) {
                        dataLakeCountTotal += parseInt(cell.text)
                    }

                });

                (worksheet.getColumn(10) as ExcelJS.Column).eachCell((cell: ExcelJS.Cell, rowNumber: number) => {
                    if (rowNumber > 1) {
                        themeBaseCountTotal += parseInt(cell.text)
                    }

                })

                worksheet.addRow(['合计', '', '', '', '', feDataCountTotal.toString(), '', dataLakeCountTotal.toString(), '', themeBaseCountTotal.toString(), ''])

            }

        }

        // endregion

        // region 基础数据
        const basicDataWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('基础数据');
        basicDataWorksheet.addRows(createExcelData(excelData.basicData, true));

        setColumnWidths(basicDataWorksheet, [25, 23, 20, 30, 35, 15, 26, 15, 26]);
        setFirstRow(basicDataWorksheet)
        setFirstCol(basicDataWorksheet)
        // mergeCells(basicDataWorksheet, 'A')
        // mergeCells(basicDataWorksheet, 'B')
        setCountCol(basicDataWorksheet, true)
        setTotalRow(basicDataWorksheet, true)
        this.setCellBolder(basicDataWorksheet)

        // endregion

        // region 省直部门行为数据
        const provinceData: DepartDataVolExcelModel[] = excelData.actionData.filter((item) => item.departName.startsWith('广东省'));
        const cityData: DepartDataVolExcelModel[] = excelData.actionData.filter((item) => !item.departName.startsWith('广东省'));

        const columnWidths = [25, 20, 20, 30, 30, 15, 26, 15, 26, 15, 26];

        const provinceWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('省直部门行为数据');
        provinceWorksheet.addRows(createExcelData(provinceData, false));

        setColumnWidths(provinceWorksheet, columnWidths);
        setFirstRow(provinceWorksheet)
        setFirstCol(provinceWorksheet)
        // mergeCells(provinceWorksheet, 'A')
        // mergeCells(provinceWorksheet, 'B')
        setCountCol(provinceWorksheet, false)
        setTotalRow(provinceWorksheet, false)
        this.setCellBolder(provinceWorksheet)
        // endregion

        // region 地市单位行为数据
        const cityWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('地市单位行为数据');

        cityWorksheet.addRows(createExcelData(cityData, false));

        setColumnWidths(cityWorksheet, columnWidths);
        setFirstRow(cityWorksheet)
        setFirstCol(cityWorksheet)
        // mergeCells(cityWorksheet, 'A')
        // mergeCells(cityWorksheet, 'B')
        setCountCol(cityWorksheet, false)
        setTotalRow(cityWorksheet, false)
        this.setCellBolder(cityWorksheet)
        // endregion
        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '全省单位数据量统计-' + getDayString() + '-' + getCurrentTimeInSeconds()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })

    }

    @IpcHandle(channels.xlsx.createDepartCaseVolumeExcel)
    public async handleCreateDepartCaseVolumeExcel(excelData: {
        provincialData: DepartCaseVolumeExcelModel[],
        cityData: DepartCaseVolumeExcelModel[]
    }) {

        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();

        const createExcelData = (model: DepartCaseVolumeExcelModel[], isProvincial: boolean) => {
            const excelData: any[][] = []
            if (isProvincial) {
                excelData.push(['省直单位名称', '非“粤执法”推送案件量', '', '', '', '“粤执法”推送案件量', '总量']);
                excelData.push(['', '国垂系统', '省垂系统', '自建系统', '合计', '', '']);
            } else {
                excelData.push(['地市名称', '非“粤执法”推送案件量', '', '', '', '“粤执法”推送案件量', '总量']);
                excelData.push(['', '国垂系统', '省垂系统', '自建系统', '合计', '', '']);
            }

            model.forEach(depart => {

                excelData.push([
                    depart.cityName,
                    depart.nv,
                    depart.pv,
                    depart.other,
                    depart.nv + depart.pv + depart.other,
                    depart.yzf,
                    depart.nv + depart.pv + depart.other + depart.yzf
                ])
            })

            return excelData
        }

        const headerCellsMerge = (worksheet: ExcelJS.Worksheet) => {
            // 按开始行，开始列，结束行，结束列合并
            worksheet.mergeCells(1, 1, 2, 1)
            worksheet.mergeCells(1, 2, 1, 5)
            worksheet.mergeCells(1, 6, 2, 6)
            worksheet.mergeCells(1, 7, 2, 7)
        }
        const setColumnWidths = (worksheet: ExcelJS.Worksheet, columnWidths: number[]) => {
            for (let i = 0; i < columnWidths.length; i++) {
                worksheet.getColumn(i + 1).width = columnWidths[i];
            }
        }
        const setHeaderCenter = (worksheet: ExcelJS.Worksheet) => {
            worksheet.getRow(1).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            worksheet.getRow(2).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
        }

        //省直单位
        const provincialDataWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('省直单位推送案件量');
        provincialDataWorksheet.addRows(createExcelData(excelData.provincialData, true));

        headerCellsMerge(provincialDataWorksheet)
        setColumnWidths(provincialDataWorksheet, [20, 12, 12, 12, 12, 24, 12])
        setHeaderCenter(provincialDataWorksheet)
        this.setCellBolder(provincialDataWorksheet)

        provincialDataWorksheet.getColumn(1).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };

        // 地市数据
        const cityDataWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('地市单位推送案件量');
        cityDataWorksheet.addRows(createExcelData(excelData.cityData, false));

        headerCellsMerge(cityDataWorksheet)
        setColumnWidths(cityDataWorksheet, [12, 12, 12, 12, 12, 24, 12])
        setHeaderCenter(cityDataWorksheet)
        this.setCellBolder(cityDataWorksheet)

        cityDataWorksheet.getColumn(1).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '全省单位案件量统计-' + getDayString() + '-' + getCurrentTimeInSeconds()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })

    }

    public setCellBolder(worksheet: ExcelJS.Worksheet) {
        // 遍历每个单元格，并为其添加边框
        worksheet.eachRow({includeEmpty: true}, (row: ExcelJS.Row) => {
            row.eachCell({includeEmpty: true}, (cell: ExcelJS.Cell) => {
                // 获取当前单元格的边框
                const border = cell.border || {};

                // 设置边框样式
                border.top = {style: 'thin'};
                border.left = {style: 'thin'};
                border.bottom = {style: 'thin'};
                border.right = {style: 'thin'};

                // 更新单元格的边框
                cell.border = border;
            });
        });
    }
}
