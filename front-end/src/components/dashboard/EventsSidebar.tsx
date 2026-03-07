import { useState } from 'react'
import type { MockEvent } from '@/data/mockData'
import styles from './Dashboard.module.css'

interface EventsSidebarProps {
  events: MockEvent[]
}

export function EventsSidebar({ events }: EventsSidebarProps) {
  const [votes, setVotes] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    events.forEach((e) => { init[e.id] = e.userVoted })
    return init
  })

  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    events.forEach((e) => { init[e.id] = e.votes })
    return init
  })

  const toggleVote = (id: string) => {
    const wasVoted = votes[id]
    setVotes((v) => ({ ...v, [id]: !wasVoted }))
    setVoteCounts((c) => ({ ...c, [id]: c[id] + (wasVoted ? -1 : 1) }))
  }

  const sorted = [...events].sort((a, b) => (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0))

  return (
    <div className={styles.eventsSidebar}>
      {sorted.map((event, i) => (
        <div key={event.id} className={styles.eventCard}>
          <div className={styles.eventRank}>#{i + 1}</div>
          <div className={styles.eventDetails}>
            <h3 className={styles.eventName}>{event.name}</h3>
            <p className={styles.eventVenue}>{event.venue}</p>
            <p className={styles.eventTime}>{event.dateTime}</p>
            <p className={styles.eventDesc}>{event.description}</p>
          </div>
          <div className={styles.eventVoteArea}>
            <button
              type="button"
              className={`${styles.voteBtn} ${votes[event.id] ? styles.voted : ''}`}
              onClick={() => toggleVote(event.id)}
            >
              {votes[event.id] ? '▲' : '△'}
            </button>
            <span className={styles.voteCount}>{voteCounts[event.id]}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
