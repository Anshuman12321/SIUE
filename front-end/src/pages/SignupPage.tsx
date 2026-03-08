import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/userProfile'
import { AuthForm, AuthFormField } from '@/components/auth'
import { Button, Alert } from '@/components/ui'
import { PageLayout, Stack } from '@/components/layout'

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // If email confirmation is required, user won't be signed in yet
    if (data.user && !data.session) {
      setEmailSent(true)
      return
    }

    // No email confirmation - create user row and go to onboarding
    if (data.user?.id) {
      const { error: profileError } = await ensureUserProfile(data.user.id)
      if (profileError) {
        setError(profileError.message)
        return
      }
    }

    navigate('/onboarding', { replace: true })
  }

  if (emailSent) {
    return (
      <PageLayout maxWidth="sm" centered>
        <AuthForm
          title="Check your email"
          subtitle={`We sent a confirmation link to ${email}. Click the link to verify your account and get started.`}
          footerLink={{
            prompt: 'Already have an account?',
            linkText: 'Log in',
            to: '/login',
          }}
        >
          <Stack gap="lg">
            <Alert variant="success">
              Check your inbox and click the confirmation link. You'll be redirected to onboarding after verifying.
            </Alert>
          </Stack>
        </AuthForm>
      </PageLayout>
    )
  }

  return (
    <PageLayout maxWidth="sm" centered>
      <AuthForm
        title="Create an account"
        subtitle="Get started in seconds"
        footerLink={{
          prompt: 'Already have an account?',
          linkText: 'Log in',
          to: '/login',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            {error && (
              <Alert variant="error">{error}</Alert>
            )}
            <AuthFormField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <AuthFormField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <AuthFormField
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
            />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign up
            </Button>
          </Stack>
        </form>
      </AuthForm>
    </PageLayout>
  )
}
