import "reflect-metadata"
import {ActivationKey} from "@main/entity/ActivationKey";
import {DepartCatalogHookRecord} from "@main/entity/DepartCatalogHookRecord";
import {Dict} from "@main/entity/Dict";
import {FEDepartTableName} from "@main/entity/FEDepartTableName";
import {FieldInspectionRule} from "@main/entity/jobTemplate/FieldInspectionRule";
import {GdsztkDict} from "@main/entity/GdsztkDict";
import {JobDetail} from "@main/entity/JobDetail";
import {JobJson} from "@main/entity/JobJson";
import {JobTemplate} from "@main/entity/jobTemplate/JobTemplate";
import {TemplateTableJobRel} from "@main/entity/jobTemplate/TemplateTableJobRel";
import {PreDatabase} from "@main/entity/PreDatabase";
import {ProjectJobDependency} from "@main/entity/ProjectJobDependency";
import {TableSql} from "@main/entity/TableSql";
import {TemplateStructTable} from "@main/entity/jobTemplate/TemplateStructTable";
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
        ProjectJobDependency,
        FEDepartTableName,
        JobTemplate,
        TemplateStructTable,
        FieldInspectionRule,
        TemplateTableJobRel,
        DepartCatalogHookRecord
    ],
    migrations: [],
    subscribers: [],
})
