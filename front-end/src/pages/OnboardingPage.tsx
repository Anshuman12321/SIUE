import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StepIndicator, OnboardingStep } from '@/components/onboarding'
import { Button, Input } from '@/components/ui'
import { PageLayout, Stack } from '@/components/layout'

const TOTAL_STEPS = 3

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')

  const handleComplete = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      navigate('/home', { replace: true })
    }
  }

  return (
    <PageLayout maxWidth="sm" centered>
      <Stack gap="xl" align="center">
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
              <Button variant="primary" size="lg" fullWidth onClick={handleComplete}>
                Go to Home
              </Button>
            </Stack>
          </OnboardingStep>
        )}
      </Stack>
    </PageLayout>
  )
}
