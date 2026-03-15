const axios = require('axios');
const config = require('../config/config');

// Low-level helper for arbitrary chat completions
const chatCompletion = async (messages, options = {}) => {
  const url = `${config.LLM_BASE_URL.replace(/\/+$/, '')}/chat/completions`;
  const payload = {
    model: config.LLM_MODEL,
    messages,
    ...(['temperature', 'top_p', 'max_tokens'].reduce((acc, k) => {
      if (options[k] !== undefined) acc[k] = options[k];
      return acc;
    }, {})),
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${config.LLM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  });

  if (!response.data?.choices?.length) {
    throw new Error('No valid response from LLM API');
  }
  const message = response.data.choices[0].message?.content || '';
  return { content: message, raw: response.data };
};

// Backward-compatible simple helper
const getOpenAIResponse = async (userMessage) => {
  try {
    const { content } = await chatCompletion([{ role: 'user', content: userMessage }]);
    return content;
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error('API error:', status ? `${status} ${JSON.stringify(data)}` : error.message);
    if (status === 401) {
      throw new Error('Unauthorized: Check your API key and base URL.');
    }
    throw new Error('LLM API request failed');
  }
};

module.exports = { getOpenAIResponse, chatCompletion };