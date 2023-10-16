import {CronJob} from "cron";
import {isEmpty} from "lodash";

type CronExpression = [number[], number[], number[], string, string, string, string];

const parseCronExpression = (expression: string): CronExpression => {
    const parts = expression.split(" ");
    const seconds = parseRange(parts[0]);
    const minutes = parseRange(parts[1]);
    const hours = parseRange(parts[2]);
    const dayOfMonth = parts[3];
    const month = parts[4];
    const dayOfWeek = parts[5];
    const year = parts[6];

    return [seconds, minutes, hours, dayOfMonth, month, dayOfWeek, year];
}

const parseRange = (range: string): number[] => {
    if (range === "*") {
        return [];
    }

    const parts = range.split(",");
    const result: number[] = [];

    for (const part of parts) {
        if (part.includes("-")) {
            const [start, end] = part.split("-");
            const startNum = parseInt(start);
            const endNum = parseInt(end);

            for (let i = startNum; i <= endNum; i++) {
                result.push(i);
            }
        } else {
            result.push(parseInt(part));
        }
    }

    return result;
}

const areMinutesAndHoursConflicting = (cron1: CronExpression, cron2: CronExpression): boolean => {
    const [, minutes1, hours1, , , ,] = cron1;
    const [, minutes2, hours2, , , ,] = cron2;

    for (const minute1 of minutes1) {
        for (const minute2 of minutes2) {
            if (minute1 === minute2) {
                for (const hour1 of hours1) {
                    for (const hour2 of hours2) {
                        if (hour1 === hour2) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    return false;
}

// 判断新cron表达式的执行时间是否与原有的冲突，只判断分与时
export const isTimeConflict = (cronExpressions: string[], newExpression: string): string[] => {
    const conflictingExpressions: string[] = [];
    const newCronExpression = parseCronExpression(newExpression);

    for (const cronExpression of cronExpressions) {
        const existingCronExpression = parseCronExpression(cronExpression);

        if (areMinutesAndHoursConflicting(existingCronExpression, newCronExpression)) {
            conflictingExpressions.push(cronExpression);
        }
    }

    return conflictingExpressions;
}

// 中间cron表达式信息提取
export const convertCronExpression = (expression: string) => {
    if (!isEmpty(expression)) {
        const parts = expression.split(" ");
        return {
            seconds: parts[0],
            minutes: parts[1],
            hours: parts[2],
            dayOfMonth: parts[3],
            month: parts[4],
            dayOfWeek: parts[5],
            year: parts[6],
        }
    } else {
        return null
    }

}

// 根据中台cron表达式项生成表达式
export const generateCronExpression = (times: {
    sec: string,
    min: string,
    hour: string,
    day: string,
    month: string,
    week: string,
    year: string
}) => {
    return `${times.sec} ${times.min} ${times.hour} ${times.day} ${times.month} ${times.week} ${times.year}`
}

// 检查的cron里的表达式 不是中台的
export const isCronExpressionValid = (cronExpression: string): boolean => {
    try {
        new CronJob(cronExpression, () => {
        }, null, false)
        return true;
    } catch (error) {
        return false;
    }
}

// 检查中台的cron里的表达式
export const isDCCronExpressionValid = (cronExpression: string) => {
    try {
        const expressionItems = convertCronExpression(cronExpression);

        const expression = `
        ${expressionItems.seconds} 
        ${expressionItems.minutes} 
        ${expressionItems.hours} 
        ${expressionItems.dayOfMonth == '?' ? '*' : expressionItems.dayOfMonth} 
        ${expressionItems.month} 
        ${expressionItems.dayOfWeek} 
        `
        new CronJob(expression, () => {
        }, null, false)
        return true;
    } catch (error) {
        return false;
    }
}
