import {InspectionDataStatType} from "@common/types";
import {getDayString} from "@main/utils/dateUtils";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {dialog} from "electron";
import * as ExcelJS from 'exceljs';

@Controller()
export class XlsxController {
    constructor() {
    }

    @IpcHandle(channels.xlsx.createDataInpsStat)
    public async handleCreateDataInpsStat(data: InspectionDataStatType[]) {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const columnWidths = [20, 30, 30, 20, 20, 20, 20];

        const provinceData: InspectionDataStatType[] = data.filter((item) => item.orgName.startsWith('广东省'));
        const cityData: InspectionDataStatType[] = data.filter((item) => !item.orgName.startsWith('广东省'));

        const provinceWorksheet = workbook.addWorksheet('省直部门');

        provinceWorksheet.addRows(createExcelData(provinceData));

        setColumnWidths(provinceWorksheet, columnWidths);
        setFirstRow(provinceWorksheet)
        setBolder(provinceWorksheet)
        setStripeStyle(provinceWorksheet)

        const cityWorksheet = workbook.addWorksheet('地市');

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
                workbook.xlsx.writeFile(res.filePath, workbook)
            }
        })

    }
}

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
