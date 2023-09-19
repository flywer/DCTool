import {DepartDataVolExcelDataType, InspectionDataStatType} from "@common/types";
import {FilePathType} from "@main/enum/filePathEnum";
import {getDayString} from "@main/utils/dateUtils";
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
    public async handleCreateDataInpsStat(data: InspectionDataStatType[]) {
        const createExcelData = (data: InspectionDataStatType[]): InspectionDataStatType[][] => {
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

        const setBolder = (worksheet: ExcelJS.Worksheet) => {
            // 遍历每个单元格，并为其添加边框
            worksheet.eachRow({includeEmpty: true}, (row) => {
                row.eachCell({includeEmpty: true}, (cell) => {
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

        const provinceData: InspectionDataStatType[] = data.filter((item) => item.orgName.startsWith('广东省'));
        const cityData: InspectionDataStatType[] = data.filter((item) => !item.orgName.startsWith('广东省'));

        const provinceWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('省直部门');

        provinceWorksheet.addRows(createExcelData(provinceData));

        setColumnWidths(provinceWorksheet, columnWidths);
        setFirstRow(provinceWorksheet)
        setBolder(provinceWorksheet)
        setStripeStyle(provinceWorksheet)

        const cityWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('地市');

        cityWorksheet.addRows(createExcelData(cityData));

        setColumnWidths(cityWorksheet, columnWidths);
        setFirstRow(cityWorksheet)
        setBolder(cityWorksheet)
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

                                workbook.eachSheet(function (worksheet: ExcelJS.Worksheet) {

                                    const columns = (worksheet.getRow(1).values as any[]).slice(1).map(value => {
                                        if (typeof value === 'string' || typeof value === 'number') {
                                            return value;
                                        } else {
                                            return value.richText[0].text
                                        }
                                    });

                                    let insertStatements = '';

                                    worksheet.eachRow((row, rowNumber) => {
                                        if (rowNumber > 1) {
                                            const values = (row.values as any[]).slice(1)
                                            for (let index = 0; index < values.length; index++) {
                                                if (typeof values[index] === 'undefined') {
                                                    values[index] = null;
                                                }
                                            }
                                            const insertValues = values.map((value) => {
                                                if (typeof value === 'string') {
                                                    return `'${value}'`;
                                                } else if (value instanceof Date) {
                                                    return `'${formatDate(value)}'`;
                                                } else if (value == undefined) {
                                                    return `null`;
                                                } else {
                                                    return `${value.toString()}`;
                                                }
                                            }).join(', ');

                                            const insertQuery = `INSERT INTO ${tableName || 'table'} (${(columns as []).join(', ')}) VALUES (${insertValues});\n`;
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
    public async handleCreateDepartDataVolExcel(data: DepartDataVolExcelDataType[]) {

        const provinceData: DepartDataVolExcelDataType[] = data.filter((item) => item.departName.startsWith('广东省'));
        const cityData: DepartDataVolExcelDataType[] = data.filter((item) => !item.departName.startsWith('广东省'));

        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
        const columnWidths = [25, 20, 30, 30, 15, 15, 15];
        const createExcelData = (data: DepartDataVolExcelDataType[]): DepartDataVolExcelDataType[][] => {
            const excelData: any[][] = [];

            // Add header row
            excelData.push(['数源单位', '数据元分类号', '编目名称', '前置机表名', '前置机数据量', '数据湖数据量', '主题库数据量']);

            // Add data rows
            for (const item of data) {
                excelData.push([
                    item.departName,
                    item.tableType,
                    item.tableComment,
                    item.feTableName,
                    item.feDataCount,
                    item.dataLakeDataCount,
                    item.themeBaseDataCount
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

        const setFirstCol = (worksheet: ExcelJS.Worksheet) => {
            worksheet.getColumn(1).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
        }

        const setBolder = (worksheet: ExcelJS.Worksheet) => {
            // 遍历每个单元格，并为其添加边框
            worksheet.eachRow({includeEmpty: true}, (row) => {
                row.eachCell({includeEmpty: true}, (cell) => {
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

        const mergeCells = (worksheet: ExcelJS.Worksheet) => {
            // 合并相同部门名称的单元格
            let currentDepartment = '';
            let mergeStartRowIndex = 2; // 从第二行开始合并，跳过标题行
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const departmentCell = worksheet.getCell(`A${i}`);
                if (departmentCell.text !== currentDepartment) {
                    if (i > mergeStartRowIndex + 1) {
                        // 只在至少有两行时进行单元格合并
                        worksheet.mergeCells(`A${mergeStartRowIndex}:A${i - 1}`);
                    }
                    currentDepartment = departmentCell.text;
                    mergeStartRowIndex = i;
                }
            }
            // 处理最后一组相同部门名称的单元格合并
            if (worksheet.rowCount > mergeStartRowIndex + 1) {
                worksheet.mergeCells(`A${mergeStartRowIndex}:A${worksheet.rowCount}`);
            }
        }

        const setCountCol = (worksheet: ExcelJS.Worksheet) => {
            worksheet.getColumn(5).alignment = {
                horizontal: 'right'
            };
            worksheet.getColumn(6).alignment = {
                horizontal: 'right'
            };
            worksheet.getColumn(7).alignment = {
                horizontal: 'right'
            };
        }

        const setTotalRow = (worksheet: ExcelJS.Worksheet) => {

            let feDataCountTotal = 0
            let dataLakeCountTotal = 0
            let themeBaseCountTotal = 0;

            (worksheet.getColumn(5) as ExcelJS.Column).eachCell((cell: ExcelJS.Cell, rowNumber: number) => {
                if (rowNumber > 1) {
                    feDataCountTotal += parseInt(cell.text)
                }

            });

            (worksheet.getColumn(6) as ExcelJS.Column).eachCell((cell: ExcelJS.Cell, rowNumber: number) => {
                if (rowNumber > 1) {
                    dataLakeCountTotal += parseInt(cell.text)
                }

            });

            (worksheet.getColumn(7) as ExcelJS.Column).eachCell((cell: ExcelJS.Cell, rowNumber: number) => {
                if (rowNumber > 1) {
                    themeBaseCountTotal += parseInt(cell.text)
                }

            })

            worksheet.addRow(['合计', '', '', '', feDataCountTotal.toString(), dataLakeCountTotal.toString(), themeBaseCountTotal.toString()])
        }

        const provinceWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('省直部门');
        provinceWorksheet.addRows(createExcelData(provinceData));

        setColumnWidths(provinceWorksheet, columnWidths);
        setFirstRow(provinceWorksheet)
        setFirstCol(provinceWorksheet)
        mergeCells(provinceWorksheet)
        setCountCol(provinceWorksheet)
        setTotalRow(provinceWorksheet)
        setBolder(provinceWorksheet)

        const cityWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('地市单位');

        cityWorksheet.addRows(createExcelData(cityData));

        setColumnWidths(cityWorksheet, columnWidths);
        setFirstRow(cityWorksheet)
        setFirstCol(cityWorksheet)
        mergeCells(cityWorksheet)
        setCountCol(cityWorksheet)
        setTotalRow(cityWorksheet)
        setBolder(cityWorksheet)

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '全省单位数据量统计' + getDayString()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })

    }
}
