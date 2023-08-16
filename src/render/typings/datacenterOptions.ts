// 项目
import {get_datasource_list, get_job_project_list_all, get_person_list} from "@render/api/datacenter";
import {SelectGroupOption, SelectOption} from "naive-ui";

const customSort = (a: any, b: any) => {
    // Check if both strings start with '广东省'
    const startsWithGuangDongA = a.name.startsWith('广东省');
    const startsWithGuangDongB = b.name.startsWith('广东省');

    if (startsWithGuangDongA && !startsWithGuangDongB) {
        return -1; // Move `a` before `b`
    } else if (!startsWithGuangDongA && startsWithGuangDongB) {
        return 1; // Move `b` before `a`
    } else {
        // Both start with '广东省' or don't start with it
        return a.name.localeCompare(b.name);
    }
};

export let projectIdOptions: Array<SelectOption | SelectGroupOption> = (await get_job_project_list_all())?.sort(customSort).map(
    (v => ({
        label: v.name,
        value: v.id.toString()
    }))
) || []

export const projectIdOptionsUpdate = async () => {
    projectIdOptions = (await get_job_project_list_all())?.sort(customSort).map(
        (v => ({
            label: v.name,
            value: v.id.toString()
        }))
    ) || []
}

// 负责人
export let personIdOptions: Array<SelectOption | SelectGroupOption> = (await get_person_list())?.map(
    (v => ({
        label: `${v.name}(${v.username})`,
        value: v.id
    }))
) || []

export const personIdOptionsUpdate = async () => {
    personIdOptions = (await get_person_list())?.map(
        (v => ({
            label: `${v.name}(${v.username})`,
            value: v.id
        }))
    ) || []
}

export let datasourceOptions: Array<SelectOption | SelectGroupOption> = (await get_datasource_list(1, 100))?.map(
    (v => ({
        label: v.datasourceName,
        value: v.id.toString(),
        datasource: v.datasource
    }))
) || []

export const datasourceOptionsUpdate = async () => {
    datasourceOptions = (await get_datasource_list(1, 100))?.map(
        (v => ({
            label: v.datasourceName,
            value: v.id.toString(),
            datasource: v.datasource
        }))
    ) || []
}
