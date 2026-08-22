import Card from "./Card";
import {
    Users,
    BrainCircuit,
    CalendarCheck,
    ChartNoAxesCombined,
    Building2,
    BarChart3,
} from "lucide-react";

const Features = () => {
    return (
        <section
            id="features"
            className="bg-[#F8FAFC] py-16 md:py-20 lg:py-24"
        >
            <div className="container mx-auto px-4">
                
                {/* Section Heading */}
                <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-3 text-center">
                    <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                        Features
                    </span>

                    <h2 className="text-3xl font-black tracking-tight text-[#0B1220] md:text-4xl lg:text-5xl">
                        Everything You Need to{" "}
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                            Convert More Leads
                        </span>
                    </h2>

                    <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base lg:text-lg">
                        From discovering new prospects to closing deals,
                        Veyrivo brings your entire sales workflow into one
                        intelligent platform.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <Card
                        icon={<Users size={24} />}
                        title="Lead Management"
                        description="Organize, track, score, and manage every prospect from first contact to conversion."
                    />

                    <Card
                        icon={<BrainCircuit size={24} />}
                        title="AI Lead Qualification"
                        description="Use AI to summarize requirements, identify urgency, detect requested services, and recommend the next best action."
                    />

                    <Card
                        icon={<CalendarCheck size={24} />}
                        title="Smart Follow-Ups"
                        description="Never miss an important opportunity with tasks, reminders, calls, meetings, and follow-up scheduling."
                    />

                    <Card
                        icon={<ChartNoAxesCombined size={24} />}
                        title="Sales Pipeline"
                        description="Visualize every opportunity and move qualified leads smoothly from discovery to closed deals."
                    />

                    <Card
                        icon={<Building2 size={24} />}
                        title="Companies & Contacts"
                        description="Keep companies, decision-makers, contact information, conversations, and relationship history organized in one place."
                    />

                    <Card
                        icon={<BarChart3 size={24} />}
                        title="Powerful Analytics"
                        description="Turn your sales data into actionable insights with lead, pipeline, conversion, service, and activity analytics."
                    />
                </div>
            </div>
        </section>
    );
};

export default Features;