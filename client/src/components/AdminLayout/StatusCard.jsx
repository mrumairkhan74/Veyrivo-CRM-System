const StatsCard = ({
    title,
    value,
    description,
    icon,
    trend,
}) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-800">
                        {value}
                    </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 text-blue-600">
                    {icon}
                </div>

            </div>

            <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600">
                    {trend}
                </span>

                <span className="text-xs text-slate-400">
                    {description}
                </span>
            </div>

        </div>
    );
};

export default StatsCard;