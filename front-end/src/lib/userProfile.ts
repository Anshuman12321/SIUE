import { supabase } from './supabase'

/**
 * Ensures a row exists in public.users for the given auth user.
 * Used after signup or email confirmation when the trigger hasn't fired.
 */
export async function ensureUserProfile(userId: string) {
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, interests: {} }, { onConflict: 'id' })

  return { error }
}
