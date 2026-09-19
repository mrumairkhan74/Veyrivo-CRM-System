import { useEffect, useState } from 'react';
import { supabase } from '../services/api'; // your existing path

export const useReferenceData = () => {
    const [industries, setIndustries] = useState([]);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [owners, setOwners] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [services, setServices] = useState([]);
    useEffect(() => {
        let cancelled = false;

        (async () => {
            const [ind, src, svc, own, comp, cnt] = await Promise.all([
                supabase.from('industries').select('id, name').order('name'),
                supabase.from('sources').select('id, name').order('name'),
                supabase.from('services').select('id, name').order('name'),
                supabase.from('profiles').select('id, full_name, email').order('full_name'),
                supabase.from('companies')
                    .select('id, name')
                    .is('deleted_at', null)
                    .order('name'),      // ← new
                supabase.from('contacts')
                    .select('id, first_name, last_name')
                    .is('deleted_at', null)
                    .order('first_name'),    // ← new
            ]);

            if (cancelled) return;

            setIndustries(ind.data ?? []);
            setSources(src.data ?? []);
            setServices(svc.data ?? []);
            setOwners(
                (own.data ?? []).map(p => ({
                    id: p.id,
                    full_name: p.full_name || p.email || 'Unknown',
                }))
            );
            setCompanies(comp.data ?? []);
            setContacts(
                (cnt.data ?? [])
                    .map((c) => ({
                        id: c.id,
                        first_name: c.first_name,
                        last_name: c.last_name,
                        full_name: `${c.first_name} ${c.last_name}`.trim(),
                    }))
                    .sort((a, b) => a.full_name.localeCompare(b.full_name))
            );
            setLoading(false);
        })();

        return () => { cancelled = true; };
    }, []);

    return { industries, sources, services, owners, loading, companies, contacts };
};