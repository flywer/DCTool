import "reflect-metadata"
import {DataLakeDataVolume} from "@main/entity/frontEnd/DataLakeDataVolume";
import {FrontEndDataVolume} from "@main/entity/frontEnd/FrontEndDataVolume";
import {OdsDataVolume} from "@main/entity/frontEnd/OdsDataVolume";
import {ThemeBaseDataSourceCaseVolume} from "@main/entity/frontEnd/ThemeBaseDataSourceCaseVolume";
import {ThemeBaseDataVolume} from "@main/entity/frontEnd/ThemeBaseDataVolume";
import {DataSource} from "typeorm"

export const FrontSource = new DataSource({
    type: "mysql",
    host: "19.15.66.46",
    port: 13302,
    username: "beiruan",
    password: "Bd<Uti#2020",
    database: "lptdatashare",
    synchronize: false,
    logging: false,
    entities: [ThemeBaseDataVolume, FrontEndDataVolume, DataLakeDataVolume, ThemeBaseDataSourceCaseVolume,OdsDataVolume],
    migrations: [],
    subscribers: [],
})
