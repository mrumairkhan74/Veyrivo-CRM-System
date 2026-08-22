
import {
    Code2,
    BrainCircuit,
    Bot,
    Workflow,
    Database,
    ShoppingCart,
} from "lucide-react";
import Card from "./Card";
const Solution = () => {
    return (
        <section
            id="solutions"
            className="bg-[#F8FAFC] py-16 md:py-20 lg:py-24"
        >
            <div className="container mx-auto px-4">

                {/* Section Heading */}
                <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-3 text-center">
                    <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                        Solutions
                    </span>

                    <h2 className="text-3xl font-black tracking-tight text-[#0B1220] md:text-4xl lg:text-5xl">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                            Technology Solutions Built {" "}
                        </span>
                        for Business Growth
                    </h2>

                    <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base lg:text-lg">
                        From AI-powered automation to custom software, Veyrivo helps businesses build smarter systems and scale efficiently.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <Card
                        icon={<Code2 size={24} />}
                        title="Custom Software"
                        description="Build software tailored to your business needs."
                    />

                    <Card
                        icon={<BrainCircuit size={24} />}
                        title="AI Solutions"
                        description="Use intelligent systems to improve decisions and productivity."
                    />

                    <Card
                        icon={<Bot size={24} />}
                        title="AI Chatbots"
                        description="Automate conversations and provide faster customer support."
                    />

                    <Card
                        icon={<Workflow size={24} />}
                        title="Business Automation"
                        description="Reduce repetitive work and streamline business processes."
                    />

                    <Card
                        icon={<Database size={24} />}
                        title="ERP Development"
                        description="Connect and manage your business operations in one system."
                    />

                    <Card
                        icon={<ShoppingCart size={24} />}
                        title="E-Commerce Development"
                        description="Build scalable online stores and digital commerce experiences."
                    />
                </div>
            </div>
        </section>
    )
}

export default Solution