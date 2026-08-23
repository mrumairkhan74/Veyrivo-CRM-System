import { ArrowLeft, Home, SearchX } from "lucide-react"
import { Link, useNavigate } from "react-router"


const Page404 = () => {
    const navigate = useNavigate();
    return (
        <section className="flex items-center justify-center min-h-screen px-4 bg-[#F8FAFC]">
            <div className="flex flex-col max-w-2xl items-center text-center">
                {/* Search Icon */}
                <div className="mb-6 h-20 w-20 bg-cyan-50 text-cyan-600 text-center flex items-center justify-center rounded-2xl shadow-md">
                    <SearchX size={48} />
                </div>
                {/* 404 */}
                <h1 className="mt-4 text-center font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent text-4xl md:text-6xl lg:text-7xl mb-3">404</h1>

                {/* Page Not Found */}
                <h2 className="text-center font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent text-3xl md:text-5xl lg:text-6xl mb-2">Page Not Found</h2>

                {/* content/description */}

                <p className="mt-4 text-gray-500 text-lg md:text-xl lg:text-2xl">
                    The page you're looking for doesn't exist or may have
                    been moved to another location.
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition-all hover:border-blue-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                </div>
            </div>

        </section>
    )
}

export default Page404