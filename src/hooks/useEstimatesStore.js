// src/hooks/useEstimatesStore.js
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'emd_estimates_v1';

/** Normalize for DB: empty strings → null, numeric fields typed */
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
    try {
      const fromLS =
        typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
          : [];
      setEstimates(fromLS);
    } catch {
      setEstimates([]);
    }
    hydrated.current = true;

    (async () => {
      if (!supabase) return; // offline mode

      try {
        const { data, error } = await supabase
          .from('estimates')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;

        if (data?.length) {
          setEstimates(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        // If remote is empty we do nothing; seeding from LS only makes sense locally.
      } catch (e) {
        console.warn('[EMD] Supabase fetch failed:', e?.message);
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

  // CRUD — optimistic local updates + best-effort remote writes
  const addEstimate = async (est) => {
    setEstimates((prev) => [...prev, est]);
    if (!supabase) return;
    try {
      const { error } = await supabase.from('estimates').insert(toDb(est));
      if (error) throw error;
    } catch (e) {
      console.warn('[EMD] insert error:', e?.message);
    }
  };

  const updateEstimate = async (est) => {
    setEstimates((prev) => prev.map((x) => (x.id === est.id ? est : x)));
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('estimates')
        .update(toDb(est))
        .eq('id', est.id);
      if (error) throw error;
    } catch (e) {
      console.warn('[EMD] update error:', e?.message);
    }
  };

  const deleteEstimate = async (id) => {
    setEstimates((prev) => prev.filter((x) => x.id !== id));
    if (!supabase) return;
    try {
      const { error } = await supabase.from('estimates').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[EMD] delete error:', e?.message);
    }
  };

  return { estimates, addEstimate, updateEstimate, deleteEstimate };
}
