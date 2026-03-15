# Telegram Bot with OpenAI-compatible LLMs (Groq/OpenAI)

Этот проект — Telegram-бот, который работает с любым OpenAI-совместимым API. По умолчанию поддержана интеграция с Groq и OpenAI.

## Установка зависимостей

1. Клонируйте этот репозиторий:
   ```bash
   git clone <repository-url>
   cd llm-project
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

## Запуск бота

Перед запуском создайте файл `.env` на основе `.env.example` и заполните переменные окружения.

Минимальный набор:
```ini
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### Вариант A: Groq (OpenAI-совместимый API)
```ini
# Ключ и базовый URL Groq (URL можно не указывать — есть дефолт)
GROQ_API_KEY=your_groq_api_key
# Необязательно, по умолчанию https://api.groq.com/openai/v1
# LLM_BASE_URL=https://api.groq.com/openai/v1
# Модель Groq (пример). Можно переопределить через LLM_MODEL
GROQ_MODEL=llama-3.1-8b-instant
```

### Вариант B: OpenAI
```ini
OPENAI_API_KEY=your_openai_api_key
# Необязательно, по умолчанию https://api.openai.com/v1
# LLM_BASE_URL=https://api.openai.com/v1
# Модель OpenAI (пример). Можно переопределить через LLM_MODEL
OPENAI_MODEL=gpt-3.5-turbo
```

### Универсальные переменные (имеют приоритет)
```ini
# Если задать LLM_API_KEY/LLM_BASE_URL/LLM_MODEL — они перекроют специфичные для провайдера
# LLM_API_KEY=...
# LLM_BASE_URL=...
# LLM_MODEL=...
```

Теперь вы можете запустить бота:
```bash
npm start
```

## Получение токена Telegram-бота

1. Откройте Telegram и найдите бота @BotFather.
2. Введите команду `/newbot` и следуйте инструкциям, чтобы создать нового бота.
3. После создания бот выдаст токен API, который нужно вставить в `.env`.
