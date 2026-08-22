import {
    Sparkles,
    BrainCircuit,
    Target,
    Zap,
    ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const AiIntelligence = () => {
    return (
        <section className="bg-[#F8FAFC] py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4">

                <div className="grid items-center gap-12 lg:grid-cols-2">

                    {/* Left Side - AI Visual */}
                    <div className="relative rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 md:p-10">

                        {/* AI Header */}
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <BrainCircuit size={24} />
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Veyrivo AI
                                </p>

                                <h3 className="font-bold text-[#0B1220]">
                                    Lead Intelligence
                                </h3>
                            </div>
                        </div>

                        {/* AI Summary Card */}
                        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-[#0B1220]">
                                    AI Lead Summary
                                </span>

                                <Sparkles
                                    size={18}
                                    className="text-cyan-500"
                                />
                            </div>

                            <p className="text-sm leading-relaxed text-slate-500">
                                High-potential prospect interested in custom
                                software development. Requirements indicate
                                strong buying intent.
                            </p>
                        </div>

                        {/* AI Score */}
                        <div className="grid grid-cols-2 gap-4">

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="mb-2 text-sm text-slate-500">
                                    Lead Score
                                </p>

                                <div className="flex items-center gap-2">
                                    <Target
                                        size={20}
                                        className="text-blue-600"
                                    />

                                    <span className="text-2xl font-bold text-[#0B1220]">
                                        92/100
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="mb-2 text-sm text-slate-500">
                                    Recommended Action
                                </p>

                                <div className="flex items-center gap-2">
                                    <Zap
                                        size={20}
                                        className="text-cyan-500"
                                    />

                                    <span className="text-sm font-semibold text-[#0B1220]">
                                        Schedule Follow-Up
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div>

                        <span className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                            AI-Powered Lead Intelligence
                        </span>

                        <h2 className="mb-6 text-3xl font-black tracking-tight text-[#0B1220] md:text-4xl lg:text-5xl">
                            Let AI Help You Focus on the{" "}
                            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                Leads That Matter
                            </span>
                        </h2>

                        <p className="mb-8 text-base leading-relaxed text-slate-600 md:text-lg">
                            Veyrivo uses AI to analyze lead requirements,
                            identify urgency, summarize important details,
                            and recommend the best next action for your team.
                        </p>

                        {/* Benefits */}
                        <div className="mb-8 space-y-4">

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <BrainCircuit size={20} />
                                </div>

                                <span className="font-medium text-slate-700">
                                    Analyze lead requirements instantly
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                                    <Target size={20} />
                                </div>

                                <span className="font-medium text-slate-700">
                                    Identify urgency and priority
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Zap size={20} />
                                </div>

                                <span className="font-medium text-slate-700">
                                    Get recommended next actions
                                </span>
                            </div>

                        </div>

                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg"
                        >
                            Explore AI Features
                            <ArrowRight size={18} />
                        </Link>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default AiIntelligence;