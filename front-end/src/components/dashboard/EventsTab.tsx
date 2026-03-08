import { useState, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useGroupData } from '@/hooks/useGroupData'
import { toDisplayEvent } from '@/lib/types'
import type { DisplayEvent } from '@/lib/types'
import { EventsSidebar } from './EventsSidebar'
import { EventsMap } from './EventsMap'
import { VotingTimer } from './VotingTimer'
import { FinalEventCard } from './FinalEventCard'
import styles from './Dashboard.module.css'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY as string | undefined

async function sendEventEmail(
  groupId: number,
  event: import('@/lib/types').DbEvent | null,
) {
  if (!RESEND_API_KEY || !event) return

  const { data: emails, error } = await supabase.rpc('get_group_emails', {
    p_group_id: groupId,
  })
  if (error || !emails?.length) {
    console.error('[sendEventEmail] failed to get emails:', error)
    return
  }

  const eventName = event.event_name ?? 'your event'
  const venue = event.location_name ?? ''
  const address = event.address ?? ''
  const dateTime = event.date_time
    ? new Date(event.date_time).toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : ''

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
      <h1 style="color: #092c45; font-size: 24px;">Your Event is Confirmed!</h1>
      <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
        Your group has voted and the event has been finalized. A reservation has been made automatically.
      </p>
      <div style="background: #f3f0ff; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h2 style="color: #8652ff; font-size: 20px; margin: 0 0 8px;">${eventName}</h2>
        ${venue ? `<p style="color: #092c45; margin: 4px 0;"><strong>Venue:</strong> ${venue}</p>` : ''}
        ${dateTime ? `<p style="color: #092c45; margin: 4px 0;"><strong>When:</strong> ${dateTime}</p>` : ''}
        ${address ? `<p style="color: #092c45; margin: 4px 0;"><strong>Where:</strong> ${address}</p>` : ''}
      </div>
      <p style="color: #6b7280; font-size: 14px;">See you there!</p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Connect <onboarding@resend.dev>',
      to: emails as string[],
      subject: `Event Confirmed: ${eventName}`,
      html,
    }),
  })

  const result = await res.json()
  console.log('[sendEventEmail] result:', result)
}

interface EventsTabProps {
  groupId: number
  currentUserId: string
}

export function EventsTab({ groupId, currentUserId }: EventsTabProps) {
  const { group, members, events: dbEvents, votes, loading, error, refetch } = useGroupData(groupId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [locking, setLocking] = useState(false)

  const currentUserName = useMemo(
    () => members.find((m) => m.id === currentUserId)?.name ?? 'User',
    [members, currentUserId],
  )

  const displayEvents: DisplayEvent[] = useMemo(() => {
    return dbEvents.map((e) => {
      const eventVoters = votes
        .filter((v) => v.event_id === e.id)
        .map((v) => {
          const member = members.find((m) => m.id === v.user_id)
          return { id: v.user_id, avatarUrl: member?.avatar_url ?? '' }
        })
      return toDisplayEvent(e, eventVoters)
    })
  }, [dbEvents, votes, members])

  const lockedEventId = useMemo(() => {
    const userVote = votes.find((v) => v.user_id === currentUserId)
    if (!userVote) return null
    return String(userVote.event_id)
  }, [votes, currentUserId])

  const memberIds = useMemo(
    () => group?.members ?? members.map((m) => m.id),
    [group, members],
  )

  const allVoted = useMemo(() => {
    if (memberIds.length === 0) return false
    const voterIds = new Set(votes.map((v) => v.user_id))
    return memberIds.every((id) => voterIds.has(id))
  }, [votes, memberIds])

  const winningEvent = useMemo(() => {
    if (!allVoted) return null
    const sorted = [...displayEvents].sort(
      (a, b) => b.voters.length - a.voters.length,
    )
    return sorted[0] ?? null
  }, [allVoted, displayEvents])

  const finalEvent = useMemo(() => {
    if (group?.final_event_id) {
      return displayEvents.find((e) => e.dbId === group.final_event_id) ?? null
    }
    return null
  }, [group, displayEvents])

  const handleLockIn = useCallback(async () => {
    if (!selectedId || lockedEventId || locking) return
    setLocking(true)

    try {
      const numericEventId = Number(selectedId)

      await supabase.from('votes').insert({
        user_id: currentUserId,
        event_id: numericEventId,
      })

      await refetch()

      const { data: freshVotes } = await supabase
        .from('votes')
        .select('user_id, event_id')
        .in('event_id', dbEvents.map((e) => e.id))

      const voterIds = new Set((freshVotes ?? []).map((v: { user_id: string }) => v.user_id))
      const everyoneVoted = memberIds.every((id) => voterIds.has(id))

      if (everyoneVoted) {
        const voteCounts = new Map<number, number>()
        for (const v of freshVotes ?? []) {
          const eid = (v as { event_id: number }).event_id
          voteCounts.set(eid, (voteCounts.get(eid) ?? 0) + 1)
        }

        let winnerId = numericEventId
        let maxVotes = 0
        for (const [eid, count] of voteCounts) {
          if (count > maxVotes) {
            maxVotes = count
            winnerId = eid
          }
        }

        await supabase
          .from('groups')
          .update({ final_event_id: winnerId })
          .eq('id', groupId)

        try {
          const callPayload = { event_id: winnerId, caller_name: currentUserName }
          console.log('[EventsTab] Calling /calls/place with:', callPayload)
          const callRes = await fetch(`${API_BASE}/calls/place`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(callPayload),
          })
          console.log('[EventsTab] /calls/place response:', callRes.status, await callRes.text())
        } catch (err) {
          console.error('[EventsTab] /calls/place failed:', err)
        }

        try {
          await sendEventEmail(groupId, dbEvents.find((e) => e.id === winnerId) ?? null)
        } catch {
          // email notification may fail; continue
        }

        await refetch()
      }
    } catch {
      // vote insert failed
    } finally {
      setLocking(false)
    }
  }, [selectedId, lockedEventId, locking, currentUserId, dbEvents, memberIds, groupId, currentUserName, refetch])

  if (loading) {
    return <p style={{ color: 'var(--color-muted)' }}>Loading events...</p>
  }

  if (error) {
    return <p style={{ color: '#ef4444' }}>Failed to load events: {error}</p>
  }

  if (finalEvent) {
    return (
      <div className={styles.finalizedView}>
        <FinalEventCard event={finalEvent} confirmed />
        <div className={styles.finalizedMapWrap}>
          <EventsMap events={[finalEvent]} highlight={finalEvent.id} fullScreen />
        </div>
      </div>
    )
  }

  if (allVoted && winningEvent) {
    return (
      <div className={styles.finalizedView}>
        <FinalEventCard event={winningEvent} confirmed />
        <div className={styles.finalizedMapWrap}>
          <EventsMap events={[winningEvent]} highlight={winningEvent.id} fullScreen />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.eventsHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Vote for an Event</h2>
          <p className={styles.sectionSubtitle}>
            Select an event and lock in your vote.
          </p>
        </div>
        {group?.voting_ends_at && <VotingTimer endsAt={group.voting_ends_at} />}
      </div>

      <div className={styles.eventsLayout}>
        <div>
          <EventsSidebar
            events={displayEvents}
            selectedId={selectedId}
            onSelect={setSelectedId}
            lockedEventId={lockedEventId}
            currentUserId={currentUserId}
          />
          <LockInArea
            selectedId={selectedId}
            lockedEventId={lockedEventId}
            locking={locking}
            onLockIn={handleLockIn}
          />
        </div>
        <EventsMap
          events={displayEvents}
          highlight={selectedId ?? lockedEventId}
          onSelect={lockedEventId ? undefined : setSelectedId}
        />
      </div>
    </div>
  )
}

function LockInArea({
  selectedId,
  lockedEventId,
  locking,
  onLockIn,
}: {
  selectedId: string | null
  lockedEventId: string | null
  locking: boolean
  onLockIn: () => void
}) {
  if (lockedEventId) {
    return (
      <div className={styles.lockInArea}>
        <button type="button" className={styles.lockInBtnLocked} disabled>
          ✓ Vote Locked
        </button>
        <p className={styles.lockInHint}>Waiting for other members to vote...</p>
      </div>
    )
  }

  if (!selectedId) return null

  return (
    <div className={styles.lockInArea}>
      <button
        type="button"
        className={styles.lockInBtn}
        onClick={onLockIn}
        disabled={locking}
      >
        {locking ? 'Locking...' : '🔒 Lock In Vote'}
      </button>
      <p className={styles.lockInHint}>This action cannot be undone</p>
    </div>
  )
}
