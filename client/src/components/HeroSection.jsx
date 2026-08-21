import heroSection from "../assets/HeroSection.jpeg";

const HeroSection = () => {
    return (
        <section className="relative overflow-hidden">
            {/* Background Image */}
            <div className="relative h-[600px] md:h-[650px] lg:h-[700px]">
                <img
                    src={heroSection}
                    alt="AI-powered lead generation"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950" />

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />

                {/* Content */}
                <div className="relative z-10 container mx-auto h-full px-6 flex flex-col items-center justify-center text-center">
                    
                    {/* Badge */}
                    <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        AI-Powered Lead Generation
                    </span>

                    {/* Heading */}
                    <h1 className="max-w-5xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                        Turn More{" "}
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Prospects
                        </span>{" "}
                        Into Clients.
                    </h1>

                    {/* Description */}
                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                        Find high-quality prospects, automate your outreach, and
                        convert more leads into paying customers with AI-powered
                        lead generation.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button
                            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40"
                        >
                            Get Started
                        </button>

                        <button
                            className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/10"
                        >
                            Explore Features
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;