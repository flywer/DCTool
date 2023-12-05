import {PageResult, PageVo} from "@common/types";
import {DepartCatalogHookRecord} from "@main/entity/DepartCatalogHookRecord";
import {Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const update_depart_catalog_hook_info_by_excel = async (): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.departCatalogHookRecord.updateByExcel)
    return data
}

export const download_catalog_hook_info_import_template = async () => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.departCatalogHookRecord.downloadImportTemplate)
    return data
}

export const get_depart_catalog_hook_info_by_page = async (page: PageVo): Promise<PageResult<DepartCatalogHookRecord>> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.departCatalogHookRecord.getCatalogHookInfoByDepartName, page)
    return data
}

export const delete_catalog_hook_record = async (id: number): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.departCatalogHookRecord.deleteCatalogHookRecord, id)
    return data
}

export const export_catalog_hook_data = async (): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.departCatalogHookRecord.exportCatalogHookData)
    return data
}

export const find_catalog_hook_record_by_depart_name = async (departName: string): Promise<DepartCatalogHookRecord> => {
    const {data} = await ipcInstance.send(channels.auxiliaryDb.departCatalogHookRecord.findCatalogHookRecordByDepartName, departName)
    return data
}
