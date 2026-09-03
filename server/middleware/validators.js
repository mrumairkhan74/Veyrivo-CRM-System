// Validation helpers
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  req.body = value;
  next();
};

// Common validation schemas using Joi-like validation (simple implementation)
const schemas = {
  register: {
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: 'string', required: true, minLength: 8 },
    name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
  },
  login: {
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: 'string', required: true },
  },
  lead: {
    title: { type: 'string', required: true, minLength: 2, maxLength: 200 },
    description: { type: 'string', required: false },
    contact: { type: 'string', required: true, minLength: 2 },
    email: { type: 'string', required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    company: { type: 'string', required: false },
    status: { type: 'string', required: false, enum: ['new', 'contacted', 'qualified', 'nurture', 'lost'] },
    temperature: { type: 'string', required: false, enum: ['hot', 'warm', 'cold', 'unknown'] },
    score: { type: 'number', required: false, min: 0, max: 100 },
    source: { type: 'string', required: false },
    service: { type: 'string', required: false },
    industry: { type: 'string', required: false },
    estimated_value: { type: 'number', required: false, min: 0 },
    currency: { type: 'string', required: false, enum: ['USD', 'EUR', 'GBP', 'PKR'] },
    timeline: { type: 'string', required: false, enum: ['urgent', 'one_month', 'three_months', 'exploring'] },
    budget_range: { type: 'string', required: false, enum: ['low', 'medium', 'high', 'unknown'] },
    owner: { type: 'string', required: false },
    next_follow_up_at: { type: 'string', required: false },
  },
  company: {
    name: { type: 'string', required: true, minLength: 2, maxLength: 200 },
    domain: { type: 'string', required: false },
    email: { type: 'string', required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { type: 'string', required: false },
    website: { type: 'string', required: false },
    address: { type: 'string', required: false },
    city: { type: 'string', required: false },
    country: { type: 'string', required: false },
    company_size: { type: 'string', required: false, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    industry_id: { type: 'string', required: false },
    status: { type: 'string', required: false, enum: ['active', 'inactive', 'pending', 'archived'] },
    source: { type: 'string', required: false },
    owner: { type: 'string', required: false },
  },
  contact: {
    first_name: { type: 'string', required: true, minLength: 1 },
    last_name: { type: 'string', required: true, minLength: 1 },
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { type: 'string', required: false },
    mobile: { type: 'string', required: false },
    title: { type: 'string', required: false },
    company_id: { type: 'string', required: false },
    is_decision_maker: { type: 'boolean', required: false },
    status: { type: 'string', required: false, enum: ['active', 'inactive', 'archived'] },
    consent_status: { type: 'string', required: false, enum: ['opted_in', 'opted_out', 'pending'] },
    source: { type: 'string', required: false },
    owner: { type: 'string', required: false },
  },
  deal: {
    title: { type: 'string', required: true, minLength: 2 },
    company: { type: 'string', required: true },
    contact: { type: 'string', required: true },
    value: { type: 'number', required: true, min: 0 },
    currency: { type: 'string', required: false, enum: ['USD', 'EUR', 'GBP', 'PKR'] },
    stage: { type: 'string', required: false, enum: ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] },
    probability: { type: 'number', required: false, min: 0, max: 100 },
    expected_close_date: { type: 'string', required: false },
    owner: { type: 'string', required: false },
    source: { type: 'string', required: false },
    notes: { type: 'string', required: false },
    lead_id: { type: 'string', required: false },
  },
  activity: {
    title: { type: 'string', required: true, minLength: 2 },
    type: { type: 'string', required: true, enum: ['call', 'meeting', 'email', 'task', 'note'] },
    status: { type: 'string', required: false, enum: ['scheduled', 'completed', 'pending', 'cancelled'] },
    priority: { type: 'string', required: false, enum: ['high', 'medium', 'low'] },
    related_to: { type: 'string', required: false, enum: ['lead', 'deal', 'company', 'contact', 'none'] },
    related_id: { type: 'string', required: false },
    related_name: { type: 'string', required: false },
    contact: { type: 'string', required: false },
    company: { type: 'string', required: false },
    scheduled_at: { type: 'string', required: true },
    completed_at: { type: 'string', required: false },
    duration: { type: 'number', required: false, min: 0 },
    notes: { type: 'string', required: false },
    outcome: { type: 'string', required: false },
    next_action: { type: 'string', required: false },
    next_action_date: { type: 'string', required: false },
    owner: { type: 'string', required: false },
  },
};

// Simple validation function (replace with Joi or Zod in production)
const validateSchema = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }

    // Skip further validation if not required and not provided
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type check
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push({ field, message: `${field} must be a string` });
    }
    if (rules.type === 'number' && typeof value !== 'number') {
      errors.push({ field, message: `${field} must be a number` });
    }
    if (rules.type === 'boolean' && typeof value !== 'boolean') {
      errors.push({ field, message: `${field} must be a boolean` });
    }

    // String length
    if (rules.type === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
      }
    }

    // Number range
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push({ field, message: `${field} must be at least ${rules.min}` });
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push({ field, message: `${field} must be at most ${rules.max}` });
      }
    }

    // Pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push({ field, message: `${field} format is invalid` });
    }

    // Enum
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

module.exports = { validateSchema, schemas };