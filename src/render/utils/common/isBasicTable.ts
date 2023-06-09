export const isBasicTable = (tableName: string) => {
    const tableAbbr = tableName.split('_')[2]
    if (tableAbbr != undefined) {
        return tableAbbr.toLowerCase().startsWith("g") || tableAbbr.toLowerCase().startsWith("y")
            || tableAbbr.toLowerCase().startsWith("f") || tableAbbr.toLowerCase().startsWith("z")
            || tableAbbr.toLowerCase().startsWith("d");
    }
    return false
}
