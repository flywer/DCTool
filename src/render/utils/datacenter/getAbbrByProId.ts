import {find_by_project_id} from "@render/api/auxiliaryDb.api";

export const getAbbrByProId = async (projectId: string) => {
    let projectAbbr = ''
    let tableAbbr = ''
    if (projectId === '') {
        return {
            projectAbbr,
            tableAbbr
        }
    }

    let project = await find_by_project_id(projectId)

    if (project != null) {
        projectAbbr = project?.projectAbbr || ''
        tableAbbr = project?.tableAbbr || ''
    }

    return {
        projectAbbr,
        tableAbbr
    }
}
