import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("VITE_SUPABASE_URL / VITE_SUPABASE_KEY belum di-set. Buat file .env.local di root project.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
