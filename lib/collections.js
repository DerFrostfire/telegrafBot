/**
 * Боты системы
 * @type {Mongo.Collection}
 */
Bots = new Mongo.Collection('bots')

/**
 * Пользователи ботов
 * @type {Mongo.Collection}
 */
BotUsers = new Mongo.Collection('botUsers')

/**
 * Локализации ботов
 * @type {Mongo.Collection}
 */
Localisations = new Mongo.Collection('localisations')

/**
 * Telegram каналы
 * @type {Mongo.Collection}
 */
TelegramChannels = new Mongo.Collection('telegramChannels')

/**
 * Умные ссылки
 * @type {Mongo.Collection}
 */
SmartLink = new Mongo.Collection('smartLink')
