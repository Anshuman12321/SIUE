import { useAuth } from '@/contexts/AuthContext'
import { Button, Text } from '@/components/ui'
import { PageLayout, Stack } from '@/components/layout'

export function HomePage() {
  const { user, signOut } = useAuth()

  return (
    <PageLayout maxWidth="lg">
      <Stack gap="xl" align="center">
        <Text as="h1" size="2xl" weight="bold">
          Welcome, {user?.email ?? 'User'}!
        </Text>
        <Text as="p" size="md" color="muted">
          You're signed in. This is your home base.
        </Text>
        <Button variant="secondary" onClick={() => signOut()}>
          Log out
        </Button>
      </Stack>
    </PageLayout>
  )
}
