import globalBot from './global'
import { Stage } from 'telegraf'
import start from './start.scene'
import partnersScene from './partners.scene'
import registrate from './registrate.scene'
import viewing from './viewing.scene'

export default (bot) => {
    const stage = new Stage(
        [start, viewing, registrate, partnersScene],
        {
            ttl: 604_800,
        }
    )
    bot.use(stage.middleware())
    bot.use(globalBot)
}

