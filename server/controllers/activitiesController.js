const { supabase } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const buildQuery = (req) => {
  let query = supabase.from('activities').select(`
    *,
    owner:profiles!activities_owner_id_fkey(id, full_name, email)
  `, { count: 'exact' });

  if (req.query.type) query = query.eq('type', req.query.type);
  if (req.query.status) query = query.eq('status', req.query.status);
  if (req.query.priority) query = query.eq('priority', req.query.priority);
  if (req.query.related_to && req.query.related_id) {
    query = query.eq('related_to', req.query.related_to).eq('related_id', req.query.related_id);
  }
  if (req.query.owner_id) query = query.eq('owner_id', req.query.owner_id);
  if (req.query.search) {
    query = query.or(`title.ilike.%${req.query.search}%,notes.ilike.%${req.query.search}%`);
  }
  query = query.is('deleted_at', null);

  const sortBy = req.query.sortBy || 'scheduled_at';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  return { query, page, limit };
};

const getActivities = async (req, res, next) => {
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

const getActivity = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        owner:profiles!activities_owner_id_fkey(id, full_name, email)
      `)
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new AppError('Activity not found', 404);
      throw new AppError(error.message, 400);
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const activityData = {
      ...req.body,
      organization_id: req.user.id,
      owner_id: req.body.owner_id || req.user.id,
    };

    const { data, error } = await supabase
      .from('activities')
      .insert(activityData)
      .select(`
        *,
        owner:profiles!activities_owner_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({ data, message: 'Activity created successfully' });
  } catch (error) {
    next(error);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    // Auto-set completed_at when status changes to completed
    if (req.body.status === 'completed' && !req.body.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .select(`
        *,
        owner:profiles!activities_owner_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new AppError('Activity not found', 404);
      throw new AppError(error.message, 400);
    }

    res.json({ data, message: 'Activity updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('activities')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .is('deleted_at', null);

    if (error) throw new AppError(error.message, 400);

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getUpcomingActivities = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        owner:profiles!activities_owner_id_fkey(id, full_name, email)
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .lte('scheduled_at', futureDate.toISOString())
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true })
      .limit(50);

    if (error) throw new AppError(error.message, 400);

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getOverdueActivities = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        owner:profiles!activities_owner_id_fkey(id, full_name, email)
      `)
      .in('status', ['scheduled', 'pending'])
      .lt('scheduled_at', new Date().toISOString())
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true })
      .limit(50);

    if (error) throw new AppError(error.message, 400);

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getActivityStats = async (req, res, next) => {
  try {
    const { data: activities } = await supabase
      .from('activities')
      .select('type, status, priority')
      .is('deleted_at', null);

    const stats = {
      byType: {},
      byStatus: {},
      byPriority: {},
      total: activities?.length || 0,
    };

    (activities || []).forEach(a => {
      stats.byType[a.type] = (stats.byType[a.type] || 0) + 1;
      stats.byStatus[a.status] = (stats.byStatus[a.status] || 0) + 1;
      stats.byPriority[a.priority] = (stats.byPriority[a.priority] || 0) + 1;
    });

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getUpcomingActivities,
  getOverdueActivities,
  getActivityStats,
};