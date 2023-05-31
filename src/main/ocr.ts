/*
import {app} from "electron";
import * as fs from 'fs';
import path from "path";
import sharp from 'sharp';
import tesseract from 'tesseract.js';
import * as xlsx from 'xlsx/xlsx.mjs';

export const ocr = async (filePath: string) => {
    let text = ''

    // 加载图像文件
    const imageBuffer = fs.readFileSync(filePath);

    // 对图像进行预处理
    const processedImage = await sharp(imageBuffer)
        //.resize(800)
        //.grayscale()
        //.normalize()
        //.sharpen()
        .toBuffer();

    //console.log(path.join(process.cwd(), 'lang-data'))

    // 对图像中的文字进行识别
    await tesseract.recognize(filePath, 'my_chi', {
        //logger: m => console.log(m),
        langPath: path.join(process.cwd(), 'lang-data')
    }).then(result => {
        text = result.data.text;
        console.log(text)

        /!*             // 将识别结果整理为Excel表格
                    const words = text.split(' ');
                    const rows = [];
                    let currentRow = [];
                    for (let i = 0; i < words.length; i++) {
                        if (words[i] === '\n' || words[i] === '\r\n' || words[i] === '\r') {
                            rows.push(currentRow);
                            currentRow = [];
                        } else {
                            currentRow.push(words[i]);
                        }
                    }
                    rows.push(currentRow);

                    // 导出Excel表格
                    const workbook = xlsx.utils.book_new();
                    const worksheet = xlsx.utils.aoa_to_sheet(rows);
                    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
                    xlsx.writeFile(workbook, 'output.xlsx'); *!/
    });

    return text
}



*/
