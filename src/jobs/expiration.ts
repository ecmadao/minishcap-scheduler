import { IScheduleJob } from './interfaces'

export const job: IScheduleJob = {
    name: 'remove expired links',
    crontab: '* * * * * *',
    task: async () => {
        await Promise.resolve(1)
    },
}
