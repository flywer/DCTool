import {UserType} from "@common/types/datacenter/user";
import {defineStore} from "pinia";

export const useUserStore = defineStore({
    id: 'user',
    state: () => ({
        isLogin: false,
        account: undefined,
        dcUserInfo: undefined as UserType
    }),
})
