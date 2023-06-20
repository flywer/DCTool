//通过表明判断此表是否为基础表
export const isBasicTable = (tableName: string) => {
    let tableAbbr = tableName.split('_')[2]

    if (tableAbbr == undefined) {
        tableAbbr = tableName
    }
    return tableAbbr.toLowerCase().startsWith("g") || tableAbbr.toLowerCase().startsWith("y")
        || tableAbbr.toLowerCase().startsWith("f") || tableAbbr.toLowerCase().startsWith("z")
        || tableAbbr.toLowerCase().startsWith("d");
}
