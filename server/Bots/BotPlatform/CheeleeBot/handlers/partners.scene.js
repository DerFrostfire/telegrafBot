import { BaseScene, Markup } from 'telegraf'
import { sleep } from '../utils/sleep'

const partnersScene = new BaseScene('partners')

const partnersKeyboard = (ctx) => {
    return Markup.inlineKeyboard([
        [Markup.urlButton(ctx.loc._('BTN_SUB'), ctx.channel.link)],
        [
            Markup.switchToChatButton(
                ctx.loc._('BTN_INVITE'),
                ctx.channel.link),
        ],
        [Markup.callbackButton(ctx.loc._('BTN_SUBED'), 'subed')],
    ])
}

const subedKeyboard = (ctx) => {
    return Markup.inlineKeyboard([
        [
            Markup.switchToChatButton(
                ctx.loc._('BTN_INVITE'),
                `https://t.me/${ctx.botObject.username}?start=${ctx.session.id}`
            ),
        ],
        [Markup.callbackButton(ctx.loc._('BTN_REFRESH'), 'refresh')]
    ])
}
partnersScene.enter(async (ctx) => {
    await BotUsers.update(
        { id: ctx.from.id },
        { $set: { pushSet: Date.now() }
    })
    await ctx.reply(
        ctx.loc._('SUB_PARTNER'),
        {
            parse_mode: 'HTML',
            reply_markup: partnersKeyboard(ctx),
        }
    )
})

partnersScene.action('subed', async (ctx) => {
    const sub = await ctx.channel.isSubscribed(ctx)
    
    if (sub){
        await BotUsers.update(
            { id: ctx.from.id },
            { $set: { pushSet: false } },
            )

        const user = await BotUsers.findOne({id:ctx.session.id})

        if(user.invited_users && user.invited_users.length)
        {
            ctx.reply(ctx.loc._('TROUBLE_MSG_INV', user.balance, ctx.session.queue), 
            {
                reply_markup: subedKeyboard(ctx),
                parse_mode:'HTML'
            })
        }
        else 
            ctx.replyWithHTML(ctx.loc._('TROUBLE_MSG',  ctx.session.queue))  
          
    }
    else{
        const pushError = await ctx.replyWithHTML(ctx.loc._('STOP_UNSUB', ctx.channel.link))
        await sleep(6_000)
        try {
            await ctx.deleteMessage(pushError.message_id)
        } catch (e) {}
    }
})

partnersScene.action('refresh', async ctx => {
    const user = await BotUsers.findOne({id:ctx.session.id})
    try{
        ctx.deleteMessage()
       
    }catch{}
    await ctx.reply(ctx.loc._('TROUBLE_MSG_INV', user.balance, ctx.session.queue), 
    {   
        reply_markup: subedKeyboard(ctx),
        parse_mode:'HTML',
    }
    )

})

partnersScene.action('continue', async (ctx) => {
    await BotUsers.update(
        { id: ctx.from.id },
        { $set: { pushSet: Date.now() } },
        { upsert: true }
    )
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
        const pushError = await ctx.replyWithHTML(ctx.loc._('STOP_UNSUB', ctx.channel.link))
        await sleep(6_000)
        try {
            await ctx.deleteMessage(pushError.message_id)
        } catch (e) {}  
    }
})

export default partnersScene
