import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
)

// Create Supabase client with database types
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

/**
 * Health check helper to verify Supabase connectivity
 */
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: 'Supabase credentials are not configured in .env.local',
    }
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true })

    if (error) {
      return { ok: false, message: error.message }
    }

    return { ok: true, message: 'Supabase connection verified successfully' }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unknown connection error',
    }
  }
}
