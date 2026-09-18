import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    if (!config.supabaseUrl || !key) {
      throw new Error('Supabase credentials are not properly configured.');
    }
    supabaseAdmin = createClient(config.supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}
