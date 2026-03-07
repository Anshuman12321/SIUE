import { MOCK_GROUP, MOCK_EVENTS, MOCK_FINAL_EVENT } from '@/data/mockData'
import { EventsSidebar } from './EventsSidebar'
import { EventsMap } from './EventsMap'
import { VotingTimer } from './VotingTimer'
import { FinalEventCard } from './FinalEventCard'
import { Flex } from '@/components/layout'
import { Text } from '@/components/ui'
import styles from './EventsTab.module.css'

export function EventsTab() {
  const isFinalized = MOCK_GROUP.eventFinalized

  if (isFinalized) {
    return (
      <div className={styles.finalized}>
        <div className={styles.celebration}>
          <Text as="h2" size="2xl" weight="bold" color="primary">
            Event chosen!
          </Text>
          <Text as="p" size="md" color="muted">
            Your group has decided. Here are the details.
          </Text>
        </div>
        <FinalEventCard event={MOCK_FINAL_EVENT} />
      </div>
    )
  }

  return (
    <div className={styles.voting}>
      <Flex justify="between" align="center" className={styles.header}>
        <Text as="h2" size="lg" weight="semibold">
          Vote for an event
        </Text>
        <VotingTimer endsAt={MOCK_GROUP.votingEndsAt} />
      </Flex>
      <div className={styles.layout}>
        <EventsSidebar events={MOCK_EVENTS} />
        <EventsMap events={MOCK_EVENTS} />
      </div>
    </div>
  )
}
