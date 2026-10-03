import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { safeStorage } from './storage'

export const SUPABASE_URL = 'https://dphyocphoeaunhiudhkp.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHlvY3Bob2VhdW5oaXVkaGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjY2NTEsImV4cCI6MjEwNjQwMjY1MX0.LMz_Zg_nzW8TDrkBQdLW3zzu4QVRqodVw7K4qETHKak'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export const WEB_BASE_URL = 'https://3legant-storefront.vercel.app'

export function resolveProductImage(pathOrUrl?: string): string {
  if (!pathOrUrl) {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80'
  }
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${WEB_BASE_URL}${cleanPath}`
}
