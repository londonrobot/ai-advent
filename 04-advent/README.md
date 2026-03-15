# Простой Telegram-чат-бот (OpenAI-совместимый API)

Минимальный бот-"болталка" с поддержкой любого OpenAI-совместимого API (Groq/OpenAI). Включён hot reloading через nodemon.

## Установка зависимостей

1. Перейдите в папку проекта:
   ```bash
   cd 04-advent
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```

## Настройка окружения
Создайте `.env` на основе `.env.example` и задайте переменные:

Обязательные:
```ini
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

Groq (OpenAI-совместимый API):
```ini
GROQ_API_KEY=your_groq_api_key
# Необязательно
# LLM_BASE_URL=https://api.groq.com/openai/v1
# GROQ_MODEL=llama-3.1-8b-instant
```

OpenAI:
```ini
OPENAI_API_KEY=your_openai_api_key
# Необязательно
# LLM_BASE_URL=https://api.openai.com/v1
# OPENAI_MODEL=gpt-3.5-turbo
```

Универсальные (перекрывают провайдер-специфичные):
```ini
# LLM_API_KEY=...
# LLM_BASE_URL=...
# LLM_MODEL=...
# LLM_MAX_TOKENS=250
```
Параметр LLM_MAX_TOKENS ограничивает длину ответа модели по токенам (передаётся в chat/completions как max_tokens).
## Запуск

- Обычный запуск:
  ```bash
  npm start
  ```
- Режим разработки с hot reload:
  ```bash
  npm run dev
  ```

## Использование
Просто напишите боту любое сообщение — он отправит три варианта ответа с разной температурой (0, 0.7, 1.2). Длина каждого ответа ограничивается параметром max_tokens, а если итоговый текст превышает лимит Telegram на сообщение, он будет автоматически разбит на несколько сообщений без обрезания содержимого.
