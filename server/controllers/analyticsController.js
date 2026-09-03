const { supabase } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const getDashboardStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total leads
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('created_at', startDate.toISOString());

    // Qualified leads
    const { count: qualifiedLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('status', 'qualified')
      .gte('created_at', startDate.toISOString());

    // Active deals
    const { count: activeDeals } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .in('stage', ['qualified', 'proposal', 'negotiation']);

    // Won deals
    const { count: wonDeals } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('stage', 'won');

    // Lost deals
    const { count: lostDeals } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('stage', 'lost');

    // Pipeline value
    const { data: pipelineDeals } = await supabase
      .from('deals')
      .select('value, probability')
      .is('deleted_at', null)
      .in('stage', ['qualified', 'proposal', 'negotiation']);

    const pipelineValue = (pipelineDeals || []).reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
    const weightedPipeline = (pipelineDeals || []).reduce((sum, d) => sum + (parseFloat(d.value) || 0) * (parseFloat(d.probability) || 0) / 100, 0);

    // Conversion rate
    const { count: totalLeadsAll } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const conversionRate = totalLeadsAll > 0 ? ((wonDeals / totalLeadsAll) * 100).toFixed(1) : 0;

    // Revenue this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const { data: wonDealsData } = await supabase
      .from('deals')
      .select('value')
      .is('deleted_at', null)
      .eq('stage', 'won')
      .gte('updated_at', thisMonthStart.toISOString());

    const revenueThisMonth = (wonDealsData || []).reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);

    // Revenue last month
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const { data: lastMonthDeals } = await supabase
      .from('deals')
      .select('value')
      .is('deleted_at', null)
      .eq('stage', 'won')
      .gte('updated_at', lastMonthStart.toISOString())
      .lt('updated_at', thisMonthStart.toISOString());

    const revenueLastMonth = (lastMonthDeals || []).reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);

    res.json({
      data: {
        totalLeads: totalLeads || 0,
        qualifiedLeads: qualifiedLeads || 0,
        activeDeals: activeDeals || 0,
        wonDeals: wonDeals || 0,
        lostDeals: lostDeals || 0,
        pipelineValue: Math.round(pipelineValue),
        weightedPipeline: Math.round(weightedPipeline),
        conversionRate: parseFloat(conversionRate),
        avgDealSize: wonDeals > 0 ? Math.round(revenueThisMonth / wonDeals) : 0,
        revenueThisMonth: Math.round(revenueThisMonth),
        revenueLastMonth: Math.round(revenueLastMonth),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPipelineByStage = async (req, res, next) => {
  try {
    const { data: deals } = await supabase
      .from('deals')
      .select('stage, value, probability')
      .is('deleted_at', null);

    const stages = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const result = stages.map(stage => {
      const stageDeals = (deals || []).filter(d => d.stage === stage);
      const totalValue = stageDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
      const weightedValue = stageDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0) * (parseFloat(d.probability) || 0) / 100, 0);
      return {
        stage,
        count: stageDeals.length,
        totalValue: Math.round(totalValue),
        weightedValue: Math.round(weightedValue),
      };
    });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

const getLeadsByStatus = async (req, res, next) => {
  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('status')
      .is('deleted_at', null);

    const statuses = ['new', 'contacted', 'qualified', 'nurture', 'lost'];
    const total = leads?.length || 0;

    const result = statuses.map(status => {
      const count = (leads || []).filter(l => l.status === status).length;
      return {
        status,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
      };
    });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

const getLeadsBySource = async (req, res, next) => {
  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('source_id')
      .is('deleted_at', null);

    const { data: sources } = await supabase
      .from('sources')
      .select('id, name');

    const sourceMap = {};
    (sources || []).forEach(s => { sourceMap[s.id] = s.name; });

    const counts = {};
    (leads || []).forEach(l => {
      const name = l.source_id ? sourceMap[l.source_id] : 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });

    const result = Object.entries(counts).map(([source, count]) => ({ source, count }));
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

const getLeadsByTemperature = async (req, res, next) => {
  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('temperature')
      .is('deleted_at', null);

    const temps = ['hot', 'warm', 'cold', 'unknown'];
    const total = leads?.length || 0;

    const result = temps.map(temp => {
      const count = (leads || []).filter(l => l.temperature === temp).length;
      return {
        temperature: temp,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
      };
    });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const [{ count: leads }, { count: deals }, { data: revenueDeals }] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true })
          .is('deleted_at', null)
          .gte('created_at', start.toISOString())
          .lt('created_at', end.toISOString()),
        supabase.from('deals').select('*', { count: 'exact', head: true })
          .is('deleted_at', null)
          .eq('stage', 'won')
          .gte('updated_at', start.toISOString())
          .lt('updated_at', end.toISOString()),
        supabase.from('deals').select('value')
          .is('deleted_at', null)
          .eq('stage', 'won')
          .gte('updated_at', start.toISOString())
          .lt('updated_at', end.toISOString()),
      ]);

      const revenue = (revenueDeals || []).reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
      const conversion = leads > 0 ? ((deals / leads) * 100).toFixed(1) : 0;

      results.push({
        month: start.toLocaleDateString('en-US', { month: 'short' }),
        leads: leads || 0,
        deals: deals || 0,
        revenue: Math.round(revenue),
        conversion: parseFloat(conversion),
      });
    }

    res.json({ data: results });
  } catch (error) {
    next(error);
  }
};

const getTeamPerformance = async (req, res, next) => {
  try {
    const { data: deals } = await supabase
      .from('deals')
      .select('owner_id, value')
      .is('deleted_at', null)
      .eq('stage', 'won');

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email');

    const ownerMap = {};
    (profiles || []).forEach(p => { ownerMap[p.id] = { name: p.full_name || p.email, email: p.email }; });

    const performance = {};
    (deals || []).forEach(d => {
      const owner = ownerMap[d.owner_id] || { name: 'Unknown', email: '' };
      if (!performance[d.owner_id]) {
        performance[d.owner_id] = { owner, deals: 0, revenue: 0 };
      }
      performance[d.owner_id].deals++;
      performance[d.owner_id].revenue += parseFloat(d.value) || 0;
    });

    const result = Object.entries(performance).map(([id, p]) => ({
      owner: p.owner.name,
      email: p.owner.email,
      deals: p.deals,
      revenue: Math.round(p.revenue),
      avgDeal: p.deals > 0 ? Math.round(p.revenue / p.deals) : 0,
    })).sort((a, b) => b.revenue - a.revenue);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

const getServicePerformance = async (req, res, next) => {
  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('service_id')
      .is('deleted_at', null);

    const { data: deals } = await supabase
      .from('deals')
      .select('service_id')
      .is('deleted_at', null)
      .eq('stage', 'won');

    const { data: services } = await supabase
      .from('services')
      .select('id, name');

    const serviceMap = {};
    (services || []).forEach(s => { serviceMap[s.id] = s.name; });

    const leadCounts = {};
    (leads || []).forEach(l => {
      const name = l.service_id ? serviceMap[l.service_id] : 'Unknown';
      leadCounts[name] = (leadCounts[name] || 0) + 1;
    });

    const dealCounts = {};
    (deals || []).forEach(d => {
      const name = d.service_id ? serviceMap[d.service_id] : 'Unknown';
      dealCounts[name] = (dealCounts[name] || 0) + 1;
    });

    const allServices = new Set([...Object.keys(leadCounts), ...Object.keys(dealCounts)]);
    const result = Array.from(allServices).map(name => ({
      service: name,
      leads: leadCounts[name] || 0,
      deals: dealCounts[name] || 0,
      revenue: 0, // Would need deal values
    }));

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPipelineByStage,
  getLeadsByStatus,
  getLeadsBySource,
  getLeadsByTemperature,
  getMonthlyTrends,
  getTeamPerformance,
  getServicePerformance,
};