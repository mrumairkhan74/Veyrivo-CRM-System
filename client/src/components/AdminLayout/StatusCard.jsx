import { useState, useEffect, useRef } from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const StatsCard = ({
    title,
    value,
    description,
    icon,
    trend,
    color,
    variant = "default", // "default" | "featured"
    chartData,
    chartWidth,
}) => {
    const [innerWidth, setInnerWidth] = useState(0);
    const chartRef = useRef(null);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setInnerWidth(entry.contentRect.width);
            }
        });
        if (chartRef.current) {
            resizeObserver.observe(chartRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    if (variant === "featured") {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <h2 className="mt-1 text-4xl font-bold text-slate-900">{value}</h2>
                        <p className="mt-2 text-sm text-slate-500">{description}</p>
                    </div>
                </div>

                {/* Growth Rate Chart */}
                <div ref={chartRef} className="h-48 w-full mt-4">
                    {chartData && chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                                    }}
                                    labelFormatter={(label) => `Week ${label}`}
                                    formatter={(value) => [value.toLocaleString(), "Leads"]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#06b6d4"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 6, fill: "#06b6d4", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            No data available
                        </div>
                    )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            ↗ Trending up
                        </span>
                        <span className="text-xs text-slate-500">vs last period</span>
                    </div>
                    <div className="text-xs text-slate-400">Weekly trend</div>
                </div>
            </div>
        );
    }

    // Default variant - smaller card
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-800">{value}</h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 text-blue-600">
                    {icon}
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600">{trend}</span>
                <span className="text-xs text-slate-400">{description}</span>
            </div>
        </div>
    );
};

export default StatsCard;