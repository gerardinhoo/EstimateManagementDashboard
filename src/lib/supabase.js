// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("Supabase URL:", url);
  console.error("Supabase Key:", anon ? "Present" : "Missing");
  throw new Error("Missing Supabase environment variables!");
}

export const supabase = createClient(url, anon);
