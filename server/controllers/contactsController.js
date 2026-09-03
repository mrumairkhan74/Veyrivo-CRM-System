const { supabase } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const buildQuery = (req) => {
  let query = supabase.from('contacts').select(`
    *,
    company:companies(id, name, domain),
    source:sources(id, name),
    owner:profiles!contacts_owner_id_fkey(id, full_name, email)
  `, { count: 'exact' });

  if (req.query.status) query = query.eq('status', req.query.status);
  if (req.query.company_id) query = query.eq('company_id', req.query.company_id);
  if (req.query.is_decision_maker !== undefined) query = query.eq('is_decision_maker', req.query.is_decision_maker === 'true');
  if (req.query.consent_status) query = query.eq('consent_status', req.query.consent_status);
  if (req.query.owner_id) query = query.eq('owner_id', req.query.owner_id);
  if (req.query.search) {
    query = query.or(`first_name.ilike.%${req.query.search}%,last_name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%`);
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

const getContacts = async (req, res, next) => {
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

const getContact = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        company:companies(id, name, domain, email, phone, website),
        source:sources(id, name),
        owner:profiles!contacts_owner_id_fkey(id, full_name, email),
        leads:leads(id, title, status, temperature, estimated_value)
      `)
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new AppError('Contact not found', 404);
      throw new AppError(error.message, 400);
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const contactData = {
      ...req.body,
      organization_id: req.user.id,
      owner_id: req.body.owner_id || req.user.id,
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select(`
        *,
        company:companies(id, name),
        source:sources(id, name),
        owner:profiles!contacts_owner_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({ data, message: 'Contact created successfully' });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .select(`
        *,
        company:companies(id, name),
        source:sources(id, name),
        owner:profiles!contacts_owner_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new AppError('Contact not found', 404);
      throw new AppError(error.message, 400);
    }

    res.json({ data, message: 'Contact updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .is('deleted_at', null);

    if (error) throw new AppError(error.message, 400);

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getContactStats = async (req, res, next) => {
  try {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('status, is_decision_maker, consent_status')
      .is('deleted_at', null);

    const stats = {
      byStatus: {},
      decisionMakers: 0,
      byConsent: {},
      total: contacts?.length || 0,
    };

    (contacts || []).forEach(c => {
      stats.byStatus[c.status] = (stats.byStatus[c.status] || 0) + 1;
      if (c.is_decision_maker) stats.decisionMakers++;
      stats.byConsent[c.consent_status] = (stats.byConsent[c.consent_status] || 0) + 1;
    });

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactStats,
};