import {FrontSource} from "@main/dataSource/front-source";
import {DataLakeDataVolume} from "@main/entity/frontEnd/DataLakeDataVolume";
import {DataLakeOwnDepartCaseVolume} from "@main/entity/frontEnd/dataLakeOwnDepartCaseVolume";
import {FrontEndDataVolume} from "@main/entity/frontEnd/FrontEndDataVolume";
import {OdsDataVolume} from "@main/entity/frontEnd/OdsDataVolume";
import {ThemeBaseDataSourceCaseVolume} from "@main/entity/frontEnd/ThemeBaseDataSourceCaseVolume";
import {ThemeBaseDataVolume} from "@main/entity/frontEnd/ThemeBaseDataVolume";
import {channels} from "@render/api/channels";
import {Controller, IpcHandle} from "einf";
import log from 'electron-log'
import {Like} from "typeorm";

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

    public async handleInsertToThemeBaseDataVolume(res: any[]) {
        return FrontSource.getRepository(ThemeBaseDataVolume).insert(res)
    }

    @IpcHandle(channels.front.getAllFrontEndDataVol)
    public async handleGetAllFrontEndDataVol() {
        return FrontSource.getRepository(FrontEndDataVolume).find()
    }

    @IpcHandle(channels.front.getFrontEndDataVolByDepartNameAndTableType)
    public async handleGetFrontEndDataVolByDepartNameAndTableType(departName: string, tableType: string) {
        return FrontSource.getRepository(FrontEndDataVolume).findOne({
            where: {
                departName: Like(`${departName}%`),
                tableType: tableType
            },
            order: {updateTime: 'desc'}
        })
    }

    @IpcHandle(channels.front.getDataLakeDataVolByDepartNameAndTableType)
    public async handleGetDataLakeDataVolByDepartNameAndTableType(projectId: string, tableType: string) {
        return FrontSource.getRepository(DataLakeDataVolume).findOne({
            where: {
                projectId: Like(`${projectId}%`),
                tableType: tableType
            },
            order: {updateTime: 'desc'}
        })
    }

    @IpcHandle(channels.front.getThemeBaseDataVolByDepartNameAndTableType)
    public async handleGetThemeBaseDataVolByDepartNameAndTableType(departName: string, tableType: string) {
        return FrontSource.getRepository(ThemeBaseDataVolume).findOne({
            where: {
                departName: Like(`${departName}%`),
                tableType: tableType
            },
            order: {updateTime: 'desc'}
        })
    }

    @IpcHandle(channels.front.getThemeBaseDataSourceCaseVolume)
    public handleGetThemeBaseDataSourceCaseVolume() {
        return FrontSource.getRepository(ThemeBaseDataSourceCaseVolume).query(`
         SELECT id,table_type AS tableType, volume, depart_name AS departName, area_code AS areaCode, create_time as createTime
         FROM xzzf_sjtj_theme_base_data_source_case_volume t1
         WHERE create_time = (SELECT MAX(create_time) 
                             FROM xzzf_sjtj_theme_base_data_source_case_volume t2 
                             WHERE t1.depart_name = t2.depart_name)
         ORDER BY table_type
        `)
    }

    @IpcHandle(channels.front.getOdsDataVolume)
    public handleGetOdsDataVolume(departName: string, tableType: string) {
        return FrontSource.getRepository(OdsDataVolume).find(
            {
                where: {
                    departName: departName,
                    tableType: tableType
                },
                order: {createTime: 'desc'}
            })
    }

    @IpcHandle(channels.front.getDataLakeOwnDepartCaseVolume)
    public handleGetDataLakeOwnDepartCaseVolume() {
        return FrontSource.getRepository(DataLakeOwnDepartCaseVolume).find({
            order: {subjectName: 'asc'}
        })
    }
}
