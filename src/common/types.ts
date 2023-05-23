export type Nullable<T> = T | null

export type Voidable<T> = T | null | undefined

export interface IpcResponse<T> {
  data?: any
  error?: any
}
