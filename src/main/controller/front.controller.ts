import {FrontSource} from "@main/dataSource/front-source";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";

@Controller()
export class FrontController {
    constructor() {
    }

    @IpcHandle(channels.front.getTableData)
    public async handleGetTableData(tableName: string, limitNum: number, cdTimeOrder: boolean) {
        let data = []
        const cols = (await FrontSource.manager.query(`DESCRIBE ${tableName}`)).map(v => v.Field)

        data.push(cols)

        const dataQuery = `SELECT *
                           FROM ${tableName} ${cdTimeOrder ? 'ORDER BY cd_time DESC' : 'ORDER BY cd_time'} LIMIT ${limitNum}`;

        const records = await FrontSource.manager.query(dataQuery)

        records.forEach(record => {
            data.push(Object.values(record))
        })

        return data
    }

}
