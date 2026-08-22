import {
    ArrowRight,
    // Mail,
    // Linkedin,
    // Twitter,
    // Github,
} from "lucide-react";

const Footer = () => {
    return (
        <footer className="relative overflow-hidden bg-slate-950 text-white">

            {/* Top Gradient Glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-600" />

            <div className="container mx-auto px-6">

                {/* CTA Section */}
                <div className="border-b border-white/10 py-16 md:py-20">
                    <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

                        <div className="max-w-2xl">
                            <span className="mb-4 inline-block text-sm font-semibold text-cyan-400">
                                READY TO GROW?
                            </span>

                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                                Turn more leads into{" "}
                                <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                    customers.
                                </span>
                            </h2>

                            <p className="mt-4 text-slate-400">
                                Start generating, managing, and converting leads
                                with Veyrivo CRM.
                            </p>
                        </div>

                        <button className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-3.5 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                            Get Started
                            <ArrowRight
                                size={18}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </button>

                    </div>
                </div>

                {/* Main Footer */}
                <div className="grid grid-cols-1 gap-12 py-14 sm:grid-cols-2 lg:grid-cols-5">

                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2">
                            {/* V Logo */}
                            <div className="text-3xl font-black italic">
                                <span className="bg-gradient-to-br from-purple-500 to-cyan-700 bg-clip-text text-transparent">
                                    V
                                </span>
                                <span className="bg-gradient-to-br from-cyan-300 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                                    .
                                </span>
                            </div>

                            <span className="text-2xl font-bold tracking-tight">
                                Veyrivo
                            </span>
                        </div>

                        <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                            AI-powered lead generation and CRM platform built
                            to help businesses find better prospects, build
                            stronger relationships, and close more deals.
                        </p>

                        {/* Social Links */}
                        <div className="mt-6 flex items-center gap-3">
                            <a
                                href="#"
                                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:border-purple-400/40 hover:text-purple-400"
                            >
                                {/* <Linkedin size={18} /> */}
                            </a>

                            <a
                                href="#"
                                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-400"
                            >
                                {/* <Twitter size={18} /> */}
                            </a>

                            <a
                                href="#"
                                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:border-blue-400/40 hover:text-blue-400"
                            >
                                {/* <Github size={18} /> */}
                            </a>

                            <a
                                href="#"
                                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:border-purple-400/40 hover:text-purple-400"
                            >
                                {/* <Mail size={18} /> */}
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="mb-5 text-sm font-semibold text-white">
                            Product
                        </h3>

                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>
                                <a href="#features" className="transition hover:text-white">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="transition hover:text-white">
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" className="transition hover:text-white">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a href="#integrations" className="transition hover:text-white">
                                    Integrations
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="mb-5 text-sm font-semibold text-white">
                            Resources
                        </h3>

                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>
                                <a href="#blog" className="transition hover:text-white">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#guides" className="transition hover:text-white">
                                    Guides
                                </a>
                            </li>
                            <li>
                                <a href="#help" className="transition hover:text-white">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="transition hover:text-white">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="mb-5 text-sm font-semibold text-white">
                            Company
                        </h3>

                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>
                                <a href="#about" className="transition hover:text-white">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#careers" className="transition hover:text-white">
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a href="#privacy" className="transition hover:text-white">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#terms" className="transition hover:text-white">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

                    <p>
                        © {new Date().getFullYear()} Veyrivo. All rights reserved.
                    </p>

                    <p>
                        Built for smarter growth.
                    </p>

                </div>
            </div>
        </footer>
    );
};

export default Footer;