import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bunigrqjuvrenwgsodab.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_S9sBGlZ_SU7uGXJd7gkPIA_TYQbsqKk';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const DEFAULT_SHOP_ID = import.meta.env.VITE_DEFAULT_SHOP_ID || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
