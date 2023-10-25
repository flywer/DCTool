// 登陆时用户信息
export  type UserType = {
    username: string;
    user: {
        id: string;
        username: string;
        name: string;
        type: string;
        gender: any;
        creditType: string;
        creditNo: string;
        source: string;
        phone: string;
        email: string;
        duty: any;
        avatar: any;
        leader: any;
        tifUserId: any;
        unit: {
            id: string;
            name: string;
            code: string;
            area: string;
            level: string;
            usci: any;
        };
        depts: {
            0: {
                id: string;
                name: string;
                code: string;
                area: string;
                level: string;
                usci: any;
            };
        };
        roles: {
            0: {
                id: string;
                systemList: {
                    id: string;
                    name: string;
                    code: string;
                    area: any;
                }[]
                category: string
                type: string
                name: string
                code: string
                level: any
                area: string
                dataPerms: any
                dataConfig: string
            };
        };
        onLoan: any
        tempPost: any
        onSite: any
        expireTime: any
    };
    loginSource: any
    isGuest: boolean
    isVisitor: boolean
    functionPerms: string[]
    dataPerms: string[]
    joinUserIds: any
    roles: string[]
};
