import { BaseScene, Context, Markup } from 'telegraf'
import { sleep } from '../utils/sleep'

const start = new BaseScene('start')

const startKeyboard = (ctx) => {
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.loc._('BTN_START'), 'start')],
    ])
}

start.enter(async (ctx) => {
    await ctx.replyWithHTML(ctx.loc._('WELCOME_PHRASE'))
    
    await BotUsers.update(
        { id: ctx.from.id },
        { $set: { pushSet: Date.now() }
    })
    
    if (ctx.loc._('WELCOME_VIDEO') !== 'WELCOME_VIDEO') {
        const welcomeRes = await ctx.replyWithVideo(
            await ctx.fileId.getFileId(ctx.loc._('WELCOME_VIDEO')),
            {
                reply_markup: startKeyboard(ctx),
                caption: ctx.loc._('AGREEMENT_HTML'),
                parse_mode: 'HTML',
            }
        )
        await ctx.fileId.callbackFunction(
            welcomeRes,
            ctx.loc._('WELCOME_VIDEO'),
            'video'
        )
    } else {
        await ctx.reply(
            ctx.loc._('AGREEMENT_HTML'),
            {
                reply_markup: startKeyboard(ctx),
                parse_mode: 'HTML'
            }
        )
    }
})

start.action('start', async (ctx) => {
    try {
        await ctx.deleteMessage()
    } catch (e) {}

    await ctx.replyWithHTML(ctx.loc._('INTRODUCTORY_INF'))

    await ctx.scene.enter('viewing')
})

start.action('continue', async (ctx) => {
    await BotUsers.update(
        { id: ctx.from.id },
        { $set: { pushSet:  Date.now() }
    })

    const sub = await ctx.channel.isSubscribed(ctx)
    const user = await BotUsers.findOne({id:ctx.session.id})
    if (sub){
        const new_balance = user.balance + 300
        await BotUsers.update(
            { id: ctx.from.id },
            { $set: { balance: new_balance, pushSet: false } },
            )
        await ctx.replyWithHTML(ctx.loc._('ERROR_MSG_СONTINUE', new_balance, ctx.session.queue))
    }
    else{
        const pushError = await ctx.replyWithHTML(ctx.loc._('STOP_UNSUB',  ctx.channel.link))
        await sleep(6_000)
        try {
            await ctx.deleteMessage(pushError.message_id)
        } catch (e) {}  
    }
})

export default start
