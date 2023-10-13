import {TreeOption} from "naive-ui";

export const nTreeFindOptionByKey = (treeOptions: TreeOption[], key: any): TreeOption => {
    for (const option of treeOptions) {
        if (option.key as string === key) {
            return option
        }
        if (option.children) {
            // 继续递归查找子节点
            const opt = nTreeFindOptionByKey(option.children, key);
            if (opt) {
                return opt
            }
        }
    }
}
