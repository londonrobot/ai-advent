const path = require('path');
const dotenv = require('dotenv');

// Load .env strictly from this project (05-advent/.env)
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Strict OpenAI-only config per your request
// - Base URL: fixed to api.openai.com
// - API Key: from API_KEY only
// - Telegram token: from TELEGRAM_BOT_TOKEN
// - Default model only used as fallback by service layer (UI выбирает фактическую модель)
const LLM_API_KEY = (process.env.API_KEY || '').trim();
const LLM_BASE_URL = 'https://api.openai.com/v1';
const LLM_MODEL = 'gpt-4o-mini';

const config = {
  TELEGRAM_BOT_TOKEN: (process.env.TELEGRAM_BOT_TOKEN || '').trim(),
  LLM_API_KEY,
  LLM_BASE_URL,
  LLM_MODEL,
};

module.exports = config;



