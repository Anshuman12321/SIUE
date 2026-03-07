import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { StepIndicator, OnboardingStep } from '@/components/onboarding'
import { Button, Input, Alert } from '@/components/ui'
import { PageLayout, Stack } from '@/components/layout'

const TOTAL_STEPS = 3

/** Non-empty object to mark onboarding as complete */
const ONBOARDING_COMPLETE_INTERESTS = { onboardingComplete: true }

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      if (!user?.id) return
      setSaving(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('users')
        .update({ interests: ONBOARDING_COMPLETE_INTERESTS })
        .eq('id', user.id)

      setSaving(false)

      if (updateError) {
        setError(updateError.message)
        return
      }

      navigate('/home', { replace: true })
    }
  }

  return (
    <PageLayout maxWidth="sm" centered>
      <Stack gap="xl" align="center">
        {error && <Alert variant="error">{error}</Alert>}
        <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

        {step === 1 && (
          <OnboardingStep
            title="Welcome! What's your name?"
            description="We'd love to get to know you."
          >
            <Stack gap="lg">
              <Input
                label="Your name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleComplete}
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </Stack>
          </OnboardingStep>
        )}

        {step === 2 && (
          <OnboardingStep
            title="Tell us a bit about yourself"
            description="This helps us personalize your experience."
          >
            <Stack gap="lg">
              <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
                We'll add more preferences later. For now, you're all set to explore!
              </p>
              <Button variant="primary" size="lg" fullWidth onClick={handleComplete}>
                Continue
              </Button>
            </Stack>
          </OnboardingStep>
        )}

        {step === 3 && (
          <OnboardingStep
            title="You're all set!"
            description="Your account is ready. Let's get started."
          >
            <Stack gap="lg">
              <Button variant="primary" size="lg" fullWidth onClick={handleComplete} loading={saving}>
                Go to Home
              </Button>
            </Stack>
          </OnboardingStep>
        )}
      </Stack>
    </PageLayout>
  )
}
