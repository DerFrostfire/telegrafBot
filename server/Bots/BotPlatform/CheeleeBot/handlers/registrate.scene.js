import { BaseScene } from 'telegraf'
import { sleep } from '../utils/sleep'


const registrate = new BaseScene('registrate')

registrate.enter(async ctx => {
    await ctx.replyWithHTML(ctx.loc._('WARMING_UP'))

    await sleep(500)

    await BotUsers.update(
        { id: ctx.from.id },
        { $set: { regSet: Date.now(), pushSet:  Date.now() }
    })
    await ctx.reply(ctx.loc._('YOUR_FIRSTNAME'))
})

registrate.on('text', async ctx =>{

    await BotUsers.update(
        { id: ctx.from.id },
        { $set: { regSet: Date.now(), pushSet:  Date.now() }
    })
    
    const messageText = ctx.message.text
    if(ctx.session.profile.length === 0){
        
        ctx.session.profile.push(messageText)
        await ctx.reply(ctx.loc._('YOUR_LASTNAME'))
        return
    }

    if(ctx.session.profile.length === 1) {
        ctx.session.profile.push(messageText)
        await ctx.reply(ctx.loc._('YOUR_LOGIN'))
        return
    }
    if(ctx.session.profile.length === 2) {
        if (messageText.length >= 3) {
            ctx.session.profile.push(messageText)
        }
        else {
            await ctx.reply(ctx.loc._('LOGIN_LONGER'))
        }
    }
    
    if(ctx.session.profile.length >= 3){
        BotUsers.update(
            { id: ctx.from.id },
            { $set: { regSet: false }
        })
        await ctx.scene.enter('partners')
    }
})

registrate.action('continue', async (ctx) => {
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
            { $set: { balance: new_balance, pushSet: false, regSet:false } },
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

registrate.action('skip', async (ctx) => {
    BotUsers.update(
        { id: ctx.from.id },
        { $set: { regSet: false }
    })
    ctx.scene.enter('partners')
})

export default registrate