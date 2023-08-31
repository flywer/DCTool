import "reflect-metadata"
import {ActivationKey} from "@main/entity/ActivationKey";
import {Dict} from "@main/entity/Dict";
import {GdsztkDict} from "@main/entity/GdsztkDict";
import {JobDetail} from "@main/entity/JobDetail";
import {JobJson} from "@main/entity/JobJson";
import {PreDatabase} from "@main/entity/PreDatabase";
import {ProjectJobDependency} from "@main/entity/ProjectJobDependency";
import {TableSql} from "@main/entity/TableSql";
import {User} from "@main/entity/User";
import {DataSource} from "typeorm"
import {ProjectInfo} from "../entity/ProjectInfo"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "19.15.66.46",
    port: 13302,
    username: "beiruan",
    password: "Bd<Uti#2020",
    database: "dc_tool_test",
    synchronize: false,
    logging: false,
    entities: [
        ProjectInfo,
        Dict,
        TableSql,
        JobJson,
        PreDatabase,
        GdsztkDict,
        User,
        ActivationKey,
        JobDetail,
        ProjectJobDependency
    ],
    migrations: [],
    subscribers: [],
})
