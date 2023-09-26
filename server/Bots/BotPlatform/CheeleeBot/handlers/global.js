import { Composer, session } from 'telegraf'
let globalBot = new Composer()


globalBot.start(async (ctx) => {
    if (ctx.session.start) {
    } else {
        await BotUsers.update(
            { id: ctx.from.id, bot: ctx.botObject._id, balance: 0, invited_users: []},
            { $set: {id: ctx.from.id, bot: ctx.botObject._id, balance: 0, invited_users: []} },
            { upsert: true }
        )
        ctx.session = {
            ...ctx.session,
            ...ctx.from,
            seenVideos: [],
            balance: 0,
            queue: 2002,
            viewCounter: 0,
            profile: [],
        }
        const inviter = parseInt(ctx.message.text.split(' ')[1])
        
        if(inviter && inviter !== ctx.session.id){
            const user = await BotUsers.findOne({id:inviter})
            if(user){
                const new_balance = user.balance + 100
                let new_invited_users = user.invited_users || []

                new_invited_users.push(ctx.session.id)
                await BotUsers.update(
                    {id: inviter},
                    {$set: {balance: new_balance, invited_users: new_invited_users}},
                    { upsert: false }
                )
            }
        }
    ctx.session.start = true
    await ctx.scene.enter('start')
    }
})

export default globalBot
