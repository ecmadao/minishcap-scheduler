import { scheduleJob } from 'node-schedule'
import { logger } from './utils/logger'
import { job as expirationJob } from './jobs/expiration'

const exec = () => {
    scheduleJob(expirationJob.name, expirationJob.crontab, async (fireDate) => {
        logger.info(`[Job][${expirationJob.name}] execeed at ${fireDate}`)
        await expirationJob.task()
    })
}

exec()
