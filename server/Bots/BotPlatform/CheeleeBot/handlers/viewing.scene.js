import { BaseScene, Markup } from 'telegraf'
import { sleep } from '../utils/sleep'


const viewing = new BaseScene('viewing')

const viewKeyboard = (ctx) => {
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.loc._('BTN_VIEWED'), 'viewed')],
        [Markup.callbackButton(ctx.loc._('BTN_REG'), 'registrate')],
    ])
}

const stopKeyboard = (ctx) => {
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.loc._('BTN_REG'), 'registrate')]
    ])
}
const sendVideo = async (ctx) =>{
    const videos = ctx.loc._('VIDEOS').split(',')
    const filteredVideos = videos.filter(
        (video) => !ctx.session.seenVideos.includes(video)
    )
    const randomVideo =
        filteredVideos[Math.floor(Math.random() * filteredVideos.length)]
    ctx.session.seenVideos.push(randomVideo)

    const videoRes = await ctx.replyWithVideo(
        await ctx.fileId.getFileId(randomVideo),
        {
            reply_markup: viewKeyboard(ctx),
        }
    )
    await ctx.fileId.callbackFunction(
        videoRes,
        randomVideo,
        'video'
    )

}

viewing.enter(async (ctx) => {
    await BotUsers.update(
        { id: ctx.from.id },
        { $set: { pushSet: Date.now(), regSet: Date.now() }
    })
    await sendVideo(ctx)
    ctx.session.balance += 5
    ctx.session.viewCounter++
    
})

viewing.action('viewed', async (ctx) => {
  
    await BotUsers.update(
        { id: ctx.from.id },
        { $set: { balance: ctx.session.balance, pushSet: Date.now(), regSet: Date.now() } },
        { upsert: true }
    )
    
    const videos_left = 5 - ctx.session.viewCounter

    await ctx.replyWithHTML(ctx.loc._('VIEW_EARNING', ctx.session.balance, videos_left))
    await sleep(10_000)
    if(ctx.session.viewCounter >= 5){
        await ctx.replyWithHTML(ctx.loc._('AFTER_FIVE_VIEWS', ctx.session.balance),
        {
            reply_markup: stopKeyboard(ctx),
        })
        
        await sleep(1_000)
        return
    }
    await sendVideo(ctx)

    ctx.session.balance += 5
    ctx.session.viewCounter++
    
})

viewing.action('registrate', async (ctx) => {
    //await ctx.editMessageReplyMarkup(stopKeyboard(ctx))
    await ctx.scene.enter('registrate')
})

viewing.action('continue', async (ctx) => {
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
            { $set: { balance: new_balance, pushSet: false, regSet: false } },
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

viewing.action('skip', async (ctx) => {
    BotUsers.update(
        { id: ctx.from.id },
        { $set: { regSet: false }
    })
    ctx.scene.enter('partners')
})

export default viewing