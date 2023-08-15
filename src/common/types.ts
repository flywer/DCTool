export type Nullable<T> = T | null

export type Voidable<T> = T | null | undefined

export interface IpcResponse<T> {
    data?: any
    error?: any
}

export type SetupModelType = {
    // 开机自启
    openAtLogin?: boolean
    // 关闭时隐藏到托盘
    closeAsHidden?: boolean
    // 启用系统托盘
    enableSysTray?: boolean
    // 自定义主题: followSys:跟随系统主题
    themeAccentColor?: 'followSys' | 'light' | 'dark'
    // 自动更新
    autoUpdate?: boolean
    // 更新渠道
    updateChannel?: 'Github'
    // 硬件加速
    hardwareAcceleration?: boolean
}
