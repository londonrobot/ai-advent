// Simple in-memory per-chat state
// Structure per chatId: { selectedModelKey: string, lastPrompt: string }

const DEFAULT_MODEL_KEY = 'gpt3.5';

class StateService {
  constructor() {
    this.chatState = new Map();
  }

  ensure(chatId) {
    if (!this.chatState.has(chatId)) {
      this.chatState.set(chatId, {
        selectedModelKey: DEFAULT_MODEL_KEY,
        lastPrompt: '',
      });
    }
    return this.chatState.get(chatId);
  }

  setModel(chatId, modelKey) {
    const s = this.ensure(chatId);
    s.selectedModelKey = modelKey;
  }

  getModel(chatId) {
    return this.ensure(chatId).selectedModelKey;
  }

  setPrompt(chatId, prompt) {
    const s = this.ensure(chatId);
    s.lastPrompt = prompt || '';
  }

  getPrompt(chatId) {
    return this.ensure(chatId).lastPrompt || '';
  }
}

module.exports = new StateService();
