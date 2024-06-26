import {FilePathType} from "@common/enum/filePath";
import {
    CityDepartCaseVolumeExcelModel,
    DataLakeOwnDepartCaseVolumeExcelModel,
    DepartDataVolExcelModel,
    InspectionDataExcelModel, InspectionWrongFieldDataExcelModel,
    ProvincialDepartCaseVolumeExcelModel
} from "@common/types/dataStat";
import {ThemeBaseDataSourceCaseVolume} from "@main/entity/frontEnd/ThemeBaseDataSourceCaseVolume";
import {getResourcePath} from "@main/utils/appPath";
import {getCurrentTimeInSeconds, getDayString} from "@main/utils/dateUtils";
import {checkPath} from "@main/utils/fsUtils";
import {channels} from "@render/api/channels";
import {formatDate} from "@render/utils/common/dateUtils";
import {Controller, IpcHandle} from "einf";
import {dialog, net} from "electron";
import * as ExcelJS from 'exceljs';
import {join} from "path";
import log from "electron-log";
import {CreditPublicityXzcf} from "@common/types/creditPublicity";
import {ZwfwOrgTask} from "@common/types/Gdzwfw";

@Controller()
export class XlsxController {
    constructor() {
    }

    public setCellBolder(worksheet: ExcelJS.Worksheet) {
        // 遍历每个单元格，并为其添加边框
        worksheet.eachRow({includeEmpty: false}, (row: ExcelJS.Row) => {
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

    public setColumnWidths(worksheet: ExcelJS.Worksheet, columnWidths: number[]) {
        for (let i = 0; i < columnWidths.length; i++) {
            worksheet.getColumn(i + 1).width = columnWidths[i];
        }
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
                excelData.push(['上报单位', '职权分类', '数据元分类号', '编目名称', '前置机表名', '累计报送数据量', '累计报送数据量统计时间', '主题库数据量', '主题库数据量统计时间']);

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
                excelData.push(['上报单位', '职权分类', '数据元分类号', '编目名称', '前置机表名', '累计报送数据量', '累计报送数据量统计时间', '数据湖数据量', '数据湖数据量统计时间', '主题库数据量', '主题库数据量统计时间']);

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
            } else if (tableType.startsWith('DATA_CHECK')) {
                return '数据对账信息'
            } else if (tableType.startsWith('D')) {
                return '执法对象'
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

        /*
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
        */

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
        const provinceData: DepartDataVolExcelModel[] = excelData.actionData.filter((item) => item.departName.startsWith('广东省') || item.departName.startsWith('中共'));
        const cityData: DepartDataVolExcelModel[] = excelData.actionData.filter((item) => !item.departName.startsWith('广东省') && !item.departName.startsWith('中共'));

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
            defaultPath: '全省上报单位数据量统计-' + getDayString() + '-' + getCurrentTimeInSeconds()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })

    }

    @IpcHandle(channels.xlsx.createDepartCaseVolumeExcel)
    public async handleCreateDepartCaseVolumeExcel(excelData: {
        provincialData: ProvincialDepartCaseVolumeExcelModel[],
        cityData: CityDepartCaseVolumeExcelModel[]
    }) {

        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();

        // region 省直单位

        const createProvincialExcelData = (model: ProvincialDepartCaseVolumeExcelModel[]) => {
            const excelData: any[][] = []

            excelData.push(['省直单位名称', '非“粤执法”推送案件量', '', '', '', '“粤执法”推送案件量', '总量']);
            excelData.push(['', '国垂系统', '省垂系统', '自建系统', '合计', '', '']);

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

        const provincialDataWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('省直部门');

        provincialDataWorksheet.addRows(createProvincialExcelData(excelData.provincialData));

        // 按开始行，开始列，结束行，结束列合并
        provincialDataWorksheet.mergeCells(1, 1, 2, 1)
        provincialDataWorksheet.mergeCells(1, 2, 1, 5)
        provincialDataWorksheet.mergeCells(1, 6, 2, 6)
        provincialDataWorksheet.mergeCells(1, 7, 2, 7)

        this.setColumnWidths(provincialDataWorksheet, [20, 12, 12, 12, 12, 24, 12])

        provincialDataWorksheet.getRow(1).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        }
        provincialDataWorksheet.getRow(2).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        }

        provincialDataWorksheet.getColumn(1).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };

        this.setCellBolder(provincialDataWorksheet)
        // endregion

        // region 地市数据

        const setCityDataHeader = () => {
            cityDataWorksheet.getCell('A1').value = '地市名称'
            cityDataWorksheet.mergeCells('A1', 'A4')

            cityDataWorksheet.getCell('B1').value = '地市执法部门数量'
            cityDataWorksheet.mergeCells('B1', 'B4')

            cityDataWorksheet.getColumn('B').width = 18

            // region 行政许可
            cityDataWorksheet.getCell('C1').value = '行政许可'
            cityDataWorksheet.mergeCells('C1', 'K2')

            cityDataWorksheet.getCell('C3').value = '国垂系统'
            cityDataWorksheet.mergeCells('C3', 'D3')

            cityDataWorksheet.getCell('C4').value = '部门数量'
            cityDataWorksheet.getCell('D4').value = '推送案件数量'

            cityDataWorksheet.getCell('E3').value = '省垂系统'
            cityDataWorksheet.mergeCells('E3', 'F3')

            cityDataWorksheet.getCell('E4').value = '部门数量'
            cityDataWorksheet.getCell('F4').value = '推送案件数量'

            cityDataWorksheet.getCell('G3').value = '市自建系统'
            cityDataWorksheet.mergeCells('G3', 'H3')

            cityDataWorksheet.getCell('G4').value = '部门数量'
            cityDataWorksheet.getCell('H4').value = '推送案件数量'

            cityDataWorksheet.getCell('I3').value = '无系统'
            cityDataWorksheet.mergeCells('I3', 'J3')

            cityDataWorksheet.getCell('I4').value = '部门数量'
            cityDataWorksheet.getCell('J4').value = '推送案件数量'

            cityDataWorksheet.getCell('K3').value = '无职权/无数据'
            cityDataWorksheet.getCell('K4').value = '部门数量'

            // endregion

            // region 行政征收
            cityDataWorksheet.getCell('L1').value = '行政许可'
            cityDataWorksheet.mergeCells('L1', 'T2')

            cityDataWorksheet.getCell('L3').value = '国垂系统'
            cityDataWorksheet.mergeCells('L3', 'M3')

            cityDataWorksheet.getCell('L4').value = '部门数量'
            cityDataWorksheet.getCell('M4').value = '推送案件数量'

            cityDataWorksheet.getCell('N3').value = '省垂系统'
            cityDataWorksheet.mergeCells('N3', 'O3')

            cityDataWorksheet.getCell('N4').value = '部门数量'
            cityDataWorksheet.getCell('O4').value = '推送案件数量'

            cityDataWorksheet.getCell('P3').value = '市自建系统'
            cityDataWorksheet.mergeCells('P3', 'Q3')

            cityDataWorksheet.getCell('P4').value = '部门数量'
            cityDataWorksheet.getCell('Q4').value = '推送案件数量'

            cityDataWorksheet.getCell('R3').value = '无系统'
            cityDataWorksheet.mergeCells('R3', 'S3')

            cityDataWorksheet.getCell('R4').value = '部门数量'
            cityDataWorksheet.getCell('S4').value = '推送案件数量'

            cityDataWorksheet.getCell('T3').value = '无职权/无数据'
            cityDataWorksheet.getCell('T4').value = '部门数量'

            // endregion

            // region 行政征用
            cityDataWorksheet.getCell('U1').value = '行政征用'
            cityDataWorksheet.mergeCells('U1', 'AC2')

            cityDataWorksheet.getCell('U3').value = '国垂系统'
            cityDataWorksheet.mergeCells('U3', 'V3')

            cityDataWorksheet.getCell('U4').value = '部门数量'
            cityDataWorksheet.getCell('V4').value = '推送案件数量'

            cityDataWorksheet.getCell('W3').value = '省垂系统'
            cityDataWorksheet.mergeCells('W3', 'X3')

            cityDataWorksheet.getCell('W4').value = '部门数量'
            cityDataWorksheet.getCell('X4').value = '推送案件数量'

            cityDataWorksheet.getCell('Y3').value = '市自建系统'
            cityDataWorksheet.mergeCells('Y3', 'Z3')

            cityDataWorksheet.getCell('Y4').value = '部门数量'
            cityDataWorksheet.getCell('Z4').value = '推送案件数量'

            cityDataWorksheet.getCell('AA3').value = '无系统'
            cityDataWorksheet.mergeCells('AA3', 'AB3')

            cityDataWorksheet.getCell('AA4').value = '部门数量'
            cityDataWorksheet.getCell('AB4').value = '推送案件数量'

            cityDataWorksheet.getCell('AC3').value = '无职权/无数据'
            cityDataWorksheet.getCell('AC4').value = '部门数量'

            // endregion

            // region 粤执法
            cityDataWorksheet.getCell('AD1').value = '“粤执法”'
            cityDataWorksheet.mergeCells('AD1', 'AI1')

            cityDataWorksheet.getCell('AD2').value = '行政检查'
            cityDataWorksheet.mergeCells('AD2', 'AE3')
            cityDataWorksheet.getCell('AD4').value = '部门数量'
            cityDataWorksheet.getCell('AE4').value = '推送案件数量'

            cityDataWorksheet.getCell('AF2').value = '行政处罚'
            cityDataWorksheet.mergeCells('AF2', 'AG3')
            cityDataWorksheet.getCell('AF4').value = '部门数量'
            cityDataWorksheet.getCell('AG4').value = '推送案件数量'

            cityDataWorksheet.getCell('AH2').value = '行政强制'
            cityDataWorksheet.mergeCells('AH2', 'AI3')
            cityDataWorksheet.getCell('AH4').value = '部门数量'
            cityDataWorksheet.getCell('AI4').value = '推送案件数量'

            // endregion

            // region 非“粤执法”

            cityDataWorksheet.getCell('AJ1').value = '非“粤执法”'
            cityDataWorksheet.mergeCells('AJ1', 'BJ1')

            // region 行政检查
            cityDataWorksheet.getCell('AJ2').value = '行政检查'
            cityDataWorksheet.mergeCells('AJ2', 'AR2')

            cityDataWorksheet.getCell('AJ3').value = '国垂系统'
            cityDataWorksheet.mergeCells('AJ3', 'AK3')

            cityDataWorksheet.getCell('AJ4').value = '部门数量'
            cityDataWorksheet.getCell('AK4').value = '推送案件数量'

            cityDataWorksheet.getCell('AL3').value = '省垂系统'
            cityDataWorksheet.mergeCells('AL3', 'AM3')

            cityDataWorksheet.getCell('AL4').value = '部门数量'
            cityDataWorksheet.getCell('AM4').value = '推送案件数量'

            cityDataWorksheet.getCell('AN3').value = '市自建系统'
            cityDataWorksheet.mergeCells('AN3', 'AO3')

            cityDataWorksheet.getCell('AN4').value = '部门数量'
            cityDataWorksheet.getCell('AO4').value = '推送案件数量'

            cityDataWorksheet.getCell('AP3').value = '无系统'
            cityDataWorksheet.mergeCells('AP3', 'AQ3')

            cityDataWorksheet.getCell('AP4').value = '部门数量'
            cityDataWorksheet.getCell('AQ4').value = '推送案件数量'

            cityDataWorksheet.getCell('AR3').value = '无职权/无数据'
            cityDataWorksheet.getCell('AR4').value = '部门数量'
            // endregion

            // region 行政处罚
            cityDataWorksheet.getCell('AS2').value = '行政处罚'
            cityDataWorksheet.mergeCells('AS2', 'BA2')

            cityDataWorksheet.getCell('AS3').value = '国垂系统'
            cityDataWorksheet.mergeCells('AS3', 'AT3')

            cityDataWorksheet.getCell('AS4').value = '部门数量'
            cityDataWorksheet.getCell('AT4').value = '推送案件数量'

            cityDataWorksheet.getCell('AU3').value = '省垂系统'
            cityDataWorksheet.mergeCells('AU3', 'AV3')

            cityDataWorksheet.getCell('AU4').value = '部门数量'
            cityDataWorksheet.getCell('AV4').value = '推送案件数量'

            cityDataWorksheet.getCell('AW3').value = '市自建系统'
            cityDataWorksheet.mergeCells('AW3', 'AX3')

            cityDataWorksheet.getCell('AW4').value = '部门数量'
            cityDataWorksheet.getCell('AX4').value = '推送案件数量'

            cityDataWorksheet.getCell('AY3').value = '无系统'
            cityDataWorksheet.mergeCells('AY3', 'AZ3')

            cityDataWorksheet.getCell('AY4').value = '部门数量'
            cityDataWorksheet.getCell('AZ4').value = '推送案件数量'

            cityDataWorksheet.getCell('BA3').value = '无职权/无数据'
            cityDataWorksheet.getCell('BA4').value = '部门数量'
            // endregion

            // region 行政强制
            cityDataWorksheet.getCell('BB2').value = '行政处罚'
            cityDataWorksheet.mergeCells('BB2', 'BJ2')

            cityDataWorksheet.getCell('BB3').value = '国垂系统'
            cityDataWorksheet.mergeCells('BB3', 'BC3')

            cityDataWorksheet.getCell('BB4').value = '部门数量'
            cityDataWorksheet.getCell('BC4').value = '推送案件数量'

            cityDataWorksheet.getCell('BD3').value = '省垂系统'
            cityDataWorksheet.mergeCells('BD3', 'BE3')

            cityDataWorksheet.getCell('BD4').value = '部门数量'
            cityDataWorksheet.getCell('BE4').value = '推送案件数量'

            cityDataWorksheet.getCell('BF3').value = '市自建系统'
            cityDataWorksheet.mergeCells('BF3', 'BG3')

            cityDataWorksheet.getCell('BF4').value = '部门数量'
            cityDataWorksheet.getCell('BG4').value = '推送案件数量'

            cityDataWorksheet.getCell('BH3').value = '无系统'
            cityDataWorksheet.mergeCells('BH3', 'BI3')

            cityDataWorksheet.getCell('BH4').value = '部门数量'
            cityDataWorksheet.getCell('BI4').value = '推送案件数量'

            cityDataWorksheet.getCell('BJ3').value = '无职权/无数据'
            cityDataWorksheet.getCell('BJ4').value = '部门数量'
            // endregion

            // endregion

            cityDataWorksheet.getCell('BK1').value = '总量'
            cityDataWorksheet.mergeCells('BK1', 'BK4')

            cityDataWorksheet.getRow(1).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            }
            cityDataWorksheet.getRow(2).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            }
            cityDataWorksheet.getRow(3).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            }
            cityDataWorksheet.getRow(4).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            }
        }

        const createCityExcelData = (model: CityDepartCaseVolumeExcelModel[]) => {
            const excelData: any[][] = []

            model.forEach(data => {
                excelData.push([
                    data.cityName,
                    data.departCount,
                    data.AL.nv.departCount,
                    data.AL.nv.caseVolume,
                    data.AL.pv.departCount,
                    data.AL.pv.caseVolume,
                    data.AL.citySystem.departCount,
                    data.AL.citySystem.caseVolume,
                    data.AL.noSystem.departCount,
                    data.AL.noSystem.caseVolume,
                    data.AL.noData.departCount,

                    data.AE.nv.departCount,
                    data.AE.nv.caseVolume,
                    data.AE.pv.departCount,
                    data.AE.pv.caseVolume,
                    data.AE.citySystem.departCount,
                    data.AE.citySystem.caseVolume,
                    data.AE.noSystem.departCount,
                    data.AE.noSystem.caseVolume,
                    data.AE.noData.departCount,

                    data.AR.nv.departCount,
                    data.AR.nv.caseVolume,
                    data.AR.pv.departCount,
                    data.AR.pv.caseVolume,
                    data.AR.citySystem.departCount,
                    data.AR.citySystem.caseVolume,
                    data.AR.noSystem.departCount,
                    data.AR.noSystem.caseVolume,
                    data.AR.noData.departCount,

                    data.yzf.AC.departCount,
                    data.yzf.AC.caseVolume,
                    data.yzf.AP.departCount,
                    data.yzf.AP.caseVolume,
                    data.yzf.AF.departCount,
                    data.yzf.AF.caseVolume,

                    data.AC.nv.departCount,
                    data.AC.nv.caseVolume,
                    data.AC.pv.departCount,
                    data.AC.pv.caseVolume,
                    data.AC.citySystem.departCount,
                    data.AC.citySystem.caseVolume,
                    data.AC.noSystem.departCount,
                    data.AC.noSystem.caseVolume,
                    data.AC.noData.departCount,

                    data.AP.nv.departCount,
                    data.AP.nv.caseVolume,
                    data.AP.pv.departCount,
                    data.AP.pv.caseVolume,
                    data.AP.citySystem.departCount,
                    data.AP.citySystem.caseVolume,
                    data.AP.noSystem.departCount,
                    data.AP.noSystem.caseVolume,
                    data.AP.noData.departCount,

                    data.AF.nv.departCount,
                    data.AF.nv.caseVolume,
                    data.AF.pv.departCount,
                    data.AF.pv.caseVolume,
                    data.AF.citySystem.departCount,
                    data.AF.citySystem.caseVolume,
                    data.AF.noSystem.departCount,
                    data.AF.noSystem.caseVolume,
                    data.AF.noData.departCount,

                    data.caseTotalVolume
                ])
            })

            const numRows = excelData.length;
            const numCols = excelData[0].length;
            const totalRow: any[] = [];

            for (let j = 0; j < numCols; j++) {
                let columnSum = 0;
                if (j === 0) {
                    totalRow.push('合计')
                    continue
                } else {
                    for (let i = 0; i < numRows; i++) {
                        columnSum += excelData[i][j];
                    }
                }

                totalRow.push(columnSum);
            }

            excelData.push(totalRow)

            return excelData
        }

        const cityDataWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('地市部门');
        cityDataWorksheet.properties.defaultColWidth = 12
        setCityDataHeader()

        cityDataWorksheet.addRows(createCityExcelData(excelData.cityData));
        cityDataWorksheet.getColumn(1).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        }

        this.setCellBolder(cityDataWorksheet)

        // endregion

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '全省数据所属单位案件量统计-' + getDayString() + '-' + getCurrentTimeInSeconds()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })

    }

    @IpcHandle(channels.xlsx.exportDataSourceDepartCaseVolume)
    public async handleExportDataSourceDepartCaseVolume(provincialData: ThemeBaseDataSourceCaseVolume[], cityData: ThemeBaseDataSourceCaseVolume[]) {

        const createExcelData = (data: ThemeBaseDataSourceCaseVolume[]): ThemeBaseDataSourceCaseVolume[][] => {
            const excelData: any[][] = [];

            excelData.push(['部门名称', '案件量']);
            excelData.push(['', '行政许可', '行政处罚', '行政强制', '行政征收', '行政征用', '行政检查', '总量']);

            const recordMap: Map<string, any[]> = new Map();

            for (const item of data) {
                const tableType = ['c1010', 'c2010', 'c3010', 'c4010', 'c4110', 'c6010']
                let volume: any[] = []
                if (recordMap.has(item.departName)) {
                    volume = recordMap.get(item.departName)
                } else {
                    volume = [item.departName, 0, 0, 0, 0, 0, 0, 0]
                }
                volume[tableType.findIndex(value => value == item.tableType) + 1] = item.volume
                volume[7] = volume[1] + volume[2] + volume[3] + volume[4] + volume[5] + volume[6]
                recordMap.set(item.departName, volume)
            }

            excelData.push(...recordMap.values())

            return excelData;
        }

        const totalRow = (worksheet: ExcelJS.Worksheet) => {

            const dataTotal = [0, 0, 0, 0, 0, 0, 0]

            worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
                if (rowNumber > 2) {
                    row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
                        if (colNumber > 1) {
                            dataTotal[colNumber - 2] += parseInt(cell.text)
                        }
                    })
                }
            })

            return ['合计', ...dataTotal]

        }

        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
        const provinceWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('省直部门');
        provinceWorksheet.addRows(createExcelData(provincialData))
        provinceWorksheet.addRow(totalRow(provinceWorksheet))

        provinceWorksheet.mergeCells('B1', 'G1')
        provinceWorksheet.mergeCells('A1', 'A2')
        provinceWorksheet.getCell('H1').value = '总量'
        provinceWorksheet.mergeCells('H1', 'H2')

        this.setCellBolder(provinceWorksheet)
        provinceWorksheet.getColumn(1).width = 24
        provinceWorksheet.getColumn(1).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        }
        provinceWorksheet.getRow(1).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        }
        provinceWorksheet.getRow(2).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        }

        const cityWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('地市部门');
        cityWorksheet.addRows(createExcelData(cityData))
        cityWorksheet.addRow(totalRow(cityWorksheet))

        cityWorksheet.mergeCells('B1', 'G1')
        cityWorksheet.mergeCells('A1', 'A2')
        cityWorksheet.getCell('H1').value = '总量'
        cityWorksheet.mergeCells('H1', 'H2')

        this.setCellBolder(cityWorksheet)
        cityWorksheet.getColumn(1).width = 24
        cityWorksheet.getColumn(1).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        }
        cityWorksheet.getRow(1).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        }
        cityWorksheet.getRow(2).alignment = {
            vertical: 'middle',
            horizontal: 'center'
        }

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '全省上报单位案件量统计-' + getDayString() + '-' + getCurrentTimeInSeconds()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })

    }

    @IpcHandle(channels.xlsx.exportDataLakeOwnDepartCaseVolume)
    public async handleExportDataLakeOwnDepartCaseVolume(model: DataLakeOwnDepartCaseVolumeExcelModel[]) {
        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
        const filePath = join(getResourcePath(), '/assets/excelTemplate/dataLakeOwnDepartCaseVolumeTemplate.xlsx')
        await workbook.xlsx.readFile(filePath);

        const dataWorksheet: ExcelJS.Worksheet = workbook.getWorksheet(1)

        const createExcelData = (model: DataLakeOwnDepartCaseVolumeExcelModel[]) => {
            const excelData: any[][] = [];

            model.forEach(data => {
                excelData.push([
                    data.subjectName,
                    data.ownDepartName ? data.ownDepartName : '无所属单位名称',

                    data.AL.nv,
                    data.AL.pv,
                    data.AL.citySystem,
                    data.AL.noSystem,

                    data.AE.nv,
                    data.AE.pv,
                    data.AE.citySystem,
                    data.AE.noSystem,

                    data.AR.nv,
                    data.AR.pv,
                    data.AR.citySystem,
                    data.AR.noSystem,

                    data.yzf.AC,
                    data.yzf.AP,
                    data.yzf.AF,

                    data.AC.nv,
                    data.AC.pv,
                    data.AC.citySystem,
                    data.AC.noSystem,

                    data.AP.nv,
                    data.AP.pv,
                    data.AP.citySystem,
                    data.AP.noSystem,

                    data.AF.nv,
                    data.AF.pv,
                    data.AF.citySystem,
                    data.AF.noSystem,

                    data.caseTotalVolume
                ])
            })

            const numRows = excelData.length;
            const numCols = excelData[0].length;
            const totalRow: any[] = [];

            for (let j = 0; j < numCols; j++) {
                let columnSum = 0;
                if (j === 0) {
                    totalRow.push('合计')
                    continue
                } else if (j === 1) {
                    totalRow.push('')
                    continue
                } else {
                    for (let i = 0; i < numRows; i++) {
                        columnSum += excelData[i][j];
                    }
                }

                totalRow.push(columnSum);
            }

            excelData.push(totalRow)

            return excelData
        }

        dataWorksheet.addRows(createExcelData(model))

        this.setCellBolder(dataWorksheet)
        dataWorksheet.getColumn(1).width = 30
        dataWorksheet.getColumn(2).width = 30

        //   dataWorksheet.mergeCells(`A${model.length + 5}`, `B${model.length + 5}`)

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '数据湖全省数据所属单位案件量统计-' + getDayString() + '-' + getCurrentTimeInSeconds()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })
    }

    @IpcHandle(channels.xlsx.exportCreditPublicityData)
    public async handleExportCreditPublicityData(dataType: string) {

        type CreditPublicityResult = {
            code: number,
            data: {
                page: number,
                pageSize: number,
                records: number,
                rows: CreditPublicityXzcf[],
                total: number,
                totalPage: number
            },
            message: string,
            success: boolean
        }

        const getData = (tableName: string, page: number, rows: number, orderArgs: string) => {
            return new Promise<CreditPublicityResult>(async (resolve, reject) => {
                const request = net.request({
                    method: 'POST',
                    url: `https://credit.gd.gov.cn/gdcreditwebApi2//company/web/booleanQueryListByPageSimple`,
                });

                request.setHeader('Content-Type', 'application/x-www-form-urlencoded');

                request.write(`tableName=${tableName}&page=${page}&rows=${rows}&orderArgs=${orderArgs}`)

                let data = '';

                request.on('response', (response) => {
                    response.on('data', (chunk) => {
                        data += chunk;
                    });

                    response.on('end', () => {
                        try {
                            resolve(JSON.parse(data))
                        } catch (err) {
                            log.error(data)
                            resolve(null)
                        }
                    });
                });

                request.on('error', (err) => {
                    reject(err)
                });

                request.end();
            })
        }

        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
        const xzcfWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('行政处罚');
        xzcfWorksheet.addRow(['企业名称', '统一社会信用代码', '从业许可证号', '法人姓名', '身份证号', '违法行为事实', '处罚决定日期'])

        let curPage = 1
        while (1) {
            const result = await getData(dataType, curPage, 75, `[{"cf_jdrq_sort":"desc"}]`)
            console.log(result.message, curPage)

            result.data.rows.forEach(row => {
                xzcfWorksheet.addRow([row.cf_xdr_mc, row.cf_xdr_shxym, '', row.cf_frdb, row.cf_fr_zjhm, row.cf_sy, row.cf_jdrq])
            })

            if (result.data.page >= result.data.totalPage) {
                break
            } else {
                curPage++
            }
        }

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '全省上报单位数据量统计-' + getDayString() + '-' + getCurrentTimeInSeconds()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })

    }

    @IpcHandle(channels.xlsx.exportInspWrongFieldData)
    public async handleExportInspWrongFieldData(data: InspectionWrongFieldDataExcelModel[]) {


        const createExcelData = (model: InspectionWrongFieldDataExcelModel[]) => {
            const excelData: any[][] = [];
            excelData.push(['质检门户所属单位', '编目挂接单位名称', '行为类型', '质检表名', '表中文名', '问题字段名', '问题字段中文名', '具体问题', '问题数据量']);

            model.forEach(item => {
                excelData.push([
                    item.ownDepartName,
                    item.catalogDepartName,
                    item.actionType,
                    item.tableName,
                    item.tableNameCn,
                    item.wrongFieldName,
                    item.wrongFieldNameCn,
                    item.wrongReason,
                    item.count
                ])
            })

            return excelData
        }

        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook()
        const dataLakeInspWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('入湖质检问题统计')
        const themeBaseInspWorksheet: ExcelJS.Worksheet = workbook.addWorksheet('入库质检问题统计')


        const customSort = (a: InspectionWrongFieldDataExcelModel, b: InspectionWrongFieldDataExcelModel) => {
            // Compare by ownDepartName
            let comparison = a.ownDepartName.localeCompare(b.ownDepartName);
            if (comparison !== 0) return comparison;

            // If ownDepartName is equal, compare by catalogDepartName
            comparison = a.catalogDepartName.localeCompare(b.catalogDepartName);
            if (comparison !== 0) return comparison;

            // If catalogDepartName is equal, compare by actionType
            comparison = a.actionType.localeCompare(b.actionType);
            if (comparison !== 0) return comparison;

            // If actionType is equal, compare by wrongFieldName
            return a.wrongFieldName.localeCompare(b.wrongFieldName);
        }


        dataLakeInspWorksheet.addRows(createExcelData(data
            .filter(item => item.tableName.toLowerCase().endsWith('_temp_ods'))
            .sort(customSort)
        ))
        themeBaseInspWorksheet.addRows(createExcelData(data
            .filter(item => !item.tableName.toLowerCase().endsWith('_temp_ods'))
            .sort(customSort)
        ))

        this.setColumnWidths(dataLakeInspWorksheet, [25, 25, 10, 25, 25, 12, 20, 35, 15])
        this.setColumnWidths(themeBaseInspWorksheet, [25, 25, 10, 25, 25, 12, 20, 35, 15])

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '质检问题数据统计-' + getDayString() + '-' + getCurrentTimeInSeconds()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })
    }

    @IpcHandle(channels.xlsx.exportGdZwfwOrgTaskType)
    public async handleExportGdZwfwOrgTaskType(data: ZwfwOrgTask[]) {

        // 将ZwfwOrgTask数组按city属性分组为二维数组
        function groupByCity(tasks: ZwfwOrgTask[]): Map<string, ZwfwOrgTask[]> {
            const map = new Map<string, ZwfwOrgTask[]>();

            for (const task of tasks) {
                // 如果该city已存在于map中，则直接向对应数组添加当前元素
                if (map.has(task.city)) {
                    map.get(task.city)!.push(task);
                } else {
                    // 否则为该city创建新数组，并将当前元素添加到数组中
                    map.set(task.city, [task]);
                }
            }
            return map
        }

        const dataMapByCity = groupByCity(data)

        const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();

        dataMapByCity.forEach((tasks, city) => {

            if (city === '') {
                city = '省级部门'
            }

            const worksheet: ExcelJS.Worksheet = workbook.addWorksheet(city);

            // 添加表头
            worksheet.addRow(['部门名称', '部门区划', '实施清单']);
            worksheet.addRow(['部门名称', '部门区划', '行政许可', '行政处罚', '行政强制', '行政征收', '行政检查']);

            // 合并单元格
            worksheet.mergeCells('A1', 'A2')
            worksheet.mergeCells('B1', 'B2')
            worksheet.mergeCells('C1', 'G1')

            // 添加数据
            tasks.forEach(task => {
                worksheet.addRow([
                    task.orgName,
                    task.orgAreaCode,
                    task.taskType.AL ? '√' : '×',
                    task.taskType.AP ? '√' : '×',
                    task.taskType.AF ? '√' : '×',
                    task.taskType.AE ? '√' : '×',
                    task.taskType.AC ? '√' : '×'
                ]);
            })

            this.setCellBolder(worksheet)
            worksheet.getColumn(1).width = 30

            worksheet.getRow(1).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            }
            worksheet.getRow(2).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            }
        })

        await dialog.showSaveDialog({
            title: '选择文件保存位置',
            filters: [{
                name: 'xlsx',
                extensions: ['xlsx']
            }],
            defaultPath: '广东省政务服务网实施清单-' + getDayString() + '-' + getCurrentTimeInSeconds()
        }).then(res => {
            if (!res.canceled) {
                // 导出 Excel 文件
                (workbook.xlsx as ExcelJS.Xlsx).writeFile(res.filePath)
            }
        })
    }

}
