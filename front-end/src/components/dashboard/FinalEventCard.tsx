import type { DisplayEvent } from '@/lib/types'
import styles from './Dashboard.module.css'

interface FinalEventCardProps {
  event: DisplayEvent
  confirmed?: boolean
}

export function FinalEventCard({ event, confirmed = false }: FinalEventCardProps) {
  return (
    <div className={styles.finalizedBanner}>
      <span className={styles.finalBadge}>🎉 Chosen Event</span>
      <div className={styles.finalInfo}>
        <h3 className={styles.finalName}>{event.name}</h3>
        <p className={styles.finalVenue}>{event.venue}</p>
        {confirmed && (
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-success)',
            fontWeight: 'var(--font-weight-medium)',
            marginTop: '4px',
          }}>
            Your event has been confirmed, and a reservation has been made automatically.
          </p>
        )}
      </div>
      <div className={styles.finalMeta}>
        <span className={styles.finalTime}>📅 {event.dateTime}</span>
        <span className={styles.finalAddress}>📍 {event.address}</span>
      </div>
    </div>
  )
}
