const { supabase } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const buildQuery = (req, allowedFilters = []) => {
  let query = supabase.from('leads').select(`
    *,
    company:companies(id, name, domain),
    contact:contacts(id, first_name, last_name, email),
    owner:profiles!leads_owner_id_fkey(id, full_name, email),
    source:sources(id, name),
    service:services(id, name),
    industry:industries(id, name)
  `, { count: 'exact' });

  // Apply filters
  if (req.query.status && allowedFilters.includes('status')) {
    query = query.eq('status', req.query.status);
  }
  if (req.query.temperature && allowedFilters.includes('temperature')) {
    query = query.eq('temperature', req.query.temperature);
  }
  if (req.query.source_id && allowedFilters.includes('source_id')) {
    query = query.eq('source_id', req.query.source_id);
  }
  if (req.query.industry_id && allowedFilters.includes('industry_id')) {
    query = query.eq('industry_id', req.query.industry_id);
  }
  if (req.query.owner_id && allowedFilters.includes('owner_id')) {
    query = query.eq('owner_id', req.query.owner_id);
  }
  if (req.query.company_id && allowedFilters.includes('company_id')) {
    query = query.eq('company_id', req.query.company_id);
  }
  if (req.query.search && allowedFilters.includes('search')) {
    query = query.or(`title.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%,company.ilike.%${req.query.search}%`);
  }

  // Soft delete filter
  query = query.is('deleted_at', null);

  // Sorting
  const sortBy = req.query.sortBy || 'created_at';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  return { query, page, limit };
};

const getLeads = async (req, res, next) => {
  try {
    const { query, page, limit } = buildQuery(req, ['status', 'temperature', 'source_id', 'industry_id', 'owner_id', 'company_id', 'search']);
    const { data, error, count } = await query;

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

const getLead = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        company:companies(id, name, domain, email, phone, website),
        contact:contacts(id, first_name, last_name, email, phone, title),
        owner:profiles!leads_owner_id_fkey(id, full_name, email),
        source:sources(id, name),
        service:services(id, name),
        industry:industries(id, name),
        activities:activities(id, title, type, status, scheduled_at, completed_at, notes)
      `)
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new AppError('Lead not found', 404);
      }
      throw new AppError(error.message, 400);
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const createLead = async (req, res, next) => {
  try {
    const leadData = {
      ...req.body,
      organization_id: req.user.id,
      owner_id: req.body.owner_id || req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select(`
        *,
        company:companies(id, name),
        contact:contacts(id, first_name, last_name, email),
        source:sources(id, name),
        industry:industries(id, name)
      `)
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({ data, message: 'Lead created successfully' });
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      throw new AppError('Lead not found', 404);
    }

    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    // Handle status change to qualified
    if (req.body.status === 'qualified' && (!existing || existing.status !== 'qualified')) {
      updateData.qualified_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .select(`
        *,
        company:companies(id, name),
        contact:contacts(id, first_name, last_name, email),
        source:sources(id, name),
        industry:industries(id, name)
      `)
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({ data, message: 'Lead updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .is('deleted_at', null);

    if (error) throw new AppError(error.message, 400);

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getLeadStats = async (req, res, next) => {
  try {
    // Get counts by status
    const { data: statusCounts } = await supabase
      .from('leads')
      .select('status')
      .is('deleted_at', null);

    const statusStats = (statusCounts || []).reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    // Get counts by temperature
    const { data: tempCounts } = await supabase
      .from('leads')
      .select('temperature')
      .is('deleted_at', null);

    const tempStats = (tempCounts || []).reduce((acc, lead) => {
      acc[lead.temperature] = (acc[lead.temperature] || 0) + 1;
      return acc;
    }, {});

    // Get total value
    const { data: valueData } = await supabase
      .from('leads')
      .select('estimated_value')
      .is('deleted_at', null);

    const totalValue = (valueData || []).reduce((sum, l) => sum + (parseFloat(l.estimated_value) || 0), 0);

    res.json({
      data: {
        byStatus: statusStats,
        byTemperature: tempStats,
        totalValue,
        totalLeads: statusCounts?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
};