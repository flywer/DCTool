// 数据治理

// 标准规范
export type Norm = {
    id: string;
    createBy: string;
    updateBy: string;
    createTime: string;
    updateTime: string;
    delFlag: number;
    normName: string;
    normNo: any;
    state: number;
    normLevel: number;
    ccs: any;
    ics: any;
    competentDepartment: string;
    ascriptionDepartment: any;
    releaseTime: string;
    implementTime: string;
    sequenceNumber: any;
    scope: any;
    likeValue: any;
}

export type NormCodeSet = {
    id: string;
    createBy: string;
    updateBy: string;
    createTime: string;
    updateTime: string;
    delFlag: number;
    codeSetCode: string;
    codeSetName: string;
    normId: string;
    version: string;
    lastVersionId: string;
    hashCode: number;
    normName: any;
    normNo: any;
    state: any;
    releaseTime: any;
    startReleaseTime: any;
    endReleaseTime: any;
    type: any;
    likeValue: any;
}
