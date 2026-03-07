import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

let supabase: SupabaseClient

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase credentials missing — auth features will be unavailable')
  supabase = new Proxy({} as SupabaseClient, {
    get: () => () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  })
}

export { supabase }
