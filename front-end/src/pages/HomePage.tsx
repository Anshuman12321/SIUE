import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Text, SegmentedControl } from '@/components/ui'
import { PageLayout, Stack, Flex } from '@/components/layout'
import { MOCK_USER_MATCHED } from '@/data/mockData'
import { MatchRevealAnimation } from '@/components/dashboard/MatchRevealAnimation'
import { GroupMembersTab } from '@/components/dashboard/GroupMembersTab'
import { EventsTab } from '@/components/dashboard/EventsTab'

type TabId = 'members' | 'events'

export function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showMatchAnimation, setShowMatchAnimation] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('members')

  const handleAnimationComplete = () => {
    setShowMatchAnimation(false)
  }

  if (!MOCK_USER_MATCHED) {
    return (
      <PageLayout maxWidth="lg">
        <Stack gap="xl" align="center">
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--spacing-3xl)',
              maxWidth: 400,
            }}
          >
            <Text as="h1" size="2xl" weight="bold" style={{ marginBottom: 'var(--spacing-md)' }}>
              Check back later
            </Text>
            <Text as="p" size="md" color="muted" style={{ marginBottom: 'var(--spacing-xl)' }}>
              You'll be notified when a matched group has been made for you.
            </Text>
            <Button variant="primary" size="lg" onClick={() => navigate('/preferences')}>
              Edit Preferences
            </Button>
          </div>
          <Button variant="ghost" onClick={() => signOut()}>
            Log out
          </Button>
        </Stack>
      </PageLayout>
    )
  }

  if (showMatchAnimation) {
    return (
      <MatchRevealAnimation onComplete={handleAnimationComplete} />
    )
  }

  return (
    <PageLayout maxWidth="xl">
      <Stack gap="xl">
        <Flex justify="between" align="center">
          <Text as="h1" size="xl" weight="bold">
            Your Group
          </Text>
          <Button variant="ghost" onClick={() => signOut()}>
            Log out
          </Button>
        </Flex>

        <SegmentedControl
          options={[
            { id: 'members', label: 'Group Members' },
            { id: 'events', label: 'Events' },
          ]}
          value={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />

        {activeTab === 'members' && <GroupMembersTab />}
        {activeTab === 'events' && <EventsTab />}
      </Stack>
    </PageLayout>
  )
}
