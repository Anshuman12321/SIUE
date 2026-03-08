import type { MockEvent } from '@/data/mockData'
import styles from './Dashboard.module.css'

interface FinalEventCardProps {
  event: MockEvent
}

export function FinalEventCard({ event }: FinalEventCardProps) {
  return (
    <div className={styles.finalizedBanner}>
      <span className={styles.finalBadge}>🎉 Chosen Event</span>
      <div className={styles.finalInfo}>
        <h3 className={styles.finalName}>{event.name}</h3>
        <p className={styles.finalVenue}>{event.venue}</p>
      </div>
      <div className={styles.finalMeta}>
        <span className={styles.finalTime}>📅 {event.dateTime}</span>
        <span className={styles.finalAddress}>📍 {event.address}</span>
      </div>
    </div>
  )
}
