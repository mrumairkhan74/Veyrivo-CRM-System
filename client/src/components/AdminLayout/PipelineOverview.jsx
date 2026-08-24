import { CircleDot } from "lucide-react";

const PipelineOverview = () => {
    const pipeline = [
        {
            stage: "New",
            count: 24,
            value: "$12,400",
        },
        {
            stage: "Qualified",
            count: 18,
            value: "$18,600",
        },
        {
            stage: "Proposal",
            count: 12,
            value: "$24,500",
        },
        {
            stage: "Negotiation",
            count: 8,
            value: "$16,800",
        },
        {
            stage: "Won",
            count: 6,
            value: "$32,000",
        },
    ];

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

                <CircleDot size={22} className="text-blue-600" />
            </div>

            {/* Pipeline Stages */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {pipeline.map((item) => (
                    <div
                        key={item.stage}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:shadow-sm"
                    >
                        <p className="text-sm font-medium text-slate-500">
                            {item.stage}
                        </p>

                        <h3 className="mt-2 text-2xl font-bold text-slate-800">
                            {item.count}
                        </h3>

                        <p className="mt-1 text-xs font-medium text-emerald-600">
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PipelineOverview;