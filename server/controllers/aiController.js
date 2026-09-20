
const { supabase, supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const { runGeneration } = require('../services/aiService');
const { DEFAULT_MODEL } = require('../services/aiProviders/groq');


// ─────────────────────────────────────────────────────────────
// POST /api/v1/ai/generate
// ─────────────────────────────────────────────────────────────
const generateAI = async (req, res, next) => {
  try {
    const {
      type,
      input,
      provider = 'groq',
      model = DEFAULT_MODEL,
    } = req.body;

    if (!type) throw new AppError('Missing "type"', 400);
    if (!input || typeof input !== 'object') {
      throw new AppError('Missing or invalid "input"', 400);
    }

    const { output, text, tokensUsed, costUsd } = await runGeneration({
      type,
      input,
      provider,
      model,
    });

    // Persist the run. Service-role client bypasses RLS.
    const { data: saved, error: insertError } = await supabaseAdmin
      .from('ai_results')
      .insert({
        organization_id: req.user.organization_id,

        type,
        provider,
        model,
        input_data: input,
        output_data: output,
        raw_text: text,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        status: 'completed',
        created_by: req.user.id,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // Don't fail the user's request just because logging failed.
      console.error('Failed to record AI result:', insertError);
    }

    res.json({
      data: output,
      meta: {
        id: saved?.id,
        type,
        provider,
        model,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
      },
    });
  } catch (error) {
    // Map provider errors to sensible HTTP statuses
    if (error?.status === 401) {
      return next(new AppError('AI provider rejected the API key', 502));
    }
    if (error?.status === 429) {
      return next(new AppError('AI provider rate limit hit', 429));
    }
    if (error?.code === 'ECONNREFUSED') {
      return next(
        new AppError(
          'AI gateway unreachable — is OmniRoute running on port 20128?',
          502
        )
      );
    }
    if (error?.statusCode) {
      return next(new AppError(error.message, error.statusCode));
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/ai/history
// ─────────────────────────────────────────────────────────────
const getAIHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // User-scoped client → RLS keeps results per-user.
    const { data, error, count } = await supabase
      .from('ai_results')
      .select('*', { count: 'exact' })
      .eq('created_by', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new AppError(error.message, 400);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/ai/usage
// ─────────────────────────────────────────────────────────────
const getAIUsage = async (req, res, next) => {
  try {
    const { data: results } = await supabase
      .from('ai_results')
      .select('type, provider, model, tokens_used, cost_usd, created_at')
      .eq('created_by', req.user.id);

    const stats = {
      totalRequests: results?.length || 0,
      totalTokens: (results || []).reduce(
        (sum, r) => sum + (r.tokens_used || 0),
        0
      ),
      totalCost: (results || []).reduce(
        (sum, r) => sum + parseFloat(r.cost_usd || 0),
        0
      ),
      byType: {},
      byProvider: {},
      byModel: {},
    };

    (results || []).forEach((r) => {
      stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;
      stats.byProvider[r.provider] = (stats.byProvider[r.provider] || 0) + 1;
      stats.byModel[r.model] = (stats.byModel[r.model] || 0) + 1;
    });

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAI,
  getAIHistory,
  getAIUsage,
};