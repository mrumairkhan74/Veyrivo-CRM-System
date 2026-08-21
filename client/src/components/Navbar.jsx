import { useRef, useState, useEffect } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const handleMenuClick = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <header
            ref={menuRef}
            className="relative flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 text-slate-900 md:px-8"
        >
            {/* Logo */}
            <Link
                to="/"
                className="text-xl font-bold tracking-tight text-[#0B1220]"
            >
                Veyrivo<span className="text-blue-600">CRM</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex">
                <ul className="flex items-center gap-8 text-sm md:text-lg font-medium text-slate-600">
                    <li>
                        <Link
                            to="/"
                            className="transition-colors hover:text-blue-600"
                        >
                            Home
                        </Link>
                    </li>

                    <li>
                        <a
                            href="#features"
                            className="transition-colors hover:text-blue-600"
                        >
                            Features
                        </a>
                    </li>

                    <li>
                        <a
                            href="#how-it-works"
                            className="transition-colors hover:text-blue-600"
                        >
                            How It Works
                        </a>
                    </li>

                    <li>
                        <a
                            href="#solutions"
                            className="transition-colors hover:text-blue-600"
                        >
                            Solutions
                        </a>
                    </li>
                </ul>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-4 md:flex">
                <button
                    onClick={() => navigate("/login")}
                    className="font-medium text-slate-700 transition-colors hover:text-blue-600"
                >
                    Login
                </button>

                <button
                    onClick={() => navigate("/signup")}
                    className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg"
                >
                    Get Started
                    <ArrowRight size={18} />
                </button>
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={handleMenuClick}
                className="flex rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute left-0 top-full z-50 flex w-full flex-col border-b border-slate-200 bg-white shadow-xl md:hidden">
                    <ul className="flex w-full flex-col p-4 text-slate-700">
                        <li>
                            <Link
                                to="/"
                                onClick={() => setIsOpen(false)}
                                className="block rounded-lg px-4 py-3 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                                Home
                            </Link>
                        </li>

                        <li>
                            <a
                                href="#features"
                                onClick={() => setIsOpen(false)}
                                className="block rounded-lg px-4 py-3 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                                Features
                            </a>
                        </li>

                        <li>
                            <a
                                href="#how-it-works"
                                onClick={() => setIsOpen(false)}
                                className="block rounded-lg px-4 py-3 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                                How It Works
                            </a>
                        </li>

                        <li>
                            <a
                                href="#solutions"
                                onClick={() => setIsOpen(false)}
                                className="block rounded-lg px-4 py-3 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                                Solutions
                            </a>
                        </li>

                        <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full rounded-full border border-slate-300 px-4 py-3 font-medium text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-600"
                            >
                                Login
                            </button>

                            <button
                                onClick={() => navigate("/signup")}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                Get Started
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </ul>
                </div>
            )}
        </header>
    );
};

export default Navbar;