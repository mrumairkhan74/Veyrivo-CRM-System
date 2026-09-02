export const analyticsData = {
    // Pipeline by stage
    pipelineByStage: [
        { stage: 'New', count: 8, value: 45000, weighted: 4500 },
        { stage: 'Qualified', count: 12, value: 85000, weighted: 21250 },
        { stage: 'Proposal', count: 6, value: 72000, weighted: 36000 },
        { stage: 'Negotiation', count: 4, value: 48000, weighted: 40800 },
        { stage: 'Won', count: 15, value: 125000, weighted: 125000 },
        { stage: 'Lost', count: 7, value: 35000, weighted: 0 },
    ],

    // Lead status distribution
    leadsByStatus: [
        { status: 'New', count: 28, percentage: 22 },
        { status: 'Contacted', count: 35, percentage: 28 },
        { status: 'Qualified', count: 22, percentage: 18 },
        { status: 'Nurture', count: 25, percentage: 20 },
        { status: 'Lost', count: 15, percentage: 12 },
    ],

    // Lead sources
    leadsBySource: [
        { source: 'LinkedIn', count: 32, conversion: 18 },
        { source: 'Referral', count: 18, conversion: 35 },
        { source: 'Website', count: 25, conversion: 22 },
        { source: 'Cold Email', count: 15, conversion: 8 },
        { source: 'Google Search', count: 12, conversion: 15 },
        { source: 'Facebook', count: 8, conversion: 5 },
        { source: 'Trade Show', count: 5, conversion: 25 },
    ],

    // Monthly trends (last 6 months)
    monthlyTrends: [
        { month: 'Mar', leads: 45, deals: 12, revenue: 35000, conversion: 26.7 },
        { month: 'Apr', leads: 52, deals: 15, revenue: 42000, conversion: 28.8 },
        { month: 'May', leads: 48, deals: 14, revenue: 38000, conversion: 29.2 },
        { month: 'Jun', leads: 61, deals: 18, revenue: 52000, conversion: 29.5 },
        { month: 'Jul', leads: 55, deals: 16, revenue: 45000, conversion: 29.1 },
        { month: 'Aug', leads: 58, deals: 17, revenue: 48000, conversion: 29.3 },
    ],

    // Team performance
    teamPerformance: [
        { owner: 'Ahmed Khan', leads: 22, deals: 8, revenue: 35000, avgDeal: 4375 },
        { owner: 'Sarah Ahmed', leads: 18, deals: 7, revenue: 28000, avgDeal: 4000 },
        { owner: 'Muhammad Ali', leads: 15, deals: 5, revenue: 18000, avgDeal: 3600 },
        { owner: 'Fatima Hassan', leads: 12, deals: 4, revenue: 22000, avgDeal: 5500 },
        { owner: 'Usman Tariq', leads: 10, deals: 3, revenue: 12000, avgDeal: 4000 },
    ],

    // Lead temperature
    leadsByTemperature: [
        { temperature: 'Hot', count: 18, percentage: 14 },
        { temperature: 'Warm', count: 42, percentage: 33 },
        { temperature: 'Cold', count: 35, percentage: 28 },
        { temperature: 'Unknown', count: 30, percentage: 24 },
    ],

    // Service performance
    servicePerformance: [
        { service: 'Website Development', leads: 25, deals: 8, revenue: 32000 },
        { service: 'CRM Development', leads: 15, deals: 6, revenue: 45000 },
        { service: 'Mobile App', leads: 12, deals: 4, revenue: 38000 },
        { service: 'SEO/Marketing', leads: 18, deals: 5, revenue: 15000 },
        { service: 'AI/Automation', leads: 8, deals: 2, revenue: 18000 },
        { service: 'Cloud Migration', leads: 5, deals: 2, revenue: 12000 },
    ],

    // KPI Summary
    kpis: {
        totalLeads: 125,
        qualifiedLeads: 42,
        activeDeals: 30,
        wonDeals: 15,
        lostDeals: 7,
        pipelineValue: 250000,
        weightedPipeline: 127550,
        conversionRate: 24.5,
        avgDealSize: 4200,
        avgSalesCycle: 45,
        revenueThisMonth: 48000,
        revenueLastMonth: 45000,
    },
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};