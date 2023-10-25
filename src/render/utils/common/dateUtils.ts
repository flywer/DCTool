import {isNull} from "lodash";

export const formatDate = (date: Date): string => {
    if (!isNull(date)) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } else {
        return null
    }

}

/**
 * 提取日期中的年月日
 * @param date 带提取日期
 * @param isCN 展示为"yyyy年mm月dd日",还是"yyyy-mm-dd"
 **/
export const formatDate2Day = (date: Date, isCN?: boolean): string => {
    if (!isNull(date)) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        if (isCN) {
            return `${year}年${month}月${day}日`
        } else {
            return `${year}-${month}-${day}`;
        }
    } else {
        return null
    }
}



export const isValidDateString = (dateString: string): boolean => {
    const timestamp = Date.parse(dateString);
    return !isNaN(timestamp);
}

export const formatDateString = (dateString: string): string => {
    const inputDate = new Date(dateString);

    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');

    const hours = String(inputDate.getHours()).padStart(2, '0');
    const minutes = String(inputDate.getMinutes()).padStart(2, '0');
    const seconds = String(inputDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 比较两时间字符串大小，1为前者大，-1为后者大，0为相等
 **/
export const compareTimeStrings = (timeString1: string | null, timeString2: string | null): number | null => {
    if ((timeString1 === null && timeString2 === null) || (timeString1 === '--' && timeString2 === '--')) {
        return 0; // 两者都为空，视为相等
    }

    if (timeString1 === null || timeString1 === '--') {
        return -1; // 第一个为空，第二个不为空，第一个小于第二个
    }

    if (timeString2 === null || timeString2 === '--') {
        return 1; // 第一个不为空，第二个为空，第一个大于第二个
    }

    const date1 = new Date(timeString1);
    const date2 = new Date(timeString2);

    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return null; // 无效的日期字符串，返回 null
    }

    if (date1 < date2) {
        return -1;
    } else if (date1 > date2) {
        return 1;
    } else {
        return 0; // 两者相等
    }
}

/**
 * 获取本月第一天
 **/
export const getFirstDayOfMonth = (): Date => {
    const now = new Date(); // 创建一个当前日期的 Date 对象
    const year = now.getFullYear(); // 获取当前年份
    const month = now.getMonth(); // 获取当前月份（注意：月份从 0 开始计数，即一月为 0）

    // 使用当前年份和月份创建一个新的 Date 对象，将日期设置为 1 来获取该月的第一天
    return new Date(year, month, 1);
}

/**
 * 获取本周星期一
 **/
export const getMondayOfCurrentWeek = (): Date => {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Calculate the number of days to subtract to get to the previous Monday
    const daysToSubtract = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    const mondayDate = new Date(currentDate);
    mondayDate.setDate(currentDate.getDate() - daysToSubtract);
    mondayDate.setHours(0, 0, 0, 0);

    return mondayDate;
}
