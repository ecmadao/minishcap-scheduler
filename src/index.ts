import { scheduleJob } from 'node-schedule'
import { logger } from './utils/logger'
import { job as expirationJob } from './jobs/expiration'
import { cache } from './utils/cache'

const exec = () => {
    scheduleJob(expirationJob.name, expirationJob.crontab, async (fireDate) => {
        logger.info(`[Job][${expirationJob.name}] execeed at ${fireDate}`)

        const status: number = await cache.get(expirationJob.name)
        if (status === 1) {
            logger.info(`[Job][${expirationJob.name}] is running`)
            return
        }

        await cache.set(expirationJob.name, 1, { ttl: expirationJob.ttlInSeconds })

        try {
            await expirationJob.task()
            logger.info(`[Job][${expirationJob.name}] finished at ${new Date()}`)
        } catch (err) {
            logger.error(`[Job][${expirationJob.name}] failed with error ${err}`)
        }
        await cache.del(expirationJob.name)
    })
}

exec()
