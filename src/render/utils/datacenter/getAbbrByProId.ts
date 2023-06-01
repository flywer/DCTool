import {find_by_project_id} from "@render/api/auxiliaryDb";
import {get_job_project_list} from "@render/api/datacenter";
import pinyin from "pinyin";

export const getAbbrByProId = async (projectId: string) => {
    let project = await find_by_project_id(projectId)
    let projectAbbr = ''
    let tableAbbr = ''

    if (project == null) {
        const project1 = (await get_job_project_list()).find(project => project.id == projectId)
        projectAbbr = pinyin(
            project1.name.replaceAll(/行政行为/g, 'xzxw')
                .replaceAll(/数据归集/g, '')
                .replaceAll(/广东/g, '')
            , {
                style: pinyin.STYLE_FIRST_LETTER,
            }).join('')
        tableAbbr = pinyin(
            project1.name.replaceAll(/行政行为/g, '')
                .replaceAll(/数据归集/g, '')
                .replaceAll(/广东/g, '')
            , {
                style: pinyin.STYLE_FIRST_LETTER,
            }).join('')
    } else {
        projectAbbr = project?.projectAbbr || pinyin(
            project.projectName.replaceAll(/行政行为/g, 'xzxw')
                .replaceAll(/数据归集/g, '')
                .replaceAll(/广东/g, '')
            , {
                style: pinyin.STYLE_FIRST_LETTER,
            }).join('')
        tableAbbr = project?.projectAbbr || pinyin(
            project.projectName.replaceAll(/行政行为/g, 'xzxw')
                .replaceAll(/数据归集/g, '')
                .replaceAll(/广东/g, '')
            , {
                style: pinyin.STYLE_FIRST_LETTER,
            }).join('')
    }

    return {
        projectAbbr,
        tableAbbr
    }
}
