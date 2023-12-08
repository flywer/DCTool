export class ArrayUtils {

    /**
     * 去重并合并两个字符串数组
     **/
    public static mergeAndDistinctArrays(arr1: string[], arr2: string[]): string[] {
        const mergedArray = arr1.concat(arr2);
        return Array.from(new Set(mergedArray));
    }
}
