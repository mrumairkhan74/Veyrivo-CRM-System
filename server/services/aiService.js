
// Prompt templates + provider dispatch. The controller calls runGeneration()
// and doesn't need to know which provider is used.

const provider = require('./aiProviders/groq');

// Each entry:
//   json:    true  -> ask the model for strict JSON; runGeneration parses it
//   system:  system prompt
//   user:    (input) -> user prompt string
const PROMPTS = {
    leadGeneration: {
        json: true,
        system:
            'You are an expert B2B sales prospecting assistant. ' +
            'Return ONLY a valid JSON object. No prose, no markdown fences.',
        user: (input) => `
Generate 5 realistic B2B sales leads matching these criteria:
- Industry: ${input.industry || 'any'}
- Company size: ${input.company_size || 'any'}
- Location: ${input.location || 'any'}
- Target role: ${input.target_role || 'decision maker'}

Return JSON with this exact shape:
{
  "leads": [
    {
      "company": "string",
      "contact_name": "string",
      "title": "string",
      "email": "string",
      "phone": "string",
      "industry": "string",
      "company_size": "string",
      "estimated_value": number,
      "source": "AI Generated",
      "reasoning": "string (why this lead fits)"
    }
  ]
}
`.trim(),
    },

    leadQualification: {
        json: true,
        system:
            'You are a sales qualification expert using BANT/MEDDIC frameworks. ' +
            'Return ONLY valid JSON.',
        user: (input) => `
Qualify this lead:
- Company: ${input.company || 'unknown'}
- Contact: ${input.contact_name || 'unknown'} (${input.title || 'role unknown'})
- Industry: ${input.industry || 'unknown'}
- Notes: ${input.notes || 'none'}

Return JSON:
{
  "score": number (0-100),
  "temperature": "hot" | "warm" | "cold",
  "budget_fit": "strong" | "medium" | "weak",
  "timeline_fit": "good" | "unclear" | "poor",
  "authority_fit": "decision_maker" | "influencer" | "unknown",
  "need_fit": "high" | "medium" | "low",
  "recommended_actions": ["string", ...],
  "risk_factors": ["string", ...],
  "summary": "string (2-3 sentences)"
}
`.trim(),
    },

    leadSummary: {
        json: false,
        system: 'You are a CRM assistant. Write concise, factual summaries.',
        user: (input) => `
Summarize this lead:
- Company: ${input.company || 'unknown'}
- Contact: ${input.contact_name || 'unknown'} (${input.title || ''})
- Industry: ${input.industry || 'unknown'}
- Description: ${input.description || 'n/a'}
- Estimated value: ${input.estimated_value || 'n/a'}
- Timeline: ${input.timeline || 'n/a'}
- Previous interactions: ${input.interactions || 'none'}

Write a 3-4 sentence summary a sales rep can read before a call.
`.trim(),
    },

    nextAction: {
        json: false,
        system:
            'You are a sales coach. Give specific, tactical next-step advice. ' +
            'Use short markdown sections and bullet points.',
        user: (input) => `
Recommend the next action for this deal:
- Lead stage: ${input.lead_stage || 'unknown'}
- Last interaction: ${input.last_interaction || 'none'}
- Notes: ${input.notes || 'none'}

Give: recommended action, timing, approach, and 3 talking points.
`.trim(),
    },

    emailDraft: {
        json: false,
        system:
            'You are a B2B sales copywriter. Write short, personal, non-spammy emails. ' +
            'Never use "I hope this email finds you well".',
        user: (input) => `
Write a follow-up email:
- Recipient: ${input.recipient_name || 'there'}
- Company: ${input.company || 'their company'}
- Goal: ${input.goal || 're-engage and book a call'}
- Tone: ${input.tone || 'professional, warm'}
- Context: ${input.context || 'none'}

Return only the email, starting with "Subject:".
`.trim(),
    },
};

const getPromptConfig = (type) => PROMPTS[type];

/**
 * Run an AI generation. Dispatches to the provider and normalizes output.
 *
 * @param {object} args
 * @param {string} args.type        One of the keys in PROMPTS
 * @param {object} args.input       Form data from the frontend
 * @param {string} [args.provider]  Currently only 'openai' (via OmniRoute)
 * @param {string} [args.model]     'auto' lets OmniRoute pick a free model
 * @returns {Promise<{ output: any, text: string, tokensUsed: number, costUsd: number }>}
 */
const runGeneration = async ({ type, input, provider: providerName = 'groq',       // ← was 'openai'
    model = provider.DEFAULT_MODEL, }) => {
    const config = PROMPTS[type];
    if (!config) {
        const err = new Error(`Unsupported AI type: ${type}`);
        err.statusCode = 400;
        throw err;
    }

    if (providerName !== 'groq') {
        const err = new Error(`Provider "${providerName}" not implemented yet`);
        err.statusCode = 400;
        throw err;
    }

    const { text, tokensUsed, costUsd, raw } = await provider.generate({
        system: config.system,
        user: config.user(input || {}),
        model,
        jsonMode: config.json,
    });

    // Parse JSON when the prompt asked for it
    let output = text;
    if (config.json) {
        try {
            output = JSON.parse(text);
        } catch (e) {
            const err = new Error('AI returned invalid JSON');
            err.statusCode = 502;
            err.rawText = text;
            throw err;
        }
    }

    return {
        output,      // object for json types, string otherwise
        text,        // raw text always available
        tokensUsed,
        costUsd,
        raw,
    };
};

module.exports = { runGeneration, PROMPTS, getPromptConfig };