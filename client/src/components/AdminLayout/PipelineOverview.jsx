import { CircleDot } from "lucide-react";
import { useDeals } from "../../store/hooks";
import {useMemo} from "react";

const PipelineOverview = () => {
    const { deals, loading, fetchDeals } = useDeals();
    
    // Group deals by stage and calculate stats
    const pipelineData = useMemo(() => {
        const stages = [
            { id: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
            { id: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-700' },
            { id: 'proposal', label: 'Proposal', color: 'bg-amber-100 text-amber-700' },
            { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
            { id: 'won', label: 'Won', color: 'bg-emerald-100 text-emerald-700' },
            { id: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
        ];

        return stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const count = stageDeals.length;
            const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const weightedValue = stageDeals.reduce((sum, d) => sum + (d.value || 0) * (d.probability || 0) / 100, 0);

            return {
                stage: stage.label,
                count,
                value: totalValue,
                weightedValue: Math.round(weightedValue),
                color: stage.color,
            };
        });
    }, [deals]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        Sales Pipeline
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Overview of your current opportunities
                    </p>
                </div>
            </div>

            {/* Pipeline Stages */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {pipelineData.map((item) => (
                    <div
                        key={item.stage}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-500">
                                {item.stage}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.color === 'bg-blue-100 text-blue-700' ? 'bg-blue-100 text-blue-700' : item.color === 'bg-purple-100 text-purple-700' ? 'bg-purple-100 text-purple-700' : item.color === 'bg-amber-100 text-amber-700' ? 'bg-amber-100 text-amber-700' : item.color === 'bg-orange-100 text-orange-700' ? 'bg-orange-100 text-orange-700' : item.color === 'bg-emerald-100 text-emerald-700' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {item.count}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-800">
                            ${item.value.toLocaleString()}
                        </h3>

                        <p className="mt-1 text-xs font-medium text-emerald-600">
                            Weighted: ${item.weightedValue.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PipelineOverview;