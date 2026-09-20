import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Handshake,
    DollarSign,
    TrendingUp,
} from "lucide-react";
import StatsCard from "../../components/AdminLayout/StatusCard";
import PipelineOverview from "../../components/AdminLayout/PipelineOverview";
import RecentLeads from "../../components/AdminLayout/RecentLeads";
import UpcomingActivities from "../../components/AdminLayout/UpcomingActivities";
import LeadSources from "../../components/AdminLayout/LeadSource";
import AIInsights from "../../components/AdminLayout/AIInsight";
import { DashboardSkeleton } from "../../components/AdminLayout/Skeleton";
import {
    useAuth,
    useDashboard,
    useLeads,
    useDeals,
    useActivities,
} from "../../store/hooks";

const AdminDashboard = () => {
    const [activeFilter, setActiveFilter] = useState("7 Days");
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useAuth();
    const userName =
        user?.full_name || user?.email?.split("@")[0] || "Admin";

    // Real data from Zustand stores (via hooks)
    const { leads, loading: leadsLoading, fetchLeads } = useLeads();
    const { deals, loading: dealsLoading, fetchDeals } = useDeals();
    const {
        activities,
        loading: activitiesLoading,
        fetchActivities,
    } = useActivities();
    const {
        pipelineByStage,
        leadsByStatus,
        monthlyTrends,
        teamPerformance,
        loading: dashboardLoading,
        fetchStats,
    } = useDashboard();

    // Weekly trend data for the featured card — derived from monthlyTrends
    const weeklyTrendData = useMemo(() => {
        if (monthlyTrends && monthlyTrends.length > 0) {
            return monthlyTrends.slice(-8).map((item) => ({
                label: item.month,
                value: item.leads,
            }));
        }
        return [];
    }, [monthlyTrends]);

    // Fetch everything once on mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchLeads({ limit: 100 }),
                    fetchDeals({ limit: 100 }),
                    fetchActivities({ limit: 50 }),
                    fetchStats(30),
                ]);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [fetchLeads, fetchDeals, fetchActivities, fetchStats]);

    // Greeting based on time of day
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    const filters = ["7 Days", "1 Month", "3 Months"];

    const formatCurrency = (value = 0) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
    };

    // Derived stats — built from the hook values, not the store directly
    const realStats = useMemo(() => {
        const safeLeads = leads || [];
        const safeDeals = deals || [];
        const safeActivities = activities || [];

        const totalLeads = safeLeads.length;

        const qualifiedLeads = safeLeads.filter(
            (l) => l.status === "qualified"
        ).length;

        const hotLeads = safeLeads.filter(
            (l) => l.temperature === "hot"
        ).length;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newLeads = safeLeads.filter(
            (l) => new Date(l.created_at) >= sevenDaysAgo
        ).length;

        const pipelineValue = safeDeals.reduce(
            (sum, d) => sum + (d.value || 0),
            0
        );

        const conversionRate =
            totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

        const followUpsDue = safeActivities.filter((a) => {
            if (!a.scheduled_at) return false;
            return new Date(a.scheduled_at) <= new Date();
        }).length;

        const activeDeals = safeDeals.filter((d) =>
            ["qualified", "proposal", "negotiation"].includes(d.stage)
        ).length;

        return {
            totalLeads,
            qualifiedLeads,
            hotLeads,
            newLeads,
            pipelineValue,
            conversionRate: Math.round(conversionRate * 10) / 10,
            activeDeals,
            followUpsDue,
        };
    }, [leads, deals, activities]);

    const cardStatus = [
        {
            title: "Active Deals",
            value: realStats.activeDeals.toLocaleString(),
            trend: `${realStats.hotLeads} hot leads`,
            description: "vs Last Month",
            icon: <Handshake />,
            color: "from-purple-500 to-purple-600",
        },
        {
            title: "Pipeline Value",
            value: formatCurrency(realStats.pipelineValue),
            trend: `${realStats.qualifiedLeads} qualified`,
            description: "Opportunities",
            icon: <DollarSign />,
            color: "from-emerald-500 to-emerald-600",
        },
        {
            title: "Conversion Rate",
            value: `${realStats.conversionRate.toFixed(1)}%`,
            trend: `${realStats.followUpsDue} follow-ups due`,
            description: "vs Last Month",
            icon: <TrendingUp />,
            color: "from-amber-500 to-amber-600",
        },
    ];

    const isDataLoading =
        isLoading ||
        dashboardLoading ||
        leadsLoading ||
        dealsLoading ||
        activitiesLoading;

    if (isDataLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <section className="min-h-screen w-full rounded-md border border-slate-200 bg-gradient-to-br from-cyan-200/20 to-purple-200/20 p-2 shadow-md md:p-4">
            {/* Header */}
            <div className="m-2 sticky flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
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

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-md px-3 py-2 text-xs font-medium transition md:text-sm ${
                                    activeFilter === filter
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                        <Plus size={18} />
                        Add Lead
                    </button>
                </div>
            </div>

            {/* Main Grid — featured card on the left, three cards on the right */}
            <div className="m-2 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-7 xl:row-span-2">
                    <StatsCard
                        variant="featured"
                        title="Total Leads"
                        value={realStats.totalLeads.toLocaleString()}
                        description="New leads this period"
                        trend={null}
                        color="from-blue-500 to-blue-600"
                        chartData={weeklyTrendData}
                        chartWidth={0}
                    />
                </div>

                <div className="space-y-4 xl:col-span-5">
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
                <PipelineOverview
                    leads={leads}
                    deals={deals}
                    pipelineByStage={pipelineByStage}
                />
            </div>

            {/* Recent Leads & Upcoming Activities */}
            <div className="m-2 mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <RecentLeads leads={leads} />
                <UpcomingActivities activities={activities} />
            </div>

            {/* Lead Sources & AI Insights */}
            <div className="m-2 mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <LeadSources leads={leads} leadsByStatus={leadsByStatus} />
                <AIInsights leads={leads} teamPerformance={teamPerformance} />
            </div>
        </section>
    );
};

export default AdminDashboard;