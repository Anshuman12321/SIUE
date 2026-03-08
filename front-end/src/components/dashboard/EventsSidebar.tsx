import type { MockEvent } from '@/data/mockData'
import { MOCK_CURRENT_USER_ID } from '@/data/mockData'
import styles from './Dashboard.module.css'

const MAX_VISIBLE_AVATARS = 4

interface EventsSidebarProps {
  events: MockEvent[]
  selectedId: string | null
  onSelect: (id: string) => void
  lockedEventId: string | null
}

export function EventsSidebar({ events, selectedId, onSelect, lockedEventId }: EventsSidebarProps) {
  return (
    <div className={styles.eventsSidebar}>
      {events.map((event) => {
        const isSelected = selectedId === event.id
        const isLocked = lockedEventId === event.id
        const isMuted = lockedEventId !== null && lockedEventId !== event.id
        const currentUserVotedHere = event.voters.some((v) => v.id === MOCK_CURRENT_USER_ID)

        const cardClass = [
          styles.eventCard,
          isSelected && !lockedEventId ? styles.eventCardSelected : '',
          isLocked ? styles.eventCardLocked : '',
          isMuted ? styles.eventCardMuted : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div
            key={event.id}
            className={cardClass}
            onClick={() => !lockedEventId && onSelect(event.id)}
            role="button"
            tabIndex={lockedEventId ? -1 : 0}
            onKeyDown={(e) => {
              if (!lockedEventId && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onSelect(event.id)
              }
            }}
          >
            {(isLocked || currentUserVotedHere) && (
              <span className={styles.lockedBadge}>✓</span>
            )}

            <div className={styles.eventDetails}>
              <h3 className={styles.eventName}>{event.name}</h3>
              <p className={styles.eventVenue}>{event.venue}</p>
              <p className={styles.eventTime}>{event.dateTime}</p>
              <p className={styles.eventDesc}>{event.description}</p>
            </div>

            <VoterAvatars voters={event.voters} />
          </div>
        )
      })}
    </div>
  )
}

function VoterAvatars({ voters }: { voters: MockEvent['voters'] }) {
  if (voters.length === 0) {
    return (
      <div className={styles.voterRow}>
        <span className={styles.noVoters}>No votes yet</span>
      </div>
    )
  }

  const visible = voters.slice(0, MAX_VISIBLE_AVATARS)
  const overflow = voters.length - MAX_VISIBLE_AVATARS

  return (
    <div className={styles.voterRow}>
      <div className={styles.voterAvatars}>
        {visible.map((v) => (
          <img key={v.id} src={v.avatarUrl} alt="" className={styles.voterAvatar} />
        ))}
        {overflow > 0 && (
          <span className={styles.voterOverflow}>+{overflow}</span>
        )}
      </div>
      <span className={styles.voterCount}>
        {voters.length} vote{voters.length !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
