// 项目
import {get_job_project_list, get_person_list} from "@render/api/datacenter";
import {SelectGroupOption, SelectOption} from "naive-ui";
import pinyin from "pinyin";

export let projectIdOptions: Array<SelectOption | SelectGroupOption> = (await get_job_project_list()).map(
    (v => ({
        label: v.name,
        value: v.id.toString(),
        abbr: pinyin(v.name.replaceAll(/广东/g, '').replaceAll(/数据归集/g, ''), {
            style: pinyin.STYLE_FIRST_LETTER,
        }).join('')
    }))
)

// 负责人
export let personIdOptions: Array<SelectOption | SelectGroupOption> = (await get_person_list()).map(
    (v => ({
        label: `${v.name}(${v.username})`,
        value: v.id
    }))
)
