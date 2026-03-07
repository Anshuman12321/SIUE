import { Card, Text, Button } from '@/components/ui'
import type { Event } from '@/data/mockData'

export interface FinalEventCardProps {
  event: Event
}

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function FinalEventCard({ event }: FinalEventCardProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.address || `${event.venue}`
  )}`

  return (
    <Card variant="elevated" style={{ maxWidth: 480 }}>
      <Card.Body>
        <Text as="h3" size="xl" weight="bold" style={{ marginBottom: 'var(--spacing-sm)' }}>
          {event.name}
        </Text>
        <Text as="p" size="md" weight="medium" color="primary" style={{ marginBottom: 'var(--spacing-xs)' }}>
          {event.venue}
        </Text>
        {event.address && (
          <Text as="p" size="sm" color="muted" style={{ marginBottom: 'var(--spacing-md)' }}>
            {event.address}
          </Text>
        )}
        <Text as="p" size="md" style={{ marginBottom: 'var(--spacing-md)' }}>
          {formatDateTime(event.dateTime)}
        </Text>
        {event.description && (
          <Text as="p" size="md" color="muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
            {event.description}
          </Text>
        )}
        <Button
          variant="primary"
          size="lg"
          onClick={() => window.open(mapsUrl, '_blank')}
        >
          Get Directions
        </Button>
      </Card.Body>
    </Card>
  )
}
