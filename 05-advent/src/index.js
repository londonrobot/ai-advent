const config = require('./config/config');
const bot = require('./bot/telegramBot');

if (!config.TELEGRAM_BOT_TOKEN) {
  console.warn('[WARN] TELEGRAM_BOT_TOKEN is not set. Bot will not be able to start correctly.');
}
if (!config.LLM_API_KEY) {
  console.warn('[WARN] LLM_API_KEY is not set (try API_KEY, OPENAI_API_KEY, GROQ_API_KEY, or LLM_API_KEY in .env). LLM requests will fail.');
}
console.log(`Telegram bot is running... Using LLM base: ${config.LLM_BASE_URL}, default model: ${config.LLM_MODEL}`);