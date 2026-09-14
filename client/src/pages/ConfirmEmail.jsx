import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "../services/api";

const ConfirmEmail = () => {
    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check for email from location state (from signup page)
        if (location.state?.email) {
            setEmail(location.state.email);
        }
        if (location.state?.message) {
            setMessage(location.state.message);
        }

        const verifyEmail = async () => {
            const token = searchParams.get("token");
            const type = searchParams.get("type");
            const emailParam = searchParams.get("email");

            if (emailParam) {
                setEmail(emailParam);
            }

            if (!token) {
                // If no token in URL, check if we have a message from signup
                if (!message && !email) {
                    setStatus("error");
                    setMessage("Invalid confirmation link. No token provided.");
                }
                return;
            }

            try {
                // Supabase uses the token to verify the email
                const { data, error } = await supabase.auth.verifyOtp({
                    token_hash: token,
                    type: type || "signup",
                });

                if (error) {
                    if (error.message.includes("expired") || error.message.includes("invalid")) {
                        setStatus("expired");
                        setMessage("This confirmation link has expired or is invalid. Please request a new confirmation email.");
                    } else {
                        setStatus("error");
                        setMessage(`Verification failed: ${error.message}`);
                    }
                    return;
                }

                if (data.user) {
                    setStatus("success");
                    setMessage("Your email has been confirmed successfully! Redirecting to login...");
                    
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        navigate("/login?confirmed=true");
                    }, 3000);
                } else {
                    setStatus("success");
                    setMessage("Your email has been confirmed! Redirecting to login...");
                    setTimeout(() => {
                        navigate("/login?confirmed=true");
                    }, 3000);
                }
            } catch (err) {
                console.error("Email verification error:", err);
                setStatus("error");
                setMessage("An unexpected error occurred. Please try again or contact support.");
            }
        };

        verifyEmail();
    }, [searchParams, navigate, message, email]);

    const resendConfirmation = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email: email,
            });
            if (error) {
                alert(`Failed to resend: ${error.message}`);
            } else {
                alert("Confirmation email sent! Please check your inbox.");
            }
        } catch (err) {
            alert("Failed to resend confirmation email.");
        } finally {
            setLoading(false);
        }
    };

    const goToLogin = () => {
        navigate("/login");
    };

    const goToSignup = () => {
        navigate("/signup");
    };

    const renderStatus = () => {
        switch (status) {
            case "verifying":
                return (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-cyan-500 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h2>
                        <p className="text-gray-500">Please wait while we confirm your email address.</p>
                    </div>
                );
            case "success":
                return (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Confirmed!</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <button
                            onClick={goToLogin}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                        >
                            Go to Login
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                );
            case "error":
                return (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={goToLogin}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90"
                            >
                                Go to Login
                            </button>
                            <button
                                onClick={goToSignup}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                            >
                                Sign Up Instead
                            </button>
                        </div>
                    </div>
                );
            case "expired":
                return (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Expired</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={goToSignup}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90"
                            >
                                Sign Up Again
                            </button>
                            <button
                                onClick={resendConfirmation}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                    "Resend Confirmation Email"
                                )}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-10">
            {/* Background Glow */}
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-600/20 blur-3xl" />

            {/* Confirmation Card */}
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#0B1220]">
                        Confirm Your Email
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Verify your email address to access Veyrivo CRM
                    </p>
                </div>

                {renderStatus()}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-center text-sm text-slate-500">
                        Didn't create an account?{" "}
                        <button onClick={goToSignup} className="font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer">
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ConfirmEmail;