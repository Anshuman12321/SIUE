import { MOCK_GROUP, MOCK_EVENTS, MOCK_FINAL_EVENT } from '@/data/mockData'
import { EventsSidebar } from './EventsSidebar'
import { EventsMap } from './EventsMap'
import { VotingTimer } from './VotingTimer'
import { FinalEventCard } from './FinalEventCard'
import styles from './Dashboard.module.css'

export function EventsTab() {
  const isFinalized = MOCK_GROUP.eventFinalized

  if (isFinalized) {
    return (
      <div className={styles.finalizedView}>
        <div className={styles.celebrationHeader}>
          <span className={styles.celebrationEmoji}>🎊</span>
          <h2 className={styles.sectionTitle}>Event Chosen!</h2>
          <p className={styles.sectionSubtitle}>Your group has decided. Here are the details.</p>
        </div>
        <FinalEventCard event={MOCK_FINAL_EVENT} />
      </div>
    )
  }

  return (
    <div>
      <div className={styles.eventsHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Vote for an Event</h2>
          <p className={styles.sectionSubtitle}>Upvote the events you'd like to do with your group.</p>
        </div>
        <VotingTimer endsAt={MOCK_GROUP.votingEndsAt} />
      </div>
      <div className={styles.eventsLayout}>
        <EventsSidebar events={MOCK_EVENTS} />
        <EventsMap events={MOCK_EVENTS} />
      </div>
    </div>
  )
}
