import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../services/api';
import { useAuthStore } from '../store';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const setUser = useAuthStore((s) => s.setUser);
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const run = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (!code) {
        setError('Missing authorization code.');
        setTimeout(() => navigate('/login'), 2500);
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        setError(error?.message || 'Could not complete sign-in.');
        setTimeout(() => navigate('/login'), 2500);
        return;
      }

      // Hydrate the store so route guards see the user immediately.
      const profile = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      setUser({
        ...data.session.user,
        role: profile.data?.role || 'user',
        full_name: profile.data?.full_name || data.session.user.user_metadata?.full_name,
      });
      setSession(data.session);
      setLoading(false);

      navigate('/admin/dashboard', { replace: true });
    };

    run();
  }, [navigate, setUser, setSession, setLoading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Sign-in failed: {error}
          <div className="mt-2 text-slate-500">Redirecting to login…</div>
        </div>
      ) : (
        <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
      )}
    </div>
  );
};

export default AuthCallback;