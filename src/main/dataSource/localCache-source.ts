import {DataSource} from "typeorm";
import {getAppDataPath} from "@main/utils/appPath";
import {join} from "path";
import {JobTableItemCache} from "@main/entity/localCache/JobTableItem";

export const LocalCacheSource = new DataSource({
    type: "sqlite",
    database: join(getAppDataPath(), '/cache/cache.dcbase'),
    synchronize: true,
    logging: false,
    entities: [JobTableItemCache]
})
