import {
    Search,
    BrainCircuit,
    CalendarCheck,
    Handshake,
} from "lucide-react";

const HowItsWork = () => {
    return (
        <section
            id="how-it-works"
            className="bg-white py-16 md:py-20 lg:py-24"
        >
            <div className="container mx-auto px-4">

                {/* Heading */}
                <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-3 text-center">
                    <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                        How It Works
                    </span>

                    <h2 className="text-3xl font-black tracking-tight text-[#0B1220] md:text-4xl lg:text-5xl">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                            From Prospect to Client
                        </span>{" "}
                        in 4 Steps
                    </h2>
                </div>

                {/* 4 Steps */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">

                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center">
                        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            01
                        </span>

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Search size={28} />
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-[#0B1220]">
                            Discover
                        </h3>

                        <p className="text-sm leading-relaxed text-slate-500">
                            Find and organize potential companies, contacts,
                            and new prospects.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center">
                        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            02
                        </span>

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <BrainCircuit size={28} />
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-[#0B1220]">
                            Qualify
                        </h3>

                        <p className="text-sm leading-relaxed text-slate-500">
                            Score leads and understand requirements with
                            intelligent AI assistance.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center">
                        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            03
                        </span>

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <CalendarCheck size={28} />
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-[#0B1220]">
                            Follow Up
                        </h3>

                        <p className="text-sm leading-relaxed text-slate-500">
                            Schedule calls, meetings, tasks, and reminders so
                            opportunities never get missed.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center">
                        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            04
                        </span>

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Handshake size={28} />
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-[#0B1220]">
                            Convert
                        </h3>

                        <p className="text-sm leading-relaxed text-slate-500">
                            Move qualified opportunities through your pipeline
                            and turn prospects into clients.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HowItsWork;