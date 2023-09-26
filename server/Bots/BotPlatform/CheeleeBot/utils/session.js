const getSessionKey = ({ from }, botObject) => {
    const bot = botObject._id
    if (from == null) {
        return null
    }

    return { id: from.id, bot }
}
export const session = (botObject) => {
    const collection = BotUsers
    const saveSession = (key, data) =>
        collection.update(key, { $set: { data } }, { upsert: true })
    const getSession = async (key) =>
        (await collection.findOne(key))?.data ?? {}

    return async (ctx, next) => {
        const key = getSessionKey(ctx, botObject)
        const data = key == null ? undefined : await getSession(key)

        ctx.session = data

        await next()

        if (ctx.session != null) {
            await saveSession(key, ctx.session)
        }
    }
}
