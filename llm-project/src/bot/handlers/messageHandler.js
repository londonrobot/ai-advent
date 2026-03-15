const openAIService = require('../../services/openAIService');
const promptingService = require('../../services/promptingService');
const { problem } = require('../../config/problem');

const START_COMMAND = '/start';
const DIRECT_COMMAND = '/direct';
const STEP_COMMAND = '/step';
const PROMPT_COMMAND = '/prompt';
const EXPERTS_COMMAND = '/experts';

// Russian labels shown on custom keyboard (UI only)
const DIRECT_LABEL = 'Прямой ответ';
const STEP_LABEL = 'Шаг за шагом';
const PROMPT_LABEL = 'Сгенерировать промпт';
const EXPERTS_LABEL = 'Эксперты';

// Helper: show custom keyboard with our commands
function sendCommandKeyboard(bot, chatId) {
  const keyboard = {
    keyboard: [
      [{ text: DIRECT_LABEL }, { text: STEP_LABEL }],
      [{ text: PROMPT_LABEL }, { text: EXPERTS_LABEL }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
  bot.sendMessage(chatId, 'Выберите технику промптинга:', { reply_markup: keyboard });
}

const messageHandler = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = (msg.text || '').trim();

  try {
    // Show welcome and keyboard on /start
    if (userMessage === START_COMMAND) {
      await bot.sendMessage(chatId, 'Добро пожаловать! Этот бот демонстрирует разные техники промптинга.');
      sendCommandKeyboard(bot, chatId);
      return;
    }

    // Match by slash-commands or by Russian labels from the keyboard
    const isDirect = userMessage === DIRECT_COMMAND || userMessage === DIRECT_LABEL;
    const isStep = userMessage === STEP_COMMAND || userMessage === STEP_LABEL;
    const isPrompt = userMessage === PROMPT_COMMAND || userMessage === PROMPT_LABEL;
    const isExperts = userMessage === EXPERTS_COMMAND || userMessage === EXPERTS_LABEL;

    if (isDirect) {
      await bot.sendChatAction(chatId, 'typing');
      const result = await promptingService.solveDirect(problem);
      await bot.sendMessage(chatId, `Прямой ответ:\n${result}`);
      return;
    }

    if (isStep) {
      await bot.sendChatAction(chatId, 'typing');
      const result = await promptingService.solveStep(problem);
      await bot.sendMessage(chatId, `Пошаговое решение:\n${result}`);
      return;
    }

    if (isPrompt) {
      await bot.sendChatAction(chatId, 'typing');
      const result = await promptingService.solveWithGeneratedPrompt(problem);
      await bot.sendMessage(chatId, result.replace(/^Generated prompt:/, 'Сгенерированный промпт:').replace(/\n\nResult:\n/, '\n\nРезультат:\n'));
      return;
    }

    if (isExperts) {
      await bot.sendChatAction(chatId, 'typing');
      const result = await promptingService.solveWithExperts(problem);
      await bot.sendMessage(chatId, `Подход экспертов:\n${result}`);
      return;
    }

    // Fallback: keep existing freeform chat behavior
    const response = await openAIService.getOpenAIResponse(userMessage);
    await bot.sendMessage(chatId, response);
  } catch (error) {
    console.error('Error while processing message:', error);
    await bot.sendMessage(chatId, 'Что-то пошло не так. Пожалуйста, попробуйте снова.');
  }
};

module.exports = messageHandler;