// backend/services/aiProviders/openai.js
// Routes AI calls to Groq's API.
// Groq is fully OpenAI-compatible, so we reuse the OpenAI SDK.

const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    timeout: 60_000,
    maxRetries: 1,
});

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

// Pricing per 1M tokens (USD). Groq's free tier is $0, but we keep
// these for potential future paid usage or other models.
const PRICING = {
    'openai/gpt-oss-120b': { input: 0.15, output: 0.60 },
    'openai/gpt-oss-20b':  { input: 0.075, output: 0.30 },
    'qwen/qwen3.6-27b':    { input: 0.20, output: 0.80 },
};

/**
 * @param {object} args
 * @param {string} args.system       System prompt
 * @param {string} args.user         User prompt
 * @param {string} [args.model]      Model id (e.g. "groq/llama-3.3-70b-versatile")
 * @param {boolean} [args.jsonMode]  Request JSON-only output
 * @returns {Promise<{ text: string, tokensUsed: number, costUsd: number, raw: object }>}
 */
const generate = async ({ system, user, model = DEFAULT_MODEL, jsonMode = false }) => {
    const completion = await client.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
        ],
        temperature: 0.7,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    });

    const text = completion.choices?.[0]?.message?.content ?? '';
    const usage = completion.usage || {};
    const pricing = PRICING[model] || { input: 0, output: 0 };

    const costUsd =
        ((usage.prompt_tokens || 0) / 1_000_000) * pricing.input +
        ((usage.completion_tokens || 0) / 1_000_000) * pricing.output;

    return {
        text,
        tokensUsed: usage.total_tokens || 0,
        costUsd,
        raw: completion,
    };
};

module.exports = { generate, PRICING, DEFAULT_MODEL };