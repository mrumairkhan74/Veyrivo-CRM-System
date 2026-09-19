import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../store/hooks';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // If already logged in, bounce to dashboard
    useEffect(() => {
        if (user) navigate('/admin/dashboard', { replace: true });
    }, [user, navigate]);

    // Surface OAuth errors passed back on the query string
    useEffect(() => {
        const err = searchParams.get('error');
        if (err) setError(decodeURIComponent(err));
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/admin/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            // Browser navigates away — nothing else runs here.
        } catch (err) {
            setError(err.message || 'Google login failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-10">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-600/20 blur-3xl" />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-[#0B1220]">Welcome Back</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to continue to Veyrivo CRM
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div className="relative">
                            <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-3 font-medium text-white transition hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Login'}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">OR CONTINUE WITH</span>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 font-medium text-slate-700 transition hover:bg-slate-50 hover:shadow-md disabled:opacity-50"
                >
                    <FcGoogle size={22} />
                    Continue with Google
                </button>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/signup')}
                        className="cursor-pointer font-semibold text-cyan-600 hover:text-cyan-700"
                    >
                        Create an account
                    </button>
                </p>
            </div>
        </section>
    );
};

export default Login;