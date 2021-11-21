import { FindCursor, WithId } from 'mongodb'
import { config } from '../config'
import { logger } from '../utils/logger'
import { getRedis } from '../utils/redis'
import { IShortLink } from '../utils/models'
import { IScheduleJob } from './interfaces'
import { getMongo, Collections } from '../utils/mongo'

const AVAILABLE_IDS = 'availableIds'

const clean = async () => {
    const db = await getMongo(config.storage.mongo)
    const redis = getRedis()

    const subscriber: FindCursor<WithId<IShortLink>> = db.collection(Collections.Urls)
        .find<IShortLink>({
            expiredAt: {
                $exists: true,
                $lte: new Date(),
            },
        }).limit(100)

    let hasNext = await subscriber.hasNext()
    while (hasNext) {
        const shortlink: IShortLink = await subscriber.next()
        logger.debug(`Short link ${shortlink.id} is expired at ${shortlink.expiredAt}`)

        try {
            await db.collection(Collections.Urls).deleteOne({
                id: shortlink.id,
            })
            await redis.sadd(AVAILABLE_IDS, shortlink.id)
            logger.debug(`Short link ${shortlink.id} is released`)
        } catch (err) {
            logger.error(`Release short link ${shortlink.id} failed with error ${err}`)
        }

        hasNext = await subscriber.hasNext()
    }
}

export const job: IScheduleJob = {
    name: 'remove expired links',
    crontab: '* * * * * *',
    ttlInSeconds: 10 * 60,
    task: clean,
}
