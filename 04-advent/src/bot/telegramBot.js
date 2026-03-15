const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');
const messageHandler = require('./handlers/messageHandler');

// Enable polling; can be tuned if network is flaky
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {
  polling: { interval: 1000, params: { timeout: 50 } },
});

// Commands menu placeholder (kept for future use). Currently empty to avoid cluttering the UI.
bot.setMyCommands([]);

bot.on('message', messageHandler(bot));

module.exports = bot;