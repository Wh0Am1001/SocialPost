import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev if env vars are missing — saves a lot of debugging time.
  console.warn(
    'Missing Supabase env vars. Copy .env.example to .env and fill in your project URL/anon key.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
