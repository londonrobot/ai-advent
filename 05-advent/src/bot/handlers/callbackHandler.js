const state = require('../../services/stateService');
const { getModelInfo, extractUsage, estimateTokensLocally, computeCost, formatMetricsLine } = require('../../services/metricsService');
const openAIService = require('../../services/openAIService');

const MODEL_KEYS = ['gpt5.2', 'gpt3.5', 'gpt4o'];

function buildKeyboard(selectedKey) {
  const label = (key, title) => (key === selectedKey ? `✅ ${title}` : title);
  return {
    inline_keyboard: [
      [
        { text: label('gpt5.2', 'gpt5.2'), callback_data: 'set_model:gpt5.2' },
        { text: label('gpt3.5', 'gpt3.5'), callback_data: 'set_model:gpt3.5' },
        { text: label('gpt4o', 'gpt4o'), callback_data: 'set_model:gpt4o' },
      ],
      [
        { text: 'Получить ответ', callback_data: 'get_answer' },
      ],
    ],
  };
}

const callbackHandler = (bot) => async (query) => {
  const chatId = query.message?.chat?.id;
  const messageId = query.message?.message_id;
  const data = query.data || '';
  if (!chatId || !messageId) return;

  try {
    if (data.startsWith('set_model:')) {
      const modelKey = data.split(':')[1];
      if (!MODEL_KEYS.includes(modelKey)) {
        await bot.answerCallbackQuery(query.id, { text: 'Неизвестная модель' });
        return;
      }
      const prevKey = state.getModel(chatId);
      if (prevKey === modelKey) {
        await bot.answerCallbackQuery(query.id, { text: `Модель уже выбрана: ${modelKey}`, show_alert: false });
        return;
      }
      state.setModel(chatId, modelKey);
      try {
        await bot.editMessageReplyMarkup(buildKeyboard(modelKey), { chat_id: chatId, message_id: messageId });
      } catch (e) {
        // Ignore Telegram 400 "message is not modified"
        if (e?.response?.body?.description?.includes('message is not modified')) {
          // no-op
        } else {
          throw e;
        }
      }
      await bot.answerCallbackQuery(query.id, { text: `Модель: ${modelKey}` });
      return;
    }

    if (data === 'get_answer') {
      const modelKey = state.getModel(chatId);
      const modelInfo = getModelInfo(modelKey);
      if (!modelInfo) {
        await bot.answerCallbackQuery(query.id, { text: 'Эта модель не сконфигурирована' });
        await bot.sendMessage(chatId, 'Выбранная модель недоступна в конфигурации. Пожалуйста, выберите другую.');
        return;
      }
      const prompt = state.getPrompt(chatId);
      if (!prompt) {
        await bot.answerCallbackQuery(query.id, { text: 'Сначала пришлите запрос текстом' });
        await bot.sendMessage(chatId, 'Пришлите запрос текстом, затем нажмите «Получить ответ».');
        return;
      }

      await bot.answerCallbackQuery(query.id, { text: 'Запрашиваю модель…' });
      await bot.sendChatAction(chatId, 'typing');

      const t0 = Date.now();
      let content = '';
      let usage = null;
      let isLocal = false;

      try {
        const res = await openAIService.chatCompletion(
          [{ role: 'user', content: prompt }],
          { model: modelInfo?.apiModel }
        );
        content = res.content || '';
        usage = extractUsage(res.usage);
      } catch (e) {
        console.error('LLM error:', e?.response?.status, e?.response?.data || e?.message);
        await bot.sendMessage(chatId, 'Ошибка при запросе к модели. Попробуйте позже или смените модель.');
        return;
      }

      const t1 = Date.now();
      const timeMs = t1 - t0;

      // Compute tokens and cost
      let tokens;
      if (usage) {
        tokens = usage;
      } else {
        const est = estimateTokensLocally(prompt, content);
        tokens = { prompt: est.prompt, completion: est.completion, total: est.total, cached: 0 };
        isLocal = true;
      }

      const pricing = modelInfo?.pricing;
      if (!pricing) {
        await bot.sendMessage(chatId, 'Не удалось найти тарифы для выбранной модели. Пожалуйста, выберите другую модель.');
        return;
      }
      const cost = computeCost(tokens, pricing);

      const header = formatMetricsLine({ modelKey, tokens, cost, timeMs, isLocal });
      const text = `${header}\n\n${content}`;
      await bot.sendMessage(chatId, text, { disable_web_page_preview: true });
      return;
    }
  } catch (error) {
    console.error('Callback handling error:', error);
  }
};

// Expose keyboard builder for other handlers
callbackHandler.buildKeyboard = buildKeyboard;

module.exports = callbackHandler;
