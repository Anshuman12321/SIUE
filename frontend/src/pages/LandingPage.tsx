import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Stack, Flex } from '@/components/layout'
import { Button, Card, Text, Link as StyledLink } from '@/components/ui'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <PageLayout
      maxWidth="xl"
      header={
        <Flex
          gap="lg"
          align="center"
          justify="between"
          style={{ padding: 'var(--spacing-lg) var(--spacing-xl)' }}
        >
          <Text as="h1" size="xl" weight="bold" color="primary">
            Connect
          </Text>
          <Flex gap="md" align="center">
            <StyledLink to="/login" variant="underline">
              Log in
            </StyledLink>
            <Button variant="primary" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </Flex>
        </Flex>
      }
    >
      <section
        style={{
          padding: 'var(--spacing-3xl) var(--spacing-xl)',
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--spacing-3xl)',
        }}
      >
        <Stack gap="xl" align="center" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <Text as="h1" size="4xl" weight="bold" color="default">
            Find your people. Plan your vibe.
          </Text>
          <Text as="p" size="lg" color="muted">
            Connect with others who share your interests. Discover activities, match with groups, and make plans that actually happen.
          </Text>
          <Flex gap="md" justify="center" wrap>
            <Button variant="primary" size="lg" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </Flex>
        </Stack>
      </section>

      <section style={{ padding: 'var(--spacing-2xl) 0' }}>
        <Text as="h2" size="2xl" weight="bold" style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          Why Connect?
        </Text>
        <Flex gap="lg" justify="center" wrap style={{ maxWidth: 900, margin: '0 auto' }}>
          <Card variant="elevated" style={{ flex: '1 1 240px' }}>
            <Card.Header>
              <Text as="h3" size="lg" weight="semibold">
                Smart Matching
              </Text>
            </Card.Header>
            <Card.Body>
              <Text as="p" size="md" color="muted">
                Get matched with people who share your interests, budget, and availability.
              </Text>
            </Card.Body>
          </Card>
          <Card variant="elevated" style={{ flex: '1 1 240px' }}>
            <Card.Header>
              <Text as="h3" size="lg" weight="semibold">
                Discover Activities
              </Text>
            </Card.Header>
            <Card.Body>
              <Text as="p" size="md" color="muted">
                Explore events and venues on the map. Find what's happening near you.
              </Text>
            </Card.Body>
          </Card>
          <Card variant="elevated" style={{ flex: '1 1 240px' }}>
            <Card.Header>
              <Text as="h3" size="lg" weight="semibold">
                Plan Together
              </Text>
            </Card.Header>
            <Card.Body>
              <Text as="p" size="md" color="muted">
                Coordinate schedules, make reservations, and turn plans into reality.
              </Text>
            </Card.Body>
          </Card>
        </Flex>
      </section>

      <footer
        style={{
          padding: 'var(--spacing-xl)',
          textAlign: 'center',
          borderTop: '1px solid rgba(9, 44, 69, 0.08)',
          marginTop: 'var(--spacing-3xl)',
        }}
      >
        <Text as="p" size="sm" color="muted">
          © {new Date().getFullYear()} Connect. Find your people.
        </Text>
      </footer>
    </PageLayout>
  )
}
