import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
)

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

if (!isConfigured && typeof window !== 'undefined') {
  console.info('Patronus: Operating in local parchment mode. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting environment settings to connect to the live Ether.')
}

export function isOnlineAvailable() {
  return isConfigured
}

