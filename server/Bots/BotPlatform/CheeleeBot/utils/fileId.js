export class FileIdService {
    constructor(botObject) {
        this.botId = botObject._id
        this.storage = {}
    }

    async getFileId(fileId, filename) {
        if (this.storage[fileId]) return this.storage[fileId]
        const item = await StorageItems.findOne(fileId)
        if (!item)
            console.error('BotPlatform: FileIdService: File not found', {
                botId: this.botId,
                fileId,
                filename,
            })
        if (!item.fileId || !item.fileId?.[this.botId]) {
            return {
                source: item.path,
                filename,
            }
        } else {
            this.storage[fileId] = item.fileId[this.botId]
            return item.fileId[this.botId]
        }
    }

    async callbackFunction(sentMessage, fileId, typeOf) {
        await StorageItems.update(fileId, {
            $set: {
                [`fileId.${this.botId}`]: sentMessage?.[typeOf]?.file_id,
            },
        })
    }
}
