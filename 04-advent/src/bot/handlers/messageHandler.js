const openAIService = require('../../services/openAIService');
const config = require('../../config/config');

const START_COMMAND = '/start';

// Split long text into Telegram-friendly chunks (<= ~4096 chars)
function splitForTelegram(text, maxLen = 4000) {
  const chunks = [];
  let remaining = text || '';
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    // Prefer breaking at newline, then at space, else hard cut
    let cut = remaining.lastIndexOf('\n', maxLen);
    if (cut <= 0) cut = remaining.lastIndexOf(' ', maxLen);
    if (cut <= 0) cut = maxLen;

    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).replace(/^\s+/, '');
  }
  return chunks;
}

const messageHandler = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = (msg.text || '').trim();

  try {
    if (userMessage === START_COMMAND) {
      await bot.sendMessage(chatId, 'Привет! Я чат-бот. Напишите сообщение, и я отвечу.');
      return;
    }

    if (!userMessage) return;

    await bot.sendChatAction(chatId, 'typing');

    // Run the same prompt with three temperatures in parallel
    // Add a concise-length system instruction so the model plans a shorter answer within max_tokens
    const conciseInstruction = `Отвечай кратко и по делу. Уложись примерно в ${config.LLM_MAX_TOKENS} токенов (короткий ответ, без длинных списков).`;
    const messages = [
      { role: 'system', content: conciseInstruction },
      { role: 'user', content: userMessage },
    ];
    const temps = [0, 0.7, 1.2];

    const requests = temps.map((t) => openAIService.chatCompletion(messages, { temperature: t, max_tokens: config.LLM_MAX_TOKENS }));
    const results = await Promise.allSettled(requests);

    // Build a single response text with clear labels and separators
    const blocks = results.map((res, idx) => {
      const label = `temperature = ${temps[idx]}`;
      if (res.status === 'fulfilled') {
        const text = res.value?.content ?? '';
        return `${label}\n${text}`;
      } else {
        const status = res.reason?.response?.status;
        const errMsg = status ? `Ошибка API (${status})` : `Ошибка: ${res.reason?.message || 'неизвестная ошибка'}`;
        return `${label}\n${errMsg}`;
      }
    });

    const separator = '\n--------------------\n';
    const finalText = blocks.join(separator);

    // Ensure we respect Telegram message length limits by chunking
    const parts = splitForTelegram(finalText, 4000);
    for (const part of parts) {
      await bot.sendMessage(chatId, part);
    }
  } catch (error) {
    console.error('Error while processing message:', error);
    await bot.sendMessage(chatId, 'Что-то пошло не так. Пожалуйста, попробуйте снова.');
  }
};

module.exports = messageHandler;