import {Scheduler, Task} from "@common/taskSchedulerTypes";
import {Result} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {ipcInstance} from "@render/plugins";

export const get_scheduler = async (): Promise<Scheduler> => {
    const {data} = await ipcInstance.send(channels.taskScheduler.getScheduler)
    return data
}

export const save_task = async (task: Task): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.taskScheduler.saveTask, JSON.stringify(task))
    return data
}

export const get_task = async (id: string): Promise<Task> => {
    const {data} = await ipcInstance.send(channels.taskScheduler.getTask, id)
    return data
}

export const task_delete = async (id: string): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.taskScheduler.taskDelete, id)
    return data
}

export const task_enable = async (taskId: string, enable: boolean): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.taskScheduler.taskEnable, taskId, enable)
    return data
}

export const task_run = async (task: Task): Promise<Result> => {
    const {data} = await ipcInstance.send(channels.taskScheduler.taskRun, JSON.stringify(task))
    return data
}
