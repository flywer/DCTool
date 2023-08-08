import "reflect-metadata"
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
    entities: [],
    migrations: [],
    subscribers: [],
})
