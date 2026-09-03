export const aiProviders = [
    { id: 'openai', name: 'OpenAI GPT-4', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'anthropic', name: 'Anthropic Claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
    { id: 'google', name: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
    { id: 'local', name: 'Local LLM (Ollama)', models: ['llama3', 'mistral', 'codellama'] },
];

export const aiPrompts = {
    leadGeneration: {
        name: 'Lead Generation',
        description: 'Generate new leads from target criteria',
        systemPrompt: `You are an expert B2B lead generation specialist. Generate high-quality leads based on the provided criteria.
Return a JSON array of leads with these fields: company, contact_name, title, email, phone, industry, company_size, estimated_value, source, reasoning.`,
        userPromptTemplate: `Generate {count} leads for:
- Industry: {industry}
- Company Size: {company_size}
- Location: {location}
- Target Role: {target_role}
- Budget Range: {budget_range}

Focus on decision makers who would need our services: {services}.`,
        parameters: ['count', 'industry', 'company_size', 'location', 'target_role', 'budget_range', 'services'],
    },
    leadQualification: {
        name: 'Lead Qualification',
        description: 'Qualify and score existing leads',
        systemPrompt: `You are an expert sales qualification analyst. Analyze the lead information and provide a qualification score (0-100) with reasoning.
Return JSON with: score, temperature (hot/warm/cold), budget_fit, timeline_fit, authority_fit, need_fit, recommended_actions, risk_factors, summary.`,
        userPromptTemplate: `Qualify this lead:
- Company: {company}
- Contact: {contact_name} ({title})
- Industry: {industry}
- Company Size: {company_size}
- Estimated Value: {estimated_value}
- Source: {source}
- Description: {description}
- Budget Range: {budget_range}
- Timeline: {timeline}
- Previous Interactions: {interactions}

Our services: {services}`,
        parameters: ['company', 'contact_name', 'title', 'industry', 'company_size', 'estimated_value', 'source', 'description', 'budget_range', 'timeline', 'interactions', 'services'],
    },
    leadSummary: {
        name: 'Lead Summary',
        description: 'Generate concise AI summary of lead',
        systemPrompt: `Create a concise, professional summary of this lead for a sales rep. Focus on key decision factors.`,
        userPromptTemplate: `Summarize this lead in 3-4 sentences:
Company: {company}
Contact: {contact_name} ({title})
Industry: {industry}
Value: {estimated_value}
Source: {source}
Notes: {description}
Interactions: {interactions}`,
        parameters: ['company', 'contact_name', 'title', 'industry', 'estimated_value', 'source', 'description', 'interactions'],
    },
    nextAction: {
        name: 'Recommended Next Action',
        description: 'Get AI-recommended next step for a lead',
        systemPrompt: `You are a sales coach. Based on the lead status and history, recommend the single best next action with specific timing and approach.`,
        userPromptTemplate: `Recommend next action for:
- Lead: {company} - {contact_name}
- Status: {status}
- Temperature: {temperature}
- Score: {score}
- Last Contact: {last_contacted}
- Next Follow-up: {next_follow_up}
- History: {interactions}
- Our Services: {services}`,
        parameters: ['company', 'contact_name', 'status', 'temperature', 'score', 'last_contacted', 'next_follow_up', 'interactions', 'services'],
    },
    emailDraft: {
        name: 'Email Draft Generator',
        description: 'Generate personalized outreach emails',
        systemPrompt: `Write a professional, personalized sales email. Keep it concise, value-focused, and include a clear CTA.`,
        userPromptTemplate: `Write a {tone} email to:
- Contact: {contact_name} ({title})
- Company: {company}
- Industry: {industry}
- Our Service: {service}
- Value Proposition: {value_prop}
- Previous Touchpoints: {interactions}
- Goal: {goal}`,
        parameters: ['tone', 'contact_name', 'title', 'company', 'industry', 'service', 'value_prop', 'interactions', 'goal'],
    },
};

export const aiLeadGenerationHistory = [
    {
        id: 'ai-gen-001',
        type: 'leadGeneration',
        status: 'completed',
        provider: 'openai',
        model: 'gpt-4o',
        input: { count: 10, industry: 'Technology', company_size: '50-200', location: 'San Francisco', target_role: 'CTO', budget_range: '$10k-50k', services: 'Custom Software, AI Integration' },
        output: { leads_generated: 10, avg_score: 72 },
        tokens_used: 2840,
        cost_usd: 0.0426,
        created_at: '2026-08-30T10:30:00Z',
        completed_at: '2026-08-30T10:30:15Z',
    },
    {
        id: 'ai-gen-002',
        type: 'leadQualification',
        status: 'completed',
        provider: 'openai',
        model: 'gpt-4o',
        input: { company: 'TechNova Solutions', contact_name: 'James Wilson', score: 92 },
        output: { score: 92, temperature: 'hot', recommended_actions: ['Schedule discovery call', 'Send proposal'] },
        tokens_used: 1560,
        cost_usd: 0.0234,
        created_at: '2026-08-29T14:20:00Z',
        completed_at: '2026-08-29T14:20:08Z',
    },
    {
        id: 'ai-gen-003',
        type: 'leadSummary',
        status: 'completed',
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        input: { company: 'GrowthEdge Marketing' },
        output: { summary: 'High-potential lead seeking custom CRM...' },
        tokens_used: 890,
        cost_usd: 0.0089,
        created_at: '2026-08-28T09:15:00Z',
        completed_at: '2026-08-28T09:15:03Z',
    },
];

export const aiUsageStats = {
    totalRequests: 147,
    totalTokens: 428000,
    totalCost: 6.42,
    byProvider: {
        openai: { requests: 89, tokens: 256000, cost: 3.84 },
        anthropic: { requests: 42, tokens: 124000, cost: 1.86 },
        google: { requests: 16, tokens: 48000, cost: 0.72 },
    },
    byType: {
        leadGeneration: { requests: 23, tokens: 156000, cost: 2.34 },
        leadQualification: { requests: 56, tokens: 134000, cost: 2.01 },
        leadSummary: { requests: 41, tokens: 78000, cost: 1.17 },
        nextAction: { requests: 18, tokens: 34000, cost: 0.51 },
        emailDraft: { requests: 9, tokens: 26000, cost: 0.39 },
    },
    thisMonth: { requests: 34, tokens: 98000, cost: 1.47 },
    lastMonth: { requests: 28, tokens: 87000, cost: 1.31 },
};