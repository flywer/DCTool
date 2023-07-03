export const getFirstDayOfMonth = (): Date => {
    const now = new Date(); // 创建一个当前日期的 Date 对象
    const year = now.getFullYear(); // 获取当前年份
    const month = now.getMonth(); // 获取当前月份（注意：月份从 0 开始计数，即一月为 0）

    // 使用当前年份和月份创建一个新的 Date 对象，将日期设置为 1 来获取该月的第一天
    return new Date(year, month, 1);
}
