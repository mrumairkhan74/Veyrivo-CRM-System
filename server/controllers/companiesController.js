const { supabase } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const buildQuery = (req) => {
  let query = supabase.from('companies').select(`
    *,
    industry:industries(id, name),
    source:sources(id, name),
    owner:profiles!companies_owner_id_fkey(id, full_name, email)
  `, { count: 'exact' });

  if (req.query.status) query = query.eq('status', req.query.status);
  if (req.query.company_size) query = query.eq('company_size', req.query.company_size);
  if (req.query.industry_id) query = query.eq('industry_id', req.query.industry_id);
  if (req.query.owner_id) query = query.eq('owner_id', req.query.owner_id);
  if (req.query.search) {
    query = query.or(`name.ilike.%${req.query.search}%,domain.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%`);
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

const getCompanies = async (req, res, next) => {
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

const getCompany = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        industry:industries(id, name),
        source:sources(id, name),
        owner:profiles!companies_owner_id_fkey(id, full_name, email),
        contacts:contacts(id, first_name, last_name, email, title, phone, is_decision_maker),
        leads:leads(id, title, status, temperature, estimated_value)
      `)
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new AppError('Company not found', 404);
      throw new AppError(error.message, 400);
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const createCompany = async (req, res, next) => {
  try {
    const companyData = {
      ...req.body,
      organization_id: req.user.id,
      owner_id: req.body.owner_id || req.user.id,
    };

    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select(`
        *,
        industry:industries(id, name),
        source:sources(id, name),
        owner:profiles!companies_owner_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({ data, message: 'Company created successfully' });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .select(`
        *,
        industry:industries(id, name),
        source:sources(id, name),
        owner:profiles!companies_owner_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new AppError('Company not found', 404);
      throw new AppError(error.message, 400);
    }

    res.json({ data, message: 'Company updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('companies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .is('deleted_at', null);

    if (error) throw new AppError(error.message, 400);

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};