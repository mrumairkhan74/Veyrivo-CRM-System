const { supabase } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const buildQuery = (req) => {
  let query = supabase.from('deals').select(`
    *,
    company:companies(id, name),
    contact:contacts(id, first_name, last_name, email),
    lead:leads(id, title),
    owner:profiles!deals_owner_id_fkey(id, full_name, email),
    source:sources(id, name)
  `, { count: 'exact' });

  if (req.query.stage) query = query.eq('stage', req.query.stage);
  if (req.query.owner_id) query = query.eq('owner_id', req.query.owner_id);
  if (req.query.company_id) query = query.eq('company_id', req.query.company_id);
  if (req.query.search) {
    query = query.or(`title.ilike.%${req.query.search}%,company.ilike.%${req.query.search}%`);
  }
  query = query.is('deleted_at', null);

  const sortBy = req.query.sortBy || 'created_at';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  return { query, page, limit };
};

const getDeals = async (req, res, next) => {
  try {
    const { query, page, limit } = buildQuery(req);
    const { data, error, count } = await query;

    if (error) throw new AppError(error.message, 400);

    res.json({
      data,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getDeal = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        company:companies(id, name, domain, email),
        contact:contacts(id, first_name, last_name, email, phone),
        lead:leads(id, title, status),
        owner:profiles!deals_owner_id_fkey(id, full_name, email),
        source:sources(id, name),
        activities:activities(id, title, type, status, scheduled_at, completed_at)
      `)
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new AppError('Deal not found', 404);
      throw new AppError(error.message, 400);
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const createDeal = async (req, res, next) => {
  try {
    const dealData = {
      ...req.body,
      organization_id: req.user.id,
      owner_id: req.body.owner_id || req.user.id,
    };

    const { data, error } = await supabase
      .from('deals')
      .insert(dealData)
      .select(`
        *,
        company:companies(id, name),
        contact:contacts(id, first_name, last_name, email),
        owner:profiles!deals_owner_id_fkey(id, full_name, email),
        source:sources(id, name)
      `)
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({ data, message: 'Deal created successfully' });
  } catch (error) {
    next(error);
  }
};

const updateDeal = async (req, res, next) => {
  try {
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('deals')
      .update(updateData)
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .select(`
        *,
        company:companies(id, name),
        contact:contacts(id, first_name, last_name, email),
        owner:profiles!deals_owner_id_fkey(id, full_name, email),
        source:sources(id, name)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new AppError('Deal not found', 404);
      throw new AppError(error.message, 400);
    }

    res.json({ data, message: 'Deal updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteDeal = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('deals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .is('deleted_at', null);

    if (error) throw new AppError(error.message, 400);

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getDealStats = async (req, res, next) => {
  try {
    const { data: deals } = await supabase
      .from('deals')
      .select('stage, value, probability')
      .is('deleted_at', null);

    const stats = {
      byStage: {},
      totalValue: 0,
      weightedValue: 0,
      totalDeals: deals?.length || 0,
    };

    (deals || []).forEach(d => {
      stats.byStage[d.stage] = (stats.byStage[d.stage] || 0) + 1;
      stats.totalValue += parseFloat(d.value) || 0;
      stats.weightedValue += (parseFloat(d.value) || 0) * (parseFloat(d.probability) || 0) / 100;
    });

    stats.weightedValue = Math.round(stats.weightedValue);

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealStats,
};