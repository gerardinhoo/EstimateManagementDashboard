// src/hooks/useEstimatesStore.js
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'emd_estimates_v1';

/** Normalize for DB: empty strings → null, numbers correctly typed */
function toDb(est) {
  return {
    ...est,
    dateReceived: est.dateReceived || null,
    timeReceived: est.timeReceived || null,
    dateReturned: est.dateReturned || null,
    timeReturned: est.timeReturned || null,
    estimateAmount:
      est.estimateAmount === '' || est.estimateAmount == null
        ? null
        : Number(est.estimateAmount),
    aiPredictedDays:
      est.aiPredictedDays === '' || est.aiPredictedDays == null
        ? null
        : Number(est.aiPredictedDays),
    clientBilled: !!est.clientBilled,
  };
}

export function useEstimatesStore() {
  const [estimates, setEstimates] = useState([]);
  const hydrated = useRef(false);

  // Load from localStorage first, then try Supabase
  useEffect(() => {
    const fromLS = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setEstimates(fromLS);
    hydrated.current = true;

    (async () => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.warn('[EMD] Supabase fetch failed:', error.message);
        return;
      }

      if (data?.length) {
        setEstimates(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else if (fromLS.length) {
        // First-time deploy with empty table? Seed remote with local data.
        const payload = fromLS.map(toDb);
        const { error: seedErr } = await supabase
          .from('estimates')
          .insert(payload);
        if (seedErr) console.warn('[EMD] seed insert error:', seedErr.message);
      }
    })();
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
    } catch (e) {
      console.warn('[EMD] localStorage write failed:', e);
    }
  }, [estimates]);

  // CRUD helpers — optimistic local updates + best-effort remote writes
  const addEstimate = async (est) => {
    setEstimates((prev) => [...prev, est]);
    if (!supabase) return;
    const { error } = await supabase.from('estimates').insert(toDb(est));
    if (error) console.warn('[EMD] insert error:', error.message);
  };

  const updateEstimate = async (est) => {
    setEstimates((prev) => prev.map((x) => (x.id === est.id ? est : x)));
    if (!supabase) return;
    const { error } = await supabase
      .from('estimates')
      .update(toDb(est))
      .eq('id', est.id);
    if (error) console.warn('[EMD] update error:', error.message);
  };

  const deleteEstimate = async (id) => {
    setEstimates((prev) => prev.filter((x) => x.id !== id));
    if (!supabase) return;
    const { error } = await supabase.from('estimates').delete().eq('id', id);
    if (error) console.warn('[EMD] delete error:', error.message);
  };

  return { estimates, addEstimate, updateEstimate, deleteEstimate };
}
