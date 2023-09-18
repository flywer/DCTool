import {DataSource} from "typeorm";

export const ShareSource = new DataSource({
    type: "mysql",
    host: "19.15.66.46",
    port: 13302,
    username: "beiruan",
    password: "Bd<Uti#2020",
    database: "xzzf_ztk_gxk",
    synchronize: false,
    logging: false,
    entities: [],
    migrations: [],
    subscribers: [],
})
