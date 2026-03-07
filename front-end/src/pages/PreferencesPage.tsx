import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { Stack, Flex } from '@/components/layout'
import { Button, Input, Text, Card } from '@/components/ui'

const AGE_GROUPS = ['18-24', '25-34', '35-44', '45-54', '55+']
const BUDGET_OPTIONS = ['$', '$$', '$$$', '$$$$']
const ACTIVITY_OPTIONS = ['Drinks', 'Sports', 'Dining', 'Outdoors', 'Games', 'Music', 'Arts']

export function PreferencesPage() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [alcoholOk, setAlcoholOk] = useState<'yes' | 'no' | ''>('')
  const [budget, setBudget] = useState('')
  const [activities, setActivities] = useState<string[]>([])
  const [vibe, setVibe] = useState('')
  const [saved, setSaved] = useState(false)

  const toggleActivity = (activity: string) => {
    setActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Hardcoded save - store in localStorage for persistence across refresh
    const prefs = {
      location,
      ageGroup,
      alcoholOk,
      budget,
      activities,
      vibe,
    }
    localStorage.setItem('userPreferences', JSON.stringify(prefs))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PageLayout maxWidth="md">
      <Stack gap="xl">
        <Flex justify="between" align="center">
          <Text as="h1" size="2xl" weight="bold">
            Your Preferences
          </Text>
          <Button variant="ghost" onClick={() => navigate('/home')}>
            Back to Home
          </Button>
        </Flex>

        <Card variant="elevated">
          <Card.Body>
            <form onSubmit={handleSave}>
              <Stack gap="lg">
                <Input
                  label="Location"
                  placeholder="City or area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <div>
                  <Text as="span" size="sm" weight="medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                    Age group
                  </Text>
                  <Flex gap="sm" wrap>
                    {AGE_GROUPS.map((age) => (
                      <Button
                        key={age}
                        type="button"
                        variant={ageGroup === age ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setAgeGroup(age)}
                      >
                        {age}
                      </Button>
                    ))}
                  </Flex>
                </div>

                <div>
                  <Text as="span" size="sm" weight="medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                    Alcohol
                  </Text>
                  <Flex gap="sm">
                    <Button
                      type="button"
                      variant={alcoholOk === 'yes' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setAlcoholOk('yes')}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={alcoholOk === 'no' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setAlcoholOk('no')}
                    >
                      No
                    </Button>
                  </Flex>
                </div>

                <div>
                  <Text as="span" size="sm" weight="medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                    Budget
                  </Text>
                  <Flex gap="sm" wrap>
                    {BUDGET_OPTIONS.map((b) => (
                      <Button
                        key={b}
                        type="button"
                        variant={budget === b ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setBudget(b)}
                      >
                        {b}
                      </Button>
                    ))}
                  </Flex>
                </div>

                <div>
                  <Text as="span" size="sm" weight="medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                    Activity types
                  </Text>
                  <Flex gap="sm" wrap>
                    {ACTIVITY_OPTIONS.map((a) => (
                      <Button
                        key={a}
                        type="button"
                        variant={activities.includes(a) ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => toggleActivity(a)}
                      >
                        {a}
                      </Button>
                    ))}
                  </Flex>
                </div>

                <Input
                  label="Vibe"
                  placeholder="Describe your vibe (e.g. chill, energetic)"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                />

                <Button type="submit" variant="primary" size="lg">
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </Stack>
            </form>
          </Card.Body>
        </Card>
      </Stack>
    </PageLayout>
  )
}
