import { useState, useMemo } from 'react'
import {
  MOCK_GROUP,
  MOCK_EVENTS,
  MOCK_GROUP_MEMBERS,
  MOCK_CURRENT_USER_ID,
} from '@/data/mockData'
import type { MockEvent } from '@/data/mockData'
import { supabase } from '@/lib/supabase'
import { EventsSidebar } from './EventsSidebar'
import { EventsMap } from './EventsMap'
import { VotingTimer } from './VotingTimer'
import { FinalEventCard } from './FinalEventCard'
import styles from './Dashboard.module.css'

export function EventsTab() {
  const [events, setEvents] = useState<MockEvent[]>(MOCK_EVENTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lockedEventId, setLockedEventId] = useState<string | null>(() => {
    const userVote = MOCK_EVENTS.find((e) =>
      e.voters.some((v) => v.id === MOCK_CURRENT_USER_ID),
    )
    return userVote?.id ?? null
  })
  const [locking, setLocking] = useState(false)

  const allVoted = useMemo(() => {
    const voterIds = new Set(events.flatMap((e) => e.voters.map((v) => v.id)))
    return MOCK_GROUP_MEMBERS.every((m) => voterIds.has(m.id))
  }, [events])

  const winningEvent = useMemo(() => {
    if (!allVoted) return null
    return [...events].sort((a, b) => b.voters.length - a.voters.length)[0] ?? null
  }, [allVoted, events])

  const handleLockIn = async () => {
    if (!selectedId || lockedEventId || locking) return
    setLocking(true)
    try {
      await supabase.from('votes').insert({
        group_id: MOCK_GROUP.id,
        user_id: MOCK_CURRENT_USER_ID,
        event_id: selectedId,
      })

      const currentMember = MOCK_GROUP_MEMBERS.find((m) => m.id === MOCK_CURRENT_USER_ID)
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedId
            ? {
                ...e,
                voters: [
                  ...e.voters,
                  {
                    id: MOCK_CURRENT_USER_ID,
                    avatarUrl: currentMember?.avatarUrl ?? '',
                  },
                ],
              }
            : e,
        ),
      )
      setLockedEventId(selectedId)
    } catch {
      // Supabase insert failed -- vote stays local anyway for demo
      setLockedEventId(selectedId)
    } finally {
      setLocking(false)
    }
  }

  if (allVoted && winningEvent) {
    return (
      <div className={styles.finalizedView}>
        <FinalEventCard event={winningEvent} />
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
        <VotingTimer endsAt={MOCK_GROUP.votingEndsAt} />
      </div>

      <div className={styles.eventsLayout}>
        <div>
          <EventsSidebar
            events={events}
            selectedId={selectedId}
            onSelect={setSelectedId}
            lockedEventId={lockedEventId}
          />
          <LockInArea
            selectedId={selectedId}
            lockedEventId={lockedEventId}
            locking={locking}
            onLockIn={handleLockIn}
          />
        </div>
        <EventsMap events={events} highlight={selectedId ?? lockedEventId} onSelect={lockedEventId ? undefined : setSelectedId} />
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
