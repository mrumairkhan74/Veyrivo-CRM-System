import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bzhuevejlihbljllmrnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6aHVldmVqbGloYmxqbGxtcm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDc2NjYsImV4cCI6MjEwNDAyMzY2Nn0.IbcSn9dW8ROzO4AZjgVWXBKTpevJqeTlxuSFajQ291M';

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