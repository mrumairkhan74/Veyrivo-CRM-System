import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Users, Target, Activity,
    RefreshCw, Download, WifiOff,
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    FunnelChart, Funnel,
} from 'recharts';
import { useAnalytics } from '../../store/hooks';
import { useRealtimeAnalytics } from '../../data/AnalyticsData';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];
const TEMP_COLORS = { hot: '#ef4444', warm: '#f59e0b', cold: '#64748b', unknown: '#cbd5e1' };

const fmtNum = (n) => new Intl.NumberFormat('en-US').format(n ?? 0);
const fmtCur = (v) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(v ?? 0);
const fmtCompact = (v) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v ?? 0);

/* ================================================================
   Layout shells
   ================================================================ */

const Card = ({ className = '', children }) => (
    <div
        className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
        {children}
    </div>
);

const ChartCard = ({ title, subtitle, children, empty, height = 'h-[280px] sm:h-[320px]' }) => (
    <Card className="flex flex-col p-4 sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>

        <div className={`${height} min-w-0`}>
            {empty ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                    <Activity className="h-6 w-6" />
                    <p className="text-xs">No data for this range</p>
                </div>
            ) : (
                children
            )}
        </div>
    </Card>
);

/* ================================================================
   KPI cards
   ================================================================ */

const TONES = {
    cyan:    { grad: 'from-cyan-500 to-cyan-600',       ring: 'ring-cyan-100' },
    violet:  { grad: 'from-violet-500 to-violet-600',   ring: 'ring-violet-100' },
    emerald: { grad: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-100' },
    amber:   { grad: 'from-amber-500 to-amber-600',     ring: 'ring-amber-100' },
    indigo:  { grad: 'from-indigo-500 to-indigo-600',   ring: 'ring-indigo-100' },
    rose:    { grad: 'from-rose-500 to-rose-600',       ring: 'ring-rose-100' },
};

const KPICard = ({ label, value, change, icon: Icon, tone = 'cyan', format = 'number' }) => {
    const display =
        format === 'currency' ? fmtCur(value)
        : format === 'percent' ? `${value ?? 0}%`
        : fmtNum(value);

    const t = TONES[tone] ?? TONES.cyan;
    const hasChange = change !== undefined && change !== null && Number.isFinite(change);
    const positive = hasChange && change >= 0;

    return (
        <Card className="group relative overflow-hidden p-4 sm:p-5">
            <div
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${t.grad} opacity-[0.08] transition-opacity group-hover:opacity-[0.12]`}
            />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {label}
                    </p>
                    <p className="mt-1.5 truncate text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">
                        {display}
                    </p>
                    <div className="mt-1 h-4">
                        {hasChange && (
                            <span
                                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                    positive ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                            >
                                {positive ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {Math.abs(change)}%
                                <span className="text-slate-400">vs prev</span>
                            </span>
                        )}
                    </div>
                </div>

                <div
                    className={`shrink-0 rounded-xl bg-gradient-to-br ${t.grad} p-2 shadow-sm ring-4 ${t.ring} sm:p-2.5`}
                >
                    <Icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </div>
            </div>
        </Card>
    );
};

const KPISkeleton = () => (
    <Card className="animate-pulse p-4 sm:p-5">
        <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
                <div className="h-2.5 w-20 rounded bg-slate-200" />
                <div className="h-6 w-16 rounded bg-slate-200" />
                <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
            <div className="h-9 w-9 rounded-xl bg-slate-200 sm:h-10 sm:w-10" />
        </div>
    </Card>
);

/* ================================================================
   Recharts shared bits
   ================================================================ */

const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
    fontSize: 12,
    padding: '8px 10px',
};

const axisTick = { fill: '#64748b', fontSize: 11 };

/* ================================================================
   Charts
   ================================================================ */

const PipelineFunnel = ({ data }) => {
    const empty = !data?.length;
    return (
        <ChartCard title="Pipeline Funnel" subtitle="Deals by stage" empty={empty}>
            <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                    <Funnel dataKey="count" nameKey="stage" data={data} stroke="none" isAnimationActive={false}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Funnel>
                    <Tooltip formatter={(v) => [fmtNum(v), 'Count']} contentStyle={tooltipStyle} />
                </FunnelChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

const LeadStatusPie = ({ data }) => {
    const empty = !data?.length;
    return (
        <ChartCard title="Leads by Status" subtitle="Distribution across statuses" empty={empty}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="45%"
                        outerRadius="75%"
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="status"
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(v) => [fmtNum(v), 'Count']} contentStyle={tooltipStyle} />
                    <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={8}
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

const LeadsBySource = ({ data }) => {
    const empty = !data?.length;
    return (
        <ChartCard title="Leads by Source" subtitle="Where your leads come from" empty={empty}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis
                        dataKey="source"
                        type="category"
                        width={90}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(v) => [fmtNum(v), 'Leads']}
                        contentStyle={tooltipStyle}
                        cursor={{ fill: '#f1f5f9' }}
                    />
                    <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} name="Leads" maxBarSize={22} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

const MonthlyTrends = ({ data }) => {
    const empty = !data?.length;
    return (
        <ChartCard title="Monthly Trends" subtitle="Leads, deals, and revenue over time" empty={empty}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={fmtCompact} />
                    <Tooltip
                        formatter={(v, name) => {
                            if (name === 'revenue') return [fmtCur(v), 'Revenue'];
                            if (name === 'conversion') return [`${v}%`, 'Conversion'];
                            return [fmtNum(v), name];
                        }}
                        contentStyle={tooltipStyle}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={8}
                    />
                    <Line
                        type="monotone"
                        dataKey="leads"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        name="Leads"
                    />
                    <Line
                        type="monotone"
                        dataKey="deals"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        name="Deals Won"
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        name="Revenue"
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

const TeamPerformance = ({ data }) => {
    const empty = !data?.length;
    return (
        <ChartCard title="Team Performance" subtitle="Revenue by owner" empty={empty}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis
                        type="number"
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={fmtCompact}
                    />
                    <YAxis
                        dataKey="owner"
                        type="category"
                        width={90}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(v) => [fmtCur(v), 'Revenue']}
                        contentStyle={tooltipStyle}
                        cursor={{ fill: '#f1f5f9' }}
                    />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Revenue" maxBarSize={22} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

const ServicePerformance = ({ data }) => {
    const empty = !data?.length;
    return (
        <ChartCard
            title="Service Performance"
            subtitle="Revenue and deals by service"
            empty={empty}
            height="h-[300px] sm:h-[360px]"
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis
                        type="number"
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={fmtCompact}
                    />
                    <YAxis
                        dataKey="service"
                        type="category"
                        width={130}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(v, name) => [
                            name === 'deals' ? fmtNum(v) : fmtCur(v),
                            name === 'revenue' ? 'Revenue' : 'Deals',
                        ]}
                        contentStyle={tooltipStyle}
                        cursor={{ fill: '#f1f5f9' }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={8}
                    />
                    <Bar dataKey="revenue" fill="#06b6d4" radius={[0, 6, 6, 0]} name="Revenue" maxBarSize={18} />
                    <Bar dataKey="deals" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Deals" maxBarSize={18} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

const LeadTemperaturePie = ({ data }) => {
    const empty = !data?.length;
    return (
        <ChartCard title="Leads by Temperature" subtitle="Hot, warm, cold distribution" empty={empty}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="45%"
                        outerRadius="75%"
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="temperature"
                    >
                        {data.map((entry, i) => (
                            <Cell
                                key={i}
                                fill={TEMP_COLORS[entry.temperature] || COLORS[i % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip formatter={(v) => [fmtNum(v), 'Count']} contentStyle={tooltipStyle} />
                    <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={8}
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

/* ================================================================
   Live badge
   ================================================================ */

const LiveBadge = ({ connected }) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            connected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
    >
        {connected ? (
            <>
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live
            </>
        ) : (
            <>
                <WifiOff className="h-3 w-3" />
                Offline
            </>
        )}
    </span>
);

/* ================================================================
   Page
   ================================================================ */

const DATE_RANGES = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last Year' },
];

const Analytics = () => {
    const [dateRange, setDateRange] = useState('6m');
    const [lastUpdated, setLastUpdated] = useState(null);

    const {
        stats,
        pipelineByStage,
        leadsByStatus,
        leadsBySource,
        monthlyTrends,
        teamPerformance,
        servicePerformance,
        leadsByTemperature,
        loading,
        fetchStats,
    } = useAnalytics();

    const refreshTimer = useRef(null);
    const scheduleRefetch = useCallback(() => {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = setTimeout(async () => {
            await fetchStats(dateRange);
            setLastUpdated(new Date());
        }, 800);
    }, [dateRange, fetchStats]);

    const { isConnected } = useRealtimeAnalytics(scheduleRefetch);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await fetchStats(dateRange);
            if (!cancelled) setLastUpdated(new Date());
        })();
        return () => {
            cancelled = true;
            clearTimeout(refreshTimer.current);
        };
    }, [dateRange, fetchStats]);

    const handleManualRefresh = useCallback(async () => {
        await fetchStats(dateRange);
        setLastUpdated(new Date());
    }, [dateRange, fetchStats]);

    const handleExport = useCallback(() => {
        const rows = [
            ['Metric', 'Value'],
            ['Total Leads', stats?.totalLeads ?? 0],
            ['Qualified Leads', stats?.qualifiedLeads ?? 0],
            ['Active Deals', stats?.activeDeals ?? 0],
            ['Conversion Rate (%)', stats?.conversionRate ?? 0],
            ['Pipeline Value', stats?.pipelineValue ?? 0],
            ['Revenue This Month', stats?.revenueThisMonth ?? 0],
            [],
            ['Stage', 'Deals', 'Total Value'],
            ...(pipelineByStage || []).map((r) => [r.stage, r.count, r.value ?? 0]),
            [],
            ['Status', 'Count'],
            ...(leadsByStatus || []).map((r) => [r.status, r.count]),
            [],
            ['Source', 'Count'],
            ...(leadsBySource || []).map((r) => [r.source, r.count]),
        ];

        const csv = rows
            .map((row) =>
                row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
            )
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analytics-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, [stats, pipelineByStage, leadsByStatus, leadsBySource, dateRange]);

    const kpis = stats || {};
    const revenueChange = useMemo(() => {
        const current = Number(kpis.revenueThisMonth) || 0;
        const prev = Number(kpis.revenueLastMonth) || 0;
        if (!prev) return null;
        return Number((((current - prev) / prev) * 100).toFixed(1));
    }, [kpis.revenueThisMonth, kpis.revenueLastMonth]);

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-5 px-1 sm:space-y-6">
            {/* ---------- Header ---------- */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Analytics</h1>
                        <LiveBadge connected={isConnected} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Track your sales performance and pipeline health
                        {lastUpdated && (
                            <span className="ml-2 text-slate-400">
                                · updated{' '}
                                {lastUpdated.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="h-9 min-w-[130px] flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 sm:flex-none"
                    >
                        {DATE_RANGES.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleExport}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden xs:inline sm:inline">Export</span>
                    </button>

                    <button
                        onClick={handleManualRefresh}
                        disabled={loading}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden xs:inline sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* ---------- KPI grid ---------- */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                {loading && !stats ? (
                    [...Array(6)].map((_, i) => <KPISkeleton key={i} />)
                ) : (
                    <>
                        <KPICard label="Total Leads" value={kpis.totalLeads} icon={Users} tone="cyan" />
                        <KPICard label="Qualified" value={kpis.qualifiedLeads} icon={Target} tone="violet" />
                        <KPICard label="Active Deals" value={kpis.activeDeals} icon={Activity} tone="amber" />
                        <KPICard
                            label="Conversion"
                            value={kpis.conversionRate}
                            format="percent"
                            icon={TrendingUp}
                            tone="emerald"
                        />
                        <KPICard
                            label="Pipeline"
                            value={kpis.pipelineValue}
                            format="currency"
                            icon={DollarSign}
                            tone="indigo"
                        />
                        <KPICard
                            label="Revenue (Mo)"
                            value={kpis.revenueThisMonth}
                            change={revenueChange}
                            format="currency"
                            icon={DollarSign}
                            tone="rose"
                        />
                    </>
                )}
            </div>

            {/* ---------- Row 1: two main charts ---------- */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
                <PipelineFunnel data={pipelineByStage} />
                <LeadStatusPie data={leadsByStatus} />
            </div>

            {/* ---------- Row 2 ---------- */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
                <LeadsBySource data={leadsBySource} />
                <LeadTemperaturePie data={leadsByTemperature} />
            </div>

            {/* ---------- Row 3 ---------- */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
                <MonthlyTrends data={monthlyTrends} />
                <TeamPerformance data={teamPerformance} />
            </div>

            {/* ---------- Row 4: full-width service ---------- */}
            <ServicePerformance data={servicePerformance} />
        </div>
    );
};

export default Analytics;