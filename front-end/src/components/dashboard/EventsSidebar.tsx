import { useState } from 'react'
import { Card } from '@/components/ui'
import { Text } from '@/components/ui'
import { Button } from '@/components/ui'
import { Stack } from '@/components/layout'
import type { Event } from '@/data/mockData'
import styles from './EventsSidebar.module.css'

export interface EventsSidebarProps {
  events: Event[]
  selectedEventId?: string | null
  onSelectEvent?: (id: string) => void
}

export function EventsSidebar({
  events,
  selectedEventId = null,
  onSelectEvent,
}: EventsSidebarProps) {
  const [votedId, setVotedId] = useState<string | null>(null)

  const handleVote = (eventId: string) => {
    setVotedId(eventId)
    // Hardcoded - no backend call
  }

  return (
    <aside className={styles.sidebar}>
      <Stack gap="md">
        {events.map((event) => (
          <Card
            key={event.id}
            variant="elevated"
            className={
              selectedEventId === event.id ? styles.selected : undefined
            }
            onClick={() => onSelectEvent?.(event.id)}
          >
            <div className={styles.eventCard}>
              <Text as="h3" size="md" weight="semibold">
                {event.name}
              </Text>
              <Text as="p" size="sm" color="muted">
                {event.venue}
              </Text>
              <Text as="p" size="xs" color="muted">
                {new Date(event.dateTime).toLocaleString()}
              </Text>
              <Text as="p" size="sm" style={{ marginTop: 'var(--spacing-xs)' }}>
                {event.description}
              </Text>
              <div className={styles.footer}>
                <Text as="span" size="sm" color="muted">
                  {event.votes} vote{event.votes !== 1 ? 's' : ''}
                </Text>
                <Button
                  variant={votedId === event.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVote(event.id)
                  }}
                >
                  {votedId === event.id ? 'Voted' : 'Vote'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </Stack>
    </aside>
  )
}
