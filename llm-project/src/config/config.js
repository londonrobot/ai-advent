require('dotenv').config();

// Unified LLM config supporting Groq (OpenAI-compatible) and OpenAI
const isGroqEnv = !!process.env.GROQ_API_KEY || (process.env.LLM_BASE_URL || '').includes('groq.com');

const LLM_API_KEY = process.env.LLM_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

const defaultBaseUrl = isGroqEnv ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1';
const LLM_BASE_URL = process.env.LLM_BASE_URL || process.env.GROQ_BASE_URL || process.env.OPENAI_BASE_URL || defaultBaseUrl;

const defaultModel = (LLM_BASE_URL.includes('groq.com') || !!process.env.GROQ_API_KEY)
  ? (process.env.GROQ_MODEL || 'llama-3.1-8b-instant')
  : (process.env.OPENAI_MODEL || 'gpt-3.5-turbo');
const LLM_MODEL = process.env.LLM_MODEL || defaultModel;

const config = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  // Unified values used by the service layer
  LLM_API_KEY,
  LLM_BASE_URL,
  LLM_MODEL,
};

module.exports = config;

