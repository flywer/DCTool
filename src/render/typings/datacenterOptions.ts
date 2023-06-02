// 项目
import {get_datasource_list, get_job_project_list, get_person_list} from "@render/api/datacenter";
import {SelectGroupOption, SelectOption} from "naive-ui";

export let projectIdOptions: Array<SelectOption | SelectGroupOption> = (await get_job_project_list())?.map(
    (v => ({
        label: v.name,
        value: v.id.toString()
    }))
) || []

export const projectIdOptionsUpdate = async () => {
    projectIdOptions = (await get_job_project_list())?.map(
        (v => ({
            label: v.name,
            value: v.id.toString()
        }))
    ) || []
}

// 负责人
export const personIdOptions: Array<SelectOption | SelectGroupOption> = (await get_person_list())?.map(
    (v => ({
        label: `${v.name}(${v.username})`,
        value: v.id
    }))
) || []

export const datasourceOptions: Array<SelectOption | SelectGroupOption> = (await get_datasource_list(1, 100))?.map(
    (v => ({
        label: v.datasourceName,
        value: v.id.toString(),
        datasource: v.datasource
    }))
) || []
