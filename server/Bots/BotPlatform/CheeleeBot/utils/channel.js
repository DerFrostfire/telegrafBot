// Файл можно изменять, это не shared code
export class ChannelObject {
    constructor(_id) {
        this._id = _id
        this.fetchChannel()
        const interval = Meteor.setInterval(() => {
            this.fetchChannel()
        }, 1000 * 60 * 5)
        // Graceful shutdown
        process.once('SIGINT', () => Meteor.clearInterval(interval))
        process.once('SIGTERM', () => Meteor.clearInterval(interval))
    }

    fetchChannel() {
        this.channel = TelegramChannels.findOne(this._id)
    }

    get title() {
        return this.channel?.title
    }

    get link() {
        return this.channel?.link
    }

    get telegramId() {
        return this.channel?.channelId
    }

    async isSubscribed(ctx) {
        const { id } = ctx.from
        try {
            const res = await ctx.telegram.getChatMember(this.telegramId, id)
            return res.status !== 'left'
        } catch (e) {
            console.log(e)
            return false
        }
    }
}
