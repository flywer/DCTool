import {SetupModelType} from "@common/types";
import {defineStore} from "pinia";

export const useAppSettingsStore = defineStore({
    id: 'appSettings',
    state: () => ({
        setup: {
            openAtLogin: false,
            closeAsHidden: false,
            enableSysTray: false,
            themeAccentColor: 'followSys',
            autoUpdate: false,
            updateChannel: 'Github',
            hardwareAcceleration: true
        } as SetupModelType,
    }),
})
