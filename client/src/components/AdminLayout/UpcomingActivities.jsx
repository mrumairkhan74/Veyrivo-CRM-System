import {
    Phone,
    CalendarDays,
    CheckSquare,
    Mail,
    FileText,
    ArrowRight,
} from "lucide-react";
import { useActivities } from "../../store/hooks";

const UpcomingActivities = ({ activities: activitiesProp } = {}) => {
    const {
        activities: activitiesFromStore,
        loading,
        fetchActivities,
    } = useActivities({ limit: 5, sortBy: "scheduled_at", sortOrder: "asc" });

    // Prefer the prop when the parent passes data; otherwise use the store.
    const activities = activitiesProp ?? activitiesFromStore ?? [];

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        Upcoming Activities
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Don't miss your important follow-ups
                    </p>
                </div>

                <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                    View All
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* Activities */}
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                        No upcoming activities.{" "}
                        <button className="ml-1 text-cyan-600 hover:underline">
                            Schedule your first activity
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 text-blue-600">
                                    {getActivityIcon(activity.type)}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-semibold text-slate-800">
                                        {activity.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {formatDateTime(activity.scheduled_at)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Icon per activity type
const getActivityIcon = (type) => {
    switch (type) {
        case "call":
            return <Phone size={18} className="text-green-600" />;
        case "meeting":
            return <CalendarDays size={18} className="text-blue-600" />;
        case "email":
            return <Mail size={18} className="text-purple-600" />;
        case "task":
            return <CheckSquare size={18} className="text-amber-600" />;
        default:
            return <FileText size={18} className="text-slate-600" />;
    }
};

// Local date formatter — no external dependency needed
const formatDateTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    if (isToday) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;

    return `${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    })}, ${time}`;
};

export default UpcomingActivities;