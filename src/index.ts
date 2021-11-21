import { scheduleJob } from 'node-schedule'
import { logger } from './utils/logger'
import { job as expirationJob } from './jobs/expiration'

const exec = () => {
    scheduleJob(expirationJob.name, expirationJob.crontab, async (fireDate) => {
        logger.info(`[Job][${expirationJob.name}] execeed at ${fireDate}`)

        try {
            await expirationJob.task()
            logger.info(`[Job][${expirationJob.name}] finished at ${fireDate}`)
        } catch (err) {
            logger.error(`[Job][${expirationJob.name}] failed with error ${err}`)
        }
    })
}

exec()
