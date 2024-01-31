import {Controller, IpcHandle} from "einf";
import {channels} from "@render/api/channels";
import {LocalCacheSource} from "@main/dataSource/localCache-source";
import {JobTableItemCache} from "@main/entity/localCache/JobTableItem";
import {Job} from "@common/types/jobMgt";
import log from "electron-log";

@Controller()
export class JobTableItemCacheController {
    constructor() {
    }

    @IpcHandle(channels.localCache.jobTableItem.fetchByTreeNodeKey)
    public handleFetchByTreeNodeKey(key: string) {
        return LocalCacheSource.getRepository(JobTableItemCache).findBy({
            treeNodeKey: key
        })
    }

    @IpcHandle(channels.localCache.jobTableItem.save)
    public async handleSave(treeNodeKey: string, jobStr: string) {
        const jobs = JSON.parse(jobStr) as Job[]
        try {
            for (const job of jobs) {
                const item = await LocalCacheSource.getRepository(JobTableItemCache).findOneBy({jobName: job.jobName})

                if (item) {
                    await LocalCacheSource.getRepository(JobTableItemCache).createQueryBuilder()
                        .update()
                        .set({
                            job: JSON.stringify(job),
                            updateTime: new Date(),
                        })
                        .where("treeNodeKey = :treeNodeKey AND jobName = :jobName", {
                            treeNodeKey: treeNodeKey,
                            jobName: job.jobName
                        })
                        .execute()
                } else {
                    await LocalCacheSource.getRepository(JobTableItemCache).createQueryBuilder()
                        .insert()
                        .into(JobTableItemCache)
                        .values([{
                            treeNodeKey: treeNodeKey,
                            jobId: job.id,
                            jobName: job.jobName,
                            jobType: job.type,
                            job: JSON.stringify(job),
                            createTime: new Date(),
                            updateTime: new Date(),
                        }])
                        .execute()
                }
            }
        } catch (e) {
            log.error(e)
        }
    }

}
