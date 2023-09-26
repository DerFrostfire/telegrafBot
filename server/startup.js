import { setupCheeleeBot } from "./Bots/BotPlatform/CheeleeBot";

BotsPool = {}; // {botId: bot}

const STORAGE_PATH =
    Meteor.absolutePath + '/.utils/storageItems'

StorageItems = new FilesCollection({
    collectionName: 'storageItems',
    allowClientCode: true,
    onBeforeUpload() {
        return true
    },
    storagePath: STORAGE_PATH 
})

Meteor.startup(async function () {

    Bots.remove({})
    Localisations.remove({})
    TelegramChannels.remove({})
    SmartLink.remove({})
    BotUsers.remove({})
    // StorageItems.remove({})

    //Создаем тестовую локализацию
    const insertedLocaleId = Localisations.insert({
        name: 'Test',
        ...CheeleeLocale
    })
    // Создаем тестовый канал
    const insertedChannelId = TelegramChannels.insert({
        title: 'Test channel',
        link: '',
        channelId: '',
    })
    // Создаем тестового бота
    const bot = {
        token: '',
        username: 'CheeleeioBot',
        locale: insertedLocaleId,
        channel: insertedChannelId,
    }
    bot._id = Bots.insert(bot)
    
    BotsPool[bot._id] = await setupCheeleeBot(bot)
    

    // Если бот уже создан, использовать вместо строки выше:

    // const bot = Bots.findOne()
    // BotsPool[bot._id] = await setupCheeleeBot(bot)

   SyncedCron.start()
})
