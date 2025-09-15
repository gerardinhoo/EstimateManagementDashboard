// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

/** Vite exposes only VITE_* vars to the client */
const url = import.meta.env?.VITE_SUPABASE_URL;
const anon = import.meta.env?.VITE_SUPABASE_ANON_KEY;

/** Export a flag so the UI can show whether remote is active */
export const SUPABASE_ENABLED = Boolean(url && anon);

/** Do not throw if not configured — fall back to localStorage-only */
export const supabase = SUPABASE_ENABLED ? createClient(url, anon) : null;

if (!SUPABASE_ENABLED) {
  console.warn(
    '[EMD] Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
      'Using localStorage fallback.'
  );
}
