import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbGroup, DbUser, DbEvent, DbVote } from '@/lib/types'

export interface GroupData {
  group: DbGroup | null
  members: DbUser[]
  events: DbEvent[]
  votes: DbVote[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useGroupData(groupId: number | null | undefined): GroupData {
  const [group, setGroup] = useState<DbGroup | null>(null)
  const [members, setMembers] = useState<DbUser[]>([])
  const [events, setEvents] = useState<DbEvent[]>([])
  const [votes, setVotes] = useState<DbVote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!groupId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [groupRes, membersRes, eventsRes] = await Promise.all([
        supabase
          .from('groups')
          .select('id, members, vibe_score, voting_ends_at, final_event_id')
          .eq('id', groupId)
          .single(),
        supabase
          .from('users')
          .select('id, name, age, bio, prompts, avatar_url, interests, group_id')
          .eq('group_id', groupId),
        supabase
          .from('events_with_coords')
          .select('id, event_name, location_name, address, date_time, description, group_id, lat, lng')
          .eq('group_id', groupId),
      ])

      if (groupRes.error) {
        console.error('[useGroupData] groups query failed:', groupRes.error)
        throw new Error(`groups: ${groupRes.error.message}`)
      }
      if (membersRes.error) {
        console.error('[useGroupData] members query failed:', membersRes.error)
        throw new Error(`members: ${membersRes.error.message}`)
      }
      if (eventsRes.error) {
        console.error('[useGroupData] events query failed:', eventsRes.error)
        throw new Error(`events: ${eventsRes.error.message}`)
      }

      console.log('[useGroupData] fetched:', {
        group: groupRes.data,
        members: membersRes.data?.length,
        events: eventsRes.data?.length,
      })

      const groupData = groupRes.data as DbGroup
      const membersData = (membersRes.data ?? []) as DbUser[]
      const eventsData = (eventsRes.data ?? []) as DbEvent[]

      setGroup(groupData)
      setMembers(membersData)
      setEvents(eventsData)

      if (eventsData.length > 0) {
        const eventIds = eventsData.map((e) => e.id)
        const { data: votesData, error: votesErr } = await supabase
          .from('votes')
          .select('id, user_id, event_id, created_at')
          .in('event_id', eventIds)

        if (votesErr) throw new Error(votesErr.message)
        setVotes((votesData ?? []) as DbVote[])
      } else {
        setVotes([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group data')
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { group, members, events, votes, loading, error, refetch: fetchAll }
}
