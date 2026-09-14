// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Users,
    Handshake,
    DollarSign,
    TrendingUp,
    Clock,
    Target,
    ArrowUpRight,
    BarChart2,
} from "lucide-react";
import StatsCard from "../../components/AdminLayout/StatusCard";
import PipelineOverview from "../../components/AdminLayout/PipelineOverview";
import RecentLeads from "../../components/AdminLayout/RecentLeads";
import UpcomingActivities from "../../components/AdminLayout/UpcomingActivities";
import LeadSources from "../../components/AdminLayout/LeadSource";
import AIInsights from "../../components/AdminLayout/AIInsight";
import { DashboardSkeleton } from "../../components/AdminLayout/Skeleton";
import { useAuth } from "../../store/hooks";

// Import dummy data
import { leads as dummyLeads } from "../../data/LeadData";
import { ContactsData as dummyContacts } from "../../data/ContactData";

const AdminDashboard = () => {
    const [activeFilter, setActiveFilter] = useState("7 Days");
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLeads: 0,
        activeDeals: 0,
        pipelineValue: 0,
        conversionRate: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        hotLeads: 0,
        followUpsDue: 0
    });

    const { user } = useAuth();
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Admin';

    // Weekly trend data for the featured card
    const weeklyTrendData = useMemo(() => [
        { label: "Week 1", value: 120 },
        { label: "Week 2", value: 135 },
        { label: "Week 3", value: 128 },
        { label: "Week 4", value: 142 },
        { label: "Week 5", value: 155 },
        { label: "Week 6", value: 148 },
        { label: "Week 7", value: 167 },
        { label: "Week 8", value: 172 },
    ], []);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            // Calculate stats from real data
            const leads = dummyLeads;
            const totalLeads = leads.length;
            const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
            const hotLeads = leads.filter(l => l.temperature === 'hot').length;

            // New leads in last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const newLeads = leads.filter(l => new Date(l.created_at) >= sevenDaysAgo).length;

            // Pipeline value
            const pipelineValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

            // Conversion rate
            const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

            // Follow-ups due
            const now = new Date();
            const followUpsDue = leads.filter(l => {
                if (!l.next_follow_up_at) return false;
                return new Date(l.next_follow_up_at) <= now;
            }).length;

            setStats({
                totalLeads,
                activeDeals: qualifiedLeads,
                pipelineValue,
                conversionRate,
                newLeads,
                qualifiedLeads,
                hotLeads,
                followUpsDue
            });

            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const hour = new Date().getHours();
    const greeting =
        hour < 12
            ? "Good Morning"
            : hour < 18
                ? "Good Afternoon"
                : "Good Evening";

    const filters = ["7 Days", "1 Month", "3 Months"];

    // Format currency
    const formatCurrency = (value) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    // Card data with real values
    const cardStatus = [
        {
            title: "Active Deals",
            value: stats.activeDeals.toLocaleString(),
            trend: `${stats.hotLeads} hot leads`,
            description: "vs Last Month",
            icon: <Handshake />,
            color: "from-purple-500 to-purple-600"
        },
        {
            title: "Pipeline Value",
            value: formatCurrency(stats.pipelineValue),
            trend: `${stats.qualifiedLeads} qualified`,
            description: "Opportunities",
            icon: <DollarSign />,
            color: "from-emerald-500 to-emerald-600"
        },
        {
            title: "Conversion Rate",
            value: `${stats.conversionRate.toFixed(1)}%`,
            trend: `${stats.followUpsDue} follow-ups due`,
            description: "vs Last Month",
            icon: <TrendingUp />,
            color: "from-amber-500 to-amber-600"
        },
    ];

    return (
        <section className="min-h-screen w-full rounded-md border border-slate-200 bg-gradient-to-br from-cyan-200/20 to-purple-200/20 p-2 shadow-md md:p-4">

            {/* Header */}
            <div className="m-2 sticky flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">

                {/* Welcome Text */}
                <div>
                    <h1 className="text-xl font-bold tracking-wide text-slate-700 md:text-2xl">
                        {greeting},{" "}
                        <span className="bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                            {userName}
                        </span>
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Here's what's happening with your sales today.
                    </p>
                </div>

                {/* Right Side */}
                <div className="flex flex-wrap items-center gap-3">

                    {/* Date Filters */}
                    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-md px-3 py-2 text-xs font-medium transition md:text-sm ${activeFilter === filter
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                    <Plus size={18} />
                    Add Lead
                </button>

            </div>

            {/* Main Grid - Featured Card on Left, 3 Cards on Right */}
            <div className="m-2 grid grid-cols-1 xl:grid-cols-12 gap-4">
                {/* Featured Card - Total Leads with Chart */}
                <div className="xl:col-span-7 xl:row-span-2">
                    <StatsCard
                        variant="featured"
                        title="Total Leads"
                        value={stats.totalLeads.toLocaleString()}
                        description="New leads this period"
                        trend={null}
                        color="from-blue-500 to-blue-600"
                        chartData={weeklyTrendData}
                        chartWidth={0}
                    />
                </div>

                {/* Three Cards Column */}
                <div className="xl:col-span-5 space-y-4">
                    {cardStatus.map((item) => (
                        <StatsCard
                            key={item.title}
                            title={item.title}
                            trend={item.trend}
                            description={item.description}
                            icon={item.icon}
                            value={item.value}
                            color={item.color}
                        />
                    ))}
                </div>
            </div>

            {/* Pipeline Overview */}
            <div className="m-2 mt-3">
                <PipelineOverview leads={dummyLeads} />
            </div>

            {/* Recent Leads & Upcoming Activities */}
            <div className="m-2 mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <RecentLeads leads={dummyLeads} />
                <UpcomingActivities leads={dummyLeads} contacts={dummyContacts} />
            </div>

            {/* Lead Sources & AI Insights */}
            <div className="m-2 mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <LeadSources leads={dummyLeads} />
                <AIInsights leads={dummyLeads} />
            </div>
        </section>
    );
};

export default AdminDashboard;