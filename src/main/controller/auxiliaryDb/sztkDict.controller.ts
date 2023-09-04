import {AppDataSource} from "@main/dataSource/data-source";
import {GdsztkDict} from "@main/entity/GdsztkDict";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import {IsNull, Like, Not} from "typeorm";

@Controller()
export class SztkDictController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.sztkDict.getSztkDict)
    public async handleGetSztkDict(obj: Partial<GdsztkDict>) {

        return await AppDataSource.getRepository(GdsztkDict).find({
            select: ['id'],
            where: {
                dictName: obj.dictName,
                dictCode: obj.dictCode,
            },
            order: {orderNum: 'asc'}
        })
    }

    @IpcHandle(channels.auxiliaryDb.sztkDict.saveSztkDict)
    public async handleSaveSztkDict(obj: GdsztkDict[]) {
        return await AppDataSource.getRepository(GdsztkDict).insert(obj)
    }

    @IpcHandle(channels.auxiliaryDb.sztkDict.getParentDict)
    public async handleGetParentDict(dictName: string) {
        return await AppDataSource.getRepository(GdsztkDict).find({
            where: {
                dictName: Like(`%${dictName || ''}%`),
                parentId: IsNull(),
                cdOperation: Not('D')
            }
        })
    }

    @IpcHandle(channels.auxiliaryDb.sztkDict.getDictByParentId)
    public async handleGetDictByParentId(parentId: string) {
        return await AppDataSource.getRepository(GdsztkDict).find({
            where: {
                parentId: parentId,
                cdOperation: Not('D')
            }
        })
    }

    @IpcHandle(channels.auxiliaryDb.sztkDict.getDictByBzId)
    public async handleGetDictByBzId(bzId: string) {
        return await AppDataSource.getRepository(GdsztkDict).findOne({
            where: {
                bzId: bzId,
                cdOperation: Not('D')
            }
        })
    }
}
