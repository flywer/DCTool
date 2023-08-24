export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
