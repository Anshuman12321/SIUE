import type { MockEvent } from '@/data/mockData'
import styles from './Dashboard.module.css'

interface FinalEventCardProps {
  event: MockEvent
}

export function FinalEventCard({ event }: FinalEventCardProps) {
  return (
    <div className={styles.finalCard}>
      <div className={styles.finalBadge}>🎉 Chosen Event</div>
      <h3 className={styles.finalName}>{event.name}</h3>
      <p className={styles.finalVenue}>{event.venue}</p>
      <p className={styles.finalAddress}>{event.address}</p>
      <div className={styles.finalMeta}>
        <span className={styles.finalTime}>📅 {event.dateTime}</span>
        <span className={styles.finalVotes}>👍 {event.votes} votes</span>
      </div>
      <p className={styles.finalDesc}>{event.description}</p>
    </div>
  )
}
