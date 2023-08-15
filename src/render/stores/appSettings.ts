import {SetupModelType} from "@common/types";
import {defineStore} from "pinia";

export const useAppSettingsStore = defineStore({
    id: 'appSettings',
    state: () => ({
        setup: null as SetupModelType,
    }),
})
