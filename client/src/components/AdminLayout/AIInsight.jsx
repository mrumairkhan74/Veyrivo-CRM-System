import { useMemo } from "react";
import { BrainCircuit, Flame, ArrowRight, Sparkles } from "lucide-react";
import { useAI } from "../../store/hooks";

const AIInsights = ({ history: historyProp } = {}) => {
    const { history: historyFromStore, loading, fetchHistory } = useAI();

    // Prefer the prop, fall back to store
    const history = historyProp ?? historyFromStore ?? [];

    const insights = useMemo(() => {
        if (!history || history.length === 0) {
            return [
                {
                    id: "empty",
                    title: "No insights yet",
                    message: "Generate AI insights to see opportunities",
                    score: "0/100",
                    action: "Generate insights",
                    icon: <BrainCircuit size={20} />,
                },
            ];
        }

        return history.slice(0, 3).map((item, idx) => ({
            id: item.id ?? idx,
            title: item.input_data?.company || "Unknown Company",
            message: item.output_data?.summary || "AI analysis completed",
            score: `${item.output_data?.score || 0}/100`,
            action:
                item.output_data?.recommended_action || "Review insights",
            icon:
                item.output_data?.temperature === "hot" ? (
                    <Flame size={20} />
                ) : (
                    <Sparkles size={20} />
                ),
        }));
    }, [history]);

    return (
        <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <BrainCircuit size={22} className="text-purple-600" />
                        <h2 className="text-lg font-bold text-slate-800">
                            AI Insights
                        </h2>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        Opportunities that need your attention
                    </p>
                </div>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                    AI Powered
                </span>
            </div>

            {/* Insights */}
            <div className="space-y-4">
                {insights.map((insight) => (
                    <div
                        key={insight.id}
                        className="rounded-xl border border-slate-100 bg-gradient-to-r from-cyan-50/50 to-purple-50/50 p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm">
                                {insight.icon}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="font-semibold text-slate-800">
                                        {insight.title}
                                    </h3>
                                    <span className="text-xs font-bold text-emerald-600">
                                        Score: {insight.score}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-slate-600">
                                    {insight.message}
                                </p>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <span className="text-xs font-medium text-slate-500">
                                        {insight.action}
                                    </span>

                                    <button className="flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:text-purple-600">
                                        View
                                        <ArrowRight size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AIInsights;