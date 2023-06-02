/**
 * 根据两数组的共有元素，不区分大小写，过滤原数组，并返回更新之后的原数组
 * @param arr1
 * @param arr2
 * @param arr2IsHive :arr2d是否作为hive的特殊列处理（0:id:int --> id）
 **/
export const findCommonElements = (arr1: string[], arr2: string[], arr2IsHive?: boolean) => {
    const commonElements: string[] = [];

    // 将arr1数组中的所有元素转换为小写字母形式，以便与arr2数组进行比较
    const lowerCaseArr1 = arr1.map((el) => el.toLowerCase());

    for (const element of arr2) {
        // 将arr2数组中的元素转换为小写字母形式，以便与arr1数组中的元素进行比较
        let lowerCaseElement
        if (arr2IsHive) {
            lowerCaseElement = element.toLowerCase().split(':')[1]
        } else {
            lowerCaseElement = element.toLowerCase();
        }

        if (lowerCaseArr1.includes(lowerCaseElement)) {
            commonElements.push(lowerCaseElement);
        }
    }

    // 在原始数组中过滤出包含相同元素的新数组
    const commonArr1 = arr1.filter((el) => commonElements.includes(el.toLowerCase()));
    let commonArr2
    if (arr2IsHive) {
        commonArr2 = arr2.filter((el) => commonElements.includes(el.toLowerCase().split(':')[1]));
    } else {
        commonArr2 = arr2.filter((el) => commonElements.includes(el.toLowerCase()));
    }

    return {
        commonArr1,
        commonArr2
    };
}

/**
 * 通过Arr2生成一个由Arr1的元素组成且长度等于Arr2的数组，若Arr2的值不存在于Arr1中，对应索引的值为NULL
 **/
export const findCommonElementsByArr2 = (arr1: any[], arr2: any[], arr2IsHive?: boolean): any[] => {
    const result = [];
    for (let i = 0; i < arr2.length; i++) {
        const index = arr1.findIndex(item => {
            if (arr2IsHive) {
                return item.toLowerCase() === arr2[i].toLowerCase().split(':')[1]
            } else {
                return item.toLowerCase() === arr2[i].toLowerCase()
            }
        });

        if (index !== -1) {
            result.push(arr1[index]);
        } else {
            result.push(null);
        }
    }
    return result;
}
