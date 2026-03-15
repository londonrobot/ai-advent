const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');
const messageHandler = require('./handlers/messageHandler');

// Enable polling; can be tuned if network is flaky
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {
  polling: { interval: 1000, params: { timeout: 50 } },
});

// Register bot commands so they appear in the Telegram UI
bot.setMyCommands([
  { command: 'direct', description: 'Прямой ответ на логическую задачу' },
  { command: 'step', description: 'Решение шаг за шагом' },
  { command: 'prompt', description: 'Сгенерировать лучший промпт и решить' },
  { command: 'experts', description: 'Мнения экспертов и финальный ответ' },
]);

bot.on('message', messageHandler(bot));

module.exports = bot;