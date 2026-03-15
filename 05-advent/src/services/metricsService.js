// Metrics and pricing utilities
// - Computes costs based on usage or local estimates
// - Supports cached prompt tokens when available

// Model registry: UI key -> pricing + API model name
const MODELS = {
  'gpt5.2': {
    apiModel: 'gpt-5.2',
    pricing: {
      input_per_million: 2.5, // $
      cached_input_per_million: 0.25, // $
      output_per_million: 15.0, // $
    },
  },
  'gpt3.5': {
    apiModel: 'gpt-3.5-turbo',
    pricing: {
      input_per_million: 0.5,
      cached_input_per_million: 0.5, // assume same as input if not supported
      output_per_million: 1.5,
    },
  },
  'gpt4o': {
    apiModel: 'gpt-4o',
    pricing: {
      input_per_million: 2.5,
      cached_input_per_million: 2.5, // assume same as input if not supported
      output_per_million: 10.0,
    },
  },
};

const getModelInfo = (modelKey) => MODELS[modelKey];

// Local token estimation (very rough). Returns { prompt, completion, total, note }
// Heuristic: ~4 chars per token (english-centric); for arbitrary languages this is approximate
function estimateTokensLocally(promptText = '', completionText = '') {
  const est = (s) => Math.max(1, Math.ceil((s || '').length / 4));
  const prompt = est(promptText);
  const completion = est(completionText);
  const total = prompt + completion;
  return { prompt, completion, total, note: 'локальная оценка' };
}

// Extract usage from provider response
// Expected OpenAI-like shape: { prompt_tokens, completion_tokens, total_tokens, prompt_tokens_details: { cached_tokens } }
function extractUsage(usage) {
  if (!usage) return null;
  const prompt = Number(usage.prompt_tokens || 0);
  const completion = Number(usage.completion_tokens || 0);
  const total = Number(usage.total_tokens || (prompt + completion));
  const cached = Number(usage.prompt_tokens_details?.cached_tokens || 0);
  return { prompt, completion, total, cached };
}

// Compute cost in USD given tokens and model pricing
function computeCost(tokens, pricing) {
  const inNonCached = Math.max(0, (tokens.prompt || 0) - (tokens.cached || 0));
  const inCached = Math.max(0, tokens.cached || 0);
  const out = tokens.completion || 0;

  const costInput = (inNonCached / 1_000_000) * pricing.input_per_million;
  const costCached = (inCached / 1_000_000) * (pricing.cached_input_per_million ?? pricing.input_per_million);
  const costOutput = (out / 1_000_000) * pricing.output_per_million;
  const total = costInput + costCached + costOutput;

  return {
    costInput,
    costCached,
    costOutput,
    total,
  };
}

function formatUSD(n) {
  return `$${n.toFixed(6)}`;
}

function formatMetricsLine({ modelKey, tokens, cost, timeMs, isLocal }) {
  const parts = [];
  parts.push(`Модель: ${modelKey}`);
  parts.push(`Время: ${Math.round(timeMs)} мс`);

  const tokMain = `Токены: вход ${tokens.prompt}${tokens.cached ? ` (кэш ${tokens.cached})` : ''} / выход ${tokens.completion} / итого ${tokens.total}`;
  parts.push(isLocal ? `${tokMain} — локальная оценка` : tokMain);

  const costMain = `Стоимость: вход ${formatUSD(cost.costInput)}${tokens.cached ? `, кэш-вход ${formatUSD(cost.costCached)}` : ''}, выход ${formatUSD(cost.costOutput)}, итого ${formatUSD(cost.total)}`;
  parts.push(costMain);

  return parts.join(' | ');
}

module.exports = {
  MODELS,
  getModelInfo,
  estimateTokensLocally,
  extractUsage,
  computeCost,
  formatMetricsLine,
};
