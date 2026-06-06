// Supabase client — only used if REACT_APP_SUPABASE_URL is configured.
// The app works fully without Supabase via the mock API layer.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Export null-safe client — won't throw if env vars are missing
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
