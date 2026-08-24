import { useState } from "react";
import {
    Plus, Users,
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
const AdminDashboard = () => {
    const [activeFilter, setActiveFilter] = useState("7 Days");

    const hour = new Date().getHours();

    const greeting =
        hour < 12
            ? "Good Morning"
            : hour < 18
                ? "Good Afternoon"
                : "Good Evening";

    const filters = ["7 Days", "1 Month", "3 Months"];

    const cardStatus = [
        {
            title: "Total Leads",
            value: "1,024",
            trend: "+12.8%",
            description: "vs Last Month",
            icon: <Users />
        },
        {
            title: "Active Deals",
            value: "86",
            trend: "+8%",
            description: "vs Last Month",
            icon: <Handshake />
        },
        {
            title: "Pipeline Value",
            value: "$45,000",
            trend: "+15%",
            description: "vs Last Month",
            icon: <DollarSign />
        },
        {
            title: "Conversion Rate",
            value: "24.5%",
            trend: "+4.2%",
            description: "vs Last Month",
            icon: <TrendingUp />
        },
    ]

    return (
        <section className="min-h-screen w-full rounded-md border border-slate-200 bg-gradient-to-br from-cyan-200/20 to-purple-200/20 p-2 shadow-md md:p-4">

            {/* Header */}
            <div className="m-2  sticky flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">

                {/* Welcome Text */}
                <div>
                    <h1 className="text-xl font-bold tracking-wide text-slate-700 md:text-2xl">
                        {greeting},{" "}
                        <span className="bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                            Admin
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

                    <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                        <Plus size={18} />
                        Add Lead
                    </button>

                </div>
            </div>

            {/* Card */}
            <div className="grid grid-cols-1 m-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cardStatus.map((item) => {
                    return (<StatsCard key={item.title} title={item.title} trend={item.trend} description={item.description} icon={item.icon} value={item.value} />)
                })}
            </div>
            <div className="m-2 mt-3">
                <PipelineOverview />
            </div>
            <div className="m-2 mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <RecentLeads />
                <UpcomingActivities />
            </div>
            <div className="m-2 mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <LeadSources />
                <AIInsights />
            </div>
        </section>
    );
};

export default AdminDashboard;