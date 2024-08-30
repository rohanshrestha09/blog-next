import { SupabaseService } from 'server/services/supabase';

export function getSupabaseService() {
  return new SupabaseService();
}
