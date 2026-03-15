const state = require('../../services/stateService');
const cbHandler = require('./callbackHandler');

const START_COMMAND = '/start';

const messageHandler = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = (msg.text || '').trim();

  try {
    if (userMessage === START_COMMAND) {
      const modelKey = state.getModel(chatId);
      await bot.sendMessage(
        chatId,
        'Привет!\n\n1) Выберите модель ниже.\n2) Пришлите ваш запрос.\n3) Нажмите «Получить ответ».',
        { reply_markup: cbHandler.buildKeyboard(modelKey) }
      );
      return;
    }

    if (!userMessage) return;

    // Save last prompt and show keyboard for quick access
    state.setPrompt(chatId, userMessage);
    const modelKey = state.getModel(chatId);
    await bot.sendMessage(
      chatId,
      'Запрос принят. Нажмите «Получить ответ», чтобы получить ответ от выбранной модели.',
      { reply_markup: cbHandler.buildKeyboard(modelKey) }
    );
  } catch (error) {
    console.error('Error while processing message:', error);
    await bot.sendMessage(chatId, 'Что-то пошло не так. Пожалуйста, попробуйте снова.');
  }
};

module.exports = messageHandler;