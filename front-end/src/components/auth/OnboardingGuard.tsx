import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Spinner } from '@/components/ui'

export interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user } = useAuth()
  const { profile, loading } = useUserProfile(user ?? null)

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner size="lg" />
      </div>
    )
  }

  const interests = profile?.interests
  const hasCompletedOnboarding =
    interests != null &&
    typeof interests === 'object' &&
    Object.keys(interests as Record<string, unknown>).length > 0

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
