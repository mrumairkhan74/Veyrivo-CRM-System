import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

export const getAuthHeaders = () => {
    const session = supabase.auth.getSession();
    return {
        'Authorization': `Bearer ${session.data.session?.access_token}`,
        'Content-Type': 'application/json',
    };
};

export default supabase;