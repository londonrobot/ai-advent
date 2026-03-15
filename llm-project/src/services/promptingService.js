// Service with sample prompting techniques for the same problem
// Each method is a separate async function and uses the unified OpenAI-compatible client

const { chatCompletion } = require('./openAIService');

// ===== Retry helpers (transient error handling) =====
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function isTransientError(err) {
  const status = err?.response?.status;
  const code = err?.code;
  // Retry on typical transient HTTP statuses and network errors
  if (status === 429) return true; // rate limit
  if (status >= 500 && status <= 599) return true; // server errors
  if ([
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'ENOTFOUND',
    'ECONNABORTED',
  ].includes(code)) return true;
  return false;
}

async function withRetry(fn, {
  retries = 3,
  baseDelay = 500, // ms
  factor = 2,
  jitter = 0.2, // +/- 20%
} = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt > retries || !isTransientError(err)) {
        throw err;
      }
      const exp = Math.pow(factor, attempt - 1);
      const base = baseDelay * exp;
      const rand = 1 + (Math.random() * 2 - 1) * jitter; // 1 +/- jitter
      const delay = Math.max(100, Math.floor(base * rand));
      // Optional: console.warn(`Retrying LLM call in ${delay}ms (attempt ${attempt}/${retries})`);
      await sleep(delay);
    }
  }
}

// 1) Direct prompting: send the problem as-is
async function solveDirect(problem) {
  const { content } = await withRetry(
    () => chatCompletion([{ role: 'user', content: problem }]),
  );
  return content;
}

// 2) Step-by-step prompting: ask for explicit reasoning steps
async function solveStep(problem) {
  const { content } = await withRetry(
    () => chatCompletion([
      { role: 'system', content: 'You are a careful, step-by-step reasoning assistant.' },
      { role: 'user', content: `Solve the following problem step by step. Show your reasoning and then provide a clearly marked final answer at the end.\n\nProblem:\n${problem}` },
    ], { temperature: 0.3 }),
  );
  return content;
}

// 3) Prompt generation: ask the model to craft the best prompt first, then use it
async function solveWithGeneratedPrompt(problem) {
  // Ask for the best possible prompt (meta-prompting)
  const { content: generatedPrompt } = await withRetry(
    () => chatCompletion([
      { role: 'system', content: 'You are an expert prompt engineer.' },
      { role: 'user', content: `Create the best possible single prompt to solve the following logic problem.\nReturn only the prompt text, no commentary or quotes.\n\nProblem:\n${problem}` },
    ], { temperature: 0.7 }),
  );

  // Use the generated prompt to solve the task
  const { content: result } = await withRetry(
    () => chatCompletion([
      { role: 'user', content: generatedPrompt },
    ], { temperature: 0.2 }),
  );

  return `Generated prompt:\n${generatedPrompt}\n\nResult:\n${result}`;
}

// 4) Multi-expert prompting: emulate a panel (analyst, solver, critic)
async function solveWithExperts(problem) {
  const { content } = await withRetry(
    () => chatCompletion([
      { role: 'system', content: 'You are a panel of three experts collaborating to solve logic puzzles.' },
      { role: 'user', content: `Work as three experts and show your reasoning for each role, then give a final consolidated answer:\n\n- Analyst: Decompose the problem, list assumptions, and key constraints.\n- Problem Solver: Propose a solution path using the constraints.\n- Critic: Challenge the solution, point out possible flaws, and refine it if needed.\n\nFinally, provide a short line starting with \'Final Answer:\' that states the solution.\n\nProblem:\n${problem}` },
    ], { temperature: 0.4 }),
  );
  return content;
}

module.exports = {
  solveDirect,
  solveStep,
  solveWithGeneratedPrompt,
  solveWithExperts,
};
