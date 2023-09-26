import Telegraf, { Context } from 'telegraf'
import handlers from './handlers'
import { session } from './utils/session'
import { LocalisationObject } from './utils/localisation'
import { FileIdService } from './utils/fileId'
import { ChannelObject } from './utils/channel'
import { Markup } from "telegraf";

export const setupCheeleeBot = async (botObject) => {
    const { _id, token, locale, channel } = botObject

    const bot = new Telegraf(token)
    
    // DB-driven session
    bot.use(session(botObject))

    // Bot object (обязательно)
    bot.context.botObject = botObject

    // Localisation (обязательно)
    bot.context.loc = new LocalisationObject(locale)

    // FileId service (если нужно)
    bot.context.fileId = new FileIdService(botObject)

    // Channel (обязательно)
    bot.context.channel = new ChannelObject(channel)
    
   
    // Сцены и хэндлеры
    try {
        handlers(bot)
    } catch (e) {
        console.error(e)
    }

    // Запуск серверных роутов для вебхука
    WebApp.connectHandlers.use(bot.webhookCallback(`/core/${_id}`))

    if (Meteor.isProduction) {
        // Если продакшн, то запускаем вебхук
        await bot.telegram.setWebhook(
            `${process.env.BOT_URL}/core/${_id}`,
            undefined,
            20,
            ['message', 'callback_query']
        )
        await bot.startWebhook(`${process.env.BOT_URL}/core/${_id}`)
    } else {
        // Если не продакшн, то запускаем поллинг
        await bot.telegram.deleteWebhook()
        await bot.startPolling()
    }
    SyncedCron.add({
        name: `sendPushOfBot ${_id}`,
        schedule: function(parser) {
            return parser.text('every 10 minutes');
        },
        job: function() {
            const user = BotUsers.fetch({
                bot:_id, 
                $or : [
                    {pushSet: {$gte: Date.now() - 60 * 60 * 1000}},
                    {regSet: {$gte: Date.now() - 20 * 60 * 1000}},
                    ]
                })
            if(user){
                if(user.pushSet && (Date.now() - user.pushSet) >= 60 * 60 * 1000){
                    BotsPool[_id].telegram.sendMessage(
                        user.id, bot.context.loc._('CONTINUE_REG', 2002), 
                        { 
                            reply_markup: Markup.inlineKeyboard([
                            [Markup.callbackButton(bot.context.loc._('BTN_CONTINUE'), 'continue')],
                            [Markup.urlButton(bot.context.loc._('BTN_SUB'), TelegramChannels.findOne({_id: channel}).link)],
                        ]),
                            parse_mode:'HTML'
                        }
                    )
                }
                if(user.regSet && (Date.now() - user.regSet) >= 20 * 60 * 1000){
                    BotsPool[_id].telegram.sendMessage(
                        user.id, bot.context.loc._('REG_SKIP'), 
                        { 
                            reply_markup: Markup.inlineKeyboard([
                                [Markup.callbackButton(bot.context.loc._('BTN_SKIP'), 'skip')],
                            ])
                        }
                    )
                }
            }
        }
      })
    // Возвращаем бота для дальнейших манипуляций
    return bot
}
