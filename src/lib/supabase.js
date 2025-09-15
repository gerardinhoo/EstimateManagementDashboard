// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

/**
 * Vite exposes variables prefixed with VITE_ at build-time.
 * On Vercel, add these in Project → Settings → Environment Variables.
 */
const url = import.meta.env?.VITE_SUPABASE_URL;
const anon = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Don't throw—fall back to localStorage-only if not configured.
export const supabase = url && anon ? createClient(url, anon) : null;

if (!supabase) {
  // Helpful in both local and prod builds when envs are missing.
  console.warn(
    '[EMD] Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
      'The app will use localStorage only.'
  );
}
