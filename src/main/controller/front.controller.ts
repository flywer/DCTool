import {FrontSource} from "@main/dataSource/front-source";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import log from 'electron-log'

@Controller()
export class FrontController {
    constructor() {
    }

    @IpcHandle(channels.front.getTableData)
    public async handleGetTableData(tableName: string, limitNum: number, cdTimeOrder: boolean) {
        let data = []
        const cols = (await FrontSource.manager.query(`DESCRIBE ${tableName}`)).map((v: { Field: any; }) => v.Field)

        data.push(cols)

        try {
            const dataQuery = `SELECT *
                               FROM ${tableName} ${cdTimeOrder ? 'ORDER BY cd_time DESC' : ''} LIMIT ${limitNum}`;

            const records = await FrontSource.manager.query(dataQuery)

            records.forEach((record: { [s: string]: unknown; } | ArrayLike<unknown>) => {
                data.push(Object.values(record))
            })
        } catch (error) {
            log.error(error)
        }

        return data
    }

}
