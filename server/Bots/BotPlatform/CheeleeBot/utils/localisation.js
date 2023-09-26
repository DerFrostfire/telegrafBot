export class LocalisationObject {
    constructor(_id) {
        this._id = _id
        this.fetchLocalisation()
        const interval = Meteor.setInterval(() => {
            this.fetchLocalisation()
        }, 1000 * 60 * 5)
        // Graceful shutdown
        process.once('SIGINT', () => Meteor.clearInterval(interval))
        process.once('SIGTERM', () => Meteor.clearInterval(interval))
    }

    fetchLocalisation() {
        this.loc = Localisations.findOne(this._id)
    }

    _(key, ...args) {
        let txt = this.loc?.[key] || CheeleeLocale[key] || key
        // find {} and replace with args
        for (const arg of args) {
            txt = txt.replace(/\{[a-zA-Z._]*}/, arg)
        }
        return txt
    }
}
