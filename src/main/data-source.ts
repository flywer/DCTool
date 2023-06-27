import "reflect-metadata"
import {Dict} from "@main/entity/Dict";
import {JobJson} from "@main/entity/JobJson";
import {PreDatabase} from "@main/entity/PreDatabase";
import {TableSql} from "@main/entity/TableSql";
import {DataSource} from "typeorm"
import {ProjectInfo} from "./entity/ProjectInfo"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "192.168.1.93",
    port: 3306,
    username: "root",
    password: "Beidas0ft",
    database: "ap_dev_sjzt",
    synchronize: false,
    logging: false,
    entities: [ProjectInfo, Dict, TableSql, JobJson,PreDatabase],
    migrations: [],
    subscribers: [],
})
