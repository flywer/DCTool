import {AppDataSource} from "@main/dataSource/data-source";
import {PreDatabase} from "@main/entity/PreDatabase";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";

@Controller()
export class PreDatabaseController {
    constructor() {
    }

    @IpcHandle(channels.auxiliaryDb.preDatabase.getPreDatabaseDepart)
    public async handleGetPreDatabase() {
        return await AppDataSource.getRepository(PreDatabase).find({
            select: ['id', 'departName']
        })
    }

    @IpcHandle(channels.auxiliaryDb.preDatabase.getPreDatabaseTableInfoJson)
    public async handleGetPreDatabaseTableInfoJson(id: string) {
        return await AppDataSource.getRepository(PreDatabase).findOneBy({
            id: parseInt(id)
        })
    }

    @IpcHandle(channels.auxiliaryDb.preDatabase.updateTableInfoJson)
    public async handleUpdateTableInfoJson(obj: PreDatabase) {
        const pd = await AppDataSource.getRepository(PreDatabase).findOneBy({
            departName: obj.departName
        })

        if (pd === null) {
            return await AppDataSource.getRepository(PreDatabase).createQueryBuilder()
                .insert()
                .into(PreDatabase)
                .values([{
                    departName: obj.departName,
                    tableInfoJson: obj.tableInfoJson
                }])
                .execute()
        } else {
            return await AppDataSource.getRepository(PreDatabase).createQueryBuilder()
                .update(PreDatabase)
                .set({
                    tableInfoJson: obj.tableInfoJson
                })
                .where("departName = :departName", {departName: obj.departName})
                .execute()
        }
    }
}
