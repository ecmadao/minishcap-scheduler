export interface IScheduleJob {
    name: string
    crontab: string
    task: () => Promise<void>
}
