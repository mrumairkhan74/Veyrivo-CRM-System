import { useState,useEffect } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Users, Target, Activity,
    RefreshCw, Download
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    FunnelChart, Funnel
} from 'recharts';
import { useAnalytics } from '../../store/hooks';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

const KPICard = ({ label, value, change, icon: Icon, color, format = 'number' }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                    {format === 'currency' ? formatCurrency(value) : format === 'percent' ? `${value}%` : formatNumber(value)}
                </p>
                {change !== undefined && (
                    <p className={`mt-1 text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'} flex items-center gap-1`}>
                        {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(change)}% vs last period
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64">{children}</div>
    </div>
);

const PipelineFunnel = ({ data }) => (
    <ChartCard title="Pipeline Funnel">
        <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
                <Funnel
                    dataKey="count"
                    nameKey="stage"
                    data={data}
                    stroke="none"
                    isAnimationActive={false}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Funnel>
                <Tooltip
                    formatter={(value) => [new Intl.NumberFormat('en-US').format(value), 'Count']}
                    labelFormatter={(label) => label}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
            </FunnelChart>
        </ResponsiveContainer>
    </ChartCard>
);

const LeadStatusPie = ({ data }) => (
    <ChartCard title="Leads by Status">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, percentage }) => `${status} ${percentage}%`}
                    labelLine={false}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => [new Intl.NumberFormat('en-US').format(value), 'Count']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </ChartCard>
);

const LeadsBySource = ({ data }) => (
    <ChartCard title="Leads by Source">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: '#64748b' }} />
                <YAxis dataKey="source" type="category" width={100} tick={{ fill: '#64748b' }} />
                <Tooltip
                    formatter={(value, name) => [new Intl.NumberFormat('en-US').format(value), name === 'count' ? 'Leads' : 'Conversion %']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Leads" />
            </BarChart>
        </ResponsiveContainer>
    </ChartCard>
);

const MonthlyTrends = ({ data }) => (
    <ChartCard title="Monthly Trends (6 Months)">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip
                    formatter={(value, name) => {
                        if (name === 'revenue') return [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), 'Revenue'];
                        if (name === 'conversion') return [`${value}%`, 'Conversion'];
                        return [new Intl.NumberFormat('en-US').format(value), name];
                    }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                    name="Leads"
                />
                <Line
                    type="monotone"
                    dataKey="deals"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    name="Deals Won"
                />
                <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                    name="Revenue"
                    yAxisId="right"
                />
            </LineChart>
        </ResponsiveContainer>
    </ChartCard>
);

const TeamPerformance = ({ data }) => (
    <ChartCard title="Team Performance (Revenue)">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: '#64748b' }} tickFormatter={(v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)} />
                <YAxis dataKey="owner" type="category" width={100} tick={{ fill: '#64748b' }} />
                <Tooltip
                    formatter={(value) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), 'Revenue']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Revenue" />
            </BarChart>
        </ResponsiveContainer>
    </ChartCard>
);

const ServicePerformance = ({ data }) => (
    <ChartCard title="Service Performance">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: '#64748b' }} tickFormatter={(v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)} />
                <YAxis dataKey="service" type="category" width={140} tick={{ fill: '#64748b' }} />
                <Tooltip
                    formatter={(value, name) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), name === 'revenue' ? 'Revenue' : 'Deals']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Revenue" />
                <Bar dataKey="deals" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Deals" />
            </BarChart>
        </ResponsiveContainer>
    </ChartCard>
);

const LeadTemperaturePie = ({ data }) => (
    <ChartCard title="Leads by Temperature">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="temperature"
                    label={({ temperature, percentage }) => `${temperature} ${percentage}%`}
                    labelLine={false}
                >
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#64748b" />
                    <Cell fill="#94a3b8" />
                </Pie>
                <Tooltip
                    formatter={(value) => [new Intl.NumberFormat('en-US').format(value), 'Count']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </ChartCard>
);

const Analytics = () => {
    const [dateRange, setDateRange] = useState('6m');
    const [isLoading, setIsLoading] = useState(false);
    const { stats, pipelineByStage, leadsByStatus, leadsBySource, monthlyTrends, teamPerformance, servicePerformance, leadsByTemperature, loading, fetchStats } = useAnalytics();

    const dateRangeOptions = [
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '3m', label: 'Last 3 Months' },
        { value: '6m', label: 'Last 6 Months' },
        { value: '1y', label: 'Last Year' },
    ];

    const kpis = stats || {};
    const revenueChange = kpis.revenueThisMonth && kpis.revenueLastMonth
        ? ((kpis.revenueThisMonth - kpis.revenueLastMonth) / kpis.revenueLastMonth * 100).toFixed(1)
        : 0;

    useEffect(() => {
        fetchStats(dateRange);
    }, [dateRange]);

    useEffect(() => {
        fetchStats(dateRange);
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your sales performance and pipeline health</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    >
                        {dateRangeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 800); }} disabled={isLoading || loading} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm">
                        <RefreshCw className={`w-4 h-4 ${isLoading || loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard label="Total Leads" value={kpis.totalLeads || 0} change={12.8} icon={Users} color="bg-blue-500" />
                <KPICard label="Qualified Leads" value={kpis.qualifiedLeads || 0} change={8.2} icon={Target} color="bg-purple-500" />
                <KPICard label="Active Deals" value={kpis.activeDeals || 0} change={5.1} icon={Activity} color="bg-amber-500" />
                <KPICard label="Conversion Rate" value={kpis.conversionRate || 0} change={4.2} format="percent" icon={TrendingUp} color="bg-emerald-500" />
                <KPICard label="Pipeline Value" value={kpis.pipelineValue || 0} change={15.3} format="currency" icon={DollarSign} color="bg-cyan-500" />
                <KPICard label="Revenue (Month)" value={kpis.revenueThisMonth || 0} change={parseFloat(revenueChange)} format="currency" icon={DollarSign} color="bg-indigo-500" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PipelineFunnel data={pipelineByStage || []} />
                <LeadStatusPie data={leadsByStatus || []} />
                <LeadsBySource data={leadsBySource || []} />
                <LeadTemperaturePie data={leadsByTemperature || []} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MonthlyTrends data={monthlyTrends || []} />
                <TeamPerformance data={teamPerformance || []} />
            </div>

            <ServicePerformance data={servicePerformance || []} />
        </div>
    );
};

export default Analytics;