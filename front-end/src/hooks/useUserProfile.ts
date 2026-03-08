import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/userProfile'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  interests: Record<string, unknown>
  avatar_url: string | null
  group_id: number | null
}

/**
 * Fetches the user's profile from public.users.
 * If no row exists (e.g. user came from email confirmation), creates one.
 * Returns null if not found or not authenticated.
 */
export function useUserProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('id, interests, avatar_url, group_id')
      .eq('id', user.id)
      .single()

    // Row doesn't exist (e.g. email confirmation flow) - create it
    if (error?.code === 'PGRST116') {
      await ensureUserProfile(user.id)
      const { data: retryData } = await supabase
        .from('users')
        .select('id, interests, avatar_url, group_id')
        .eq('id', user.id)
        .single()

      if (retryData) {
        setProfile({
          id: retryData.id,
          interests: (retryData.interests as Record<string, unknown>) ?? {},
          avatar_url: (retryData.avatar_url as string) ?? null,
          group_id: retryData.group_id != null ? Number(retryData.group_id) : null,
        })
      } else {
        setProfile(null)
      }
    } else if (error) {
      setProfile(null)
    } else {
      setProfile({
        id: data.id,
        interests: (data.interests as Record<string, unknown>) ?? {},
        avatar_url: (data.avatar_url as string) ?? null,
        group_id: data.group_id != null ? Number(data.group_id) : null,
      })
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, refetch: fetchProfile }
}

/**
 * Returns true if interests is an empty object {}.
 */
export function isInterestsEmpty(interests: Record<string, unknown> | null | undefined): boolean {
  if (!interests || typeof interests !== 'object') return true
  return Object.keys(interests).length === 0
}

/**
 * Returns true if onboarding is complete (interests is non-empty).
 */
export function isOnboardingComplete(interests: Record<string, unknown> | null | undefined): boolean {
  return !isInterestsEmpty(interests)
}
