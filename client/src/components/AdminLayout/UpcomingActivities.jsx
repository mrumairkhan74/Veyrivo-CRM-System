import {
    Phone,
    CalendarDays,
    CheckSquare,
    ArrowRight,
} from "lucide-react";

const UpcomingActivities = () => {
    const activities = [
        {
            title: "Call John Smith",
            time: "Today, 2:00 PM",
            icon: <Phone size={18} />,
        },
        {
            title: "Meeting with ABC Technologies",
            time: "Today, 4:30 PM",
            icon: <CalendarDays size={18} />,
        },
        {
            title: "Send proposal to Sarah Ali",
            time: "Tomorrow, 10:00 AM",
            icon: <CheckSquare size={18} />,
        },
        {
            title: "Follow up with Digital Solutions",
            time: "Tomorrow, 2:30 PM",
            icon: <Phone size={18} />,
        },
    ];

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
                {activities.map((activity, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 text-blue-600">
                            {activity.icon}
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-800">
                                {activity.title}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                {activity.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingActivities;