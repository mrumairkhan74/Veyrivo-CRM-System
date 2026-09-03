const { supabase } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

// Mock AI responses (replace with actual AI integration)
const mockAIResponses = {
  leadGeneration: (input) => ({
    leads: [
      {
        company: "TechFlow Inc",
        contact_name: "Sarah Chen",
        title: "VP Engineering",
        email: "sarah.chen@techflow.io",
        phone: "+1-415-555-0142",
        industry: input.industry || "SaaS",
        company_size: input.company_size || "50-200",
        estimated_value: 25000,
        source: "AI Generated",
        reasoning: "Recently raised Series A, hiring engineering leads, mentioned need for custom integrations"
      },
      {
        company: "DataScale Labs",
        contact_name: "Marcus Johnson",
        title: "CTO",
        email: "marcus@datascale.ai",
        phone: "+1-650-555-0287",
        industry: input.industry || "AI/ML",
        company_size: input.company_size || "10-50",
        estimated_value: 18000,
        source: "AI Generated",
        reasoning: "Building MLOps platform, needs custom dashboard development"
      }
    ]
  }),
  leadQualification: (input) => ({
    score: 87,
    temperature: "hot",
    budget_fit: "strong",
    timeline_fit: "good",
    authority_fit: "decision_maker",
    need_fit: "high",
    recommended_actions: [
      "Schedule discovery call within 48 hours",
      "Prepare custom demo for their use case",
      "Send case study from similar industry"
    ],
    risk_factors: ["Competitor evaluation in progress", "Budget approval pending board meeting"],
    summary: "High-value prospect with immediate need. CTO is technical buyer with budget authority. Strong fit for our AI integration services."
  }),
  leadSummary: (input) => ({
    summary: `${input.company} is a ${input.industry} company seeking ${input.description || 'our services'}. ${input.contact_name}, ${input.title}, is the key decision maker with ${input.estimated_value} budget approved. They're evaluating vendors and need delivery within ${input.timeline || '6 weeks'}. Previous interaction: ${input.interactions || 'discovery call completed'}. High urgency, strong budget fit.`
  }),
  nextAction: (input) => ({
    action: `**Recommended Action:** Schedule technical deep-dive call within 24 hours.

**Timing:** Today or tomorrow morning (they're in PST)

**Approach:** 
1. Reference their specific requirements from discovery call
2. Bring technical architect to answer integration questions
3. Present phased delivery timeline matching their deadline
4. Prepare pricing options: Fixed-price vs milestone-based

**Talking Points:**
- "We've reviewed your requirements in detail"
- "Our team has delivered similar projects this quarter"
- "Can we lock in a 30-min technical session this week?"`
  }),
  emailDraft: (input) => ({
    email: `Subject: ${input.service || 'Our Services'} for ${input.company} - ${input.goal || '3 Ideas from Our Discussion'}

Hi ${input.contact_name},

Following up on our conversation about ${input.company}'s ${input.service || 'project'}. I've been thinking about your ${input.industry || 'requirements'} and have 3 specific ideas that could save you time:

1. **Approach 1** - Brief description of value
2. **Approach 2** - Brief description of value  
3. **Approach 3** - Brief description of value

We've implemented this for similar ${input.industry || 'companies'} this quarter (happy to share references).

Worth a brief call this week to discuss? I'm free Thu/Fri mornings.

Best,
[Your Name]`
  }),
};

const generateAI = async (req, res, next) => {
  try {
    const { type, input, provider = 'openai', model = 'gpt-4o' } = req.body;

    if (!mockAIResponses[type]) {
      throw new AppError('Invalid AI type', 400);
    }

    // Record the AI request
    const { data: aiResult, error: createError } = await supabase
      .from('ai_results')
      .insert({
        type,
        provider,
        model,
        input_data: input,
        output_data: mockAIResponses[type](input),
        tokens_used: Math.floor(JSON.stringify(input).length / 4) + 500,
        cost_usd: 0.01,
        status: 'completed',
        created_by: req.user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to record AI result:', createError);
    }

    res.json({
      data: mockAIResponses[type](input),
      meta: { type, provider, model, tokens_used: aiResult?.tokens_used || 0 },
    });
  } catch (error) {
    next(error);
  }
};

const getAIHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('ai_results')
      .select('*', { count: 'exact' })
      .eq('created_by', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new AppError(error.message, 400);

    res.json({
      data,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getAIUsage = async (req, res, next) => {
  try {
    const { data: results } = await supabase
      .from('ai_results')
      .select('type, provider, model, tokens_used, cost_usd, created_at')
      .eq('created_by', req.user.id);

    const stats = {
      totalRequests: results?.length || 0,
      totalTokens: (results || []).reduce((sum, r) => sum + (r.tokens_used || 0), 0),
      totalCost: (results || []).reduce((sum, r) => sum + parseFloat(r.cost_usd || 0), 0),
      byType: {},
      byProvider: {},
      byModel: {},
    };

    (results || []).forEach(r => {
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