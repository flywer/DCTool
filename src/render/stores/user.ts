import {UserType} from "@common/datacenter.types";
import {defineStore} from "pinia";

export const useUserStore = defineStore({
    id: 'user',
    state: () => ({
        isLogin: false,
        account: undefined,
        dcUserInfo: undefined as UserType
    }),
})
